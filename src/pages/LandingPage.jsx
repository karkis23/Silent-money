import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

/**
 * Main Landing Page & Admin Overview
 * 
 * DESIGN PHILOSOPHY:
 * This component acts as the main entry point for the platform. For standard users, it 
 * serves as a premium marketing portal. For administrators, it shows a quick summary
 * for platform monitoring.
 */
export default function LandingPage() {
    const { user, profile } = useAuth();
    const location = useLocation();
    const banToastShown = useRef(false);

    // Admin check - transforms the UI into an Admin view if the user has admin access
    const isAdmin = profile?.is_admin === true;

    // Check for banned parameter (only show once)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('banned') === 'true' && !banToastShown.current) {
            banToastShown.current = true;
            toast.error('🚫 Your account has been banned by an administrator. You no longer have access to this platform.', {
                duration: 8000,
                position: 'top-center',
                style: {
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 'bold',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    border: '2px solid #fca5a5'
                }
            });
        }
    }, [location]);

    /**
     * Platform stats (Admin Only)
     * Fetched via parallel requests for speed.
     */
    const [adminStats, setAdminStats] = useState({
        totalIdeas: 0,
        pendingAudits: 0,
        totalUsers: 0,
        totalFranchises: 0
    });
    const [statsLoading, setStatsLoading] = useState(isAdmin);

    const [passiveGoal, setPassiveGoal] = useState(145000);
    const sourcesFound = Math.floor(passiveGoal / 12000) + 2;

    const [topIdeas, setTopIdeas] = useState([]);
    const [topLoading, setTopLoading] = useState(true);
    useEffect(() => {
        const fetchTopIdeas = async () => {
            // First, try to get featured items
            let { data } = await supabase
                .from('income_ideas')
                .select('*, categories(name, icon)')
                .eq('is_approved', true)
                .is('deleted_at', null)
                .eq('is_featured', true)
                .limit(3);

            // If we don't have 3 featured items, fill with most upvoted items
            if (!data || data.length < 3) {
                const excludedIds = data ? data.map(item => item.id) : [];
                const { data: upvoted } = await supabase
                    .from('income_ideas')
                    .select('*, categories(name, icon)')
                    .eq('is_approved', true)
                    .is('deleted_at', null)
                    .not('id', 'in', excludedIds.length > 0 ? excludedIds : [null]) // Handle empty array
                    .order('upvotes_count', { ascending: false })
                    .limit(3 - (data?.length || 0));

                if (upvoted) {
                    data = [...(data || []), ...upvoted];
                }
            }

            if (data) {
                // If user is logged in, fetch their votes
                let ideasWithVotes = data.map(idea => ({ ...idea, hasVoted: false }));

                if (profile) {
                    const { data: userVotes } = await supabase
                        .from('income_ideas_votes')
                        .select('idea_id')
                        .eq('user_id', profile.id)
                        .in('idea_id', data.map(i => i.id));

                    if (userVotes) {
                        const votedIds = new Set(userVotes.map(v => v.idea_id));
                        ideasWithVotes = ideasWithVotes.map(idea => ({
                            ...idea,
                            hasVoted: votedIds.has(idea.id)
                        }));
                    }
                }
                setTopIdeas(ideasWithVotes);
            }
            setTopLoading(false);
        };

        const fetchAdminStats = async () => {
            if (!isAdmin) return;
            setStatsLoading(true);
            try {
                const [ideas, audits, users, franchises] = await Promise.all([
                    supabase.from('income_ideas').select('*', { count: 'exact', head: true }).is('deleted_at', null),
                    supabase.from('expert_audit_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('franchises').select('*', { count: 'exact', head: true })
                ]);

                setAdminStats({
                    totalIdeas: ideas.count || 0,
                    pendingAudits: audits.count || 0,
                    totalUsers: users.count || 0,
                    totalFranchises: franchises.count || 0
                });
            } catch (err) {
                console.error("Stats failure:", err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchTopIdeas();
        if (isAdmin) fetchAdminStats();
    }, [isAdmin, profile]);

    const handleVote = async (e, ideaId, currentVotes, hasVoted) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            window.location.href = '/login';
            return;
        }

        const newHasVoted = !hasVoted;
        const newVotesCount = newHasVoted ? currentVotes + 1 : Math.max(0, currentVotes - 1);

        // Optimistic UI Update
        setTopIdeas(prevIdeas => prevIdeas.map(idea =>
            idea.id === ideaId
                ? { ...idea, upvotes_count: newVotesCount, hasVoted: newHasVoted }
                : idea
        ));

        if (newHasVoted) {
            await supabase.from('income_ideas_votes').insert([{ user_id: user.id, idea_id: ideaId }]);
        } else {
            await supabase.from('income_ideas_votes').delete().eq('user_id', user.id).eq('idea_id', ideaId);
        }
    };

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-[#FBFBFD] pt-24 md:pt-32 pb-20 px-4">
                <SEO title="Admin Overview | Silent Money" />

                <div className="max-w-7xl mx-auto">
                    {/* Admin Hero */}
                    <header className="mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal-900 border border-charcoal-800 mb-6"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Admin Access</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-7xl font-black text-charcoal-950 tracking-tightest leading-tight mb-4">
                            Admin <span className="text-primary-600">Panel.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-charcoal-500 font-medium max-w-2xl">
                            Welcome back. Manage your platform, approve new ideas, and moderate user content here.
                        </p>
                    </header>

                    {/* Platform Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
                        {[
                            { label: 'Total Ideas', value: adminStats.totalIdeas, sub: 'Live Ideas', icon: '🏛️', link: '/admin?tab=ideas' },
                            { label: 'Pending Audits', value: adminStats.pendingAudits, sub: 'Needs Review', icon: '🔍', link: '/admin?tab=audits', alert: adminStats.pendingAudits > 0 },
                            { label: 'Active Users', value: adminStats.totalUsers, sub: 'Registered Members', icon: '👥', link: '/admin?tab=users' },
                            { label: 'Franchises', value: adminStats.totalFranchises, sub: 'Business Listings', icon: '🏢', link: '/admin?tab=franchises' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group"
                            >
                                <Link
                                    to={stat.link}
                                    className="block bg-white border border-charcoal-100 p-8 rounded-[2.5rem] shadow-xl shadow-charcoal-200/20 relative group hover:border-primary-300 hover:shadow-primary-100/30 transition-all h-full"
                                >
                                    <div className="text-3xl md:text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 duration-500">{stat.icon}</div>
                                    <div className="text-[9px] md:text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="flex items-end gap-2 md:gap-3">
                                        <div className="text-2xl md:text-4xl font-black text-charcoal-900 tracking-tighter">
                                            {statsLoading ? '...' : stat.value}
                                        </div>
                                        <div className={`text-[8px] md:text-[10px] font-bold mb-1.5 ${stat.alert ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {stat.sub}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-charcoal-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Go to Tab</span>
                                        <span className="text-primary-600">→</span>
                                    </div>
                                    {stat.alert && (
                                        <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* System Controls (Quick Actions) */}
                    <div className="grid lg:grid-cols-3 gap-8 mb-16">
                        <div className="lg:col-span-2">
                            <div className="bg-charcoal-950 rounded-[3rem] p-10 text-white relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px]" />
                                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-8">Admin Controls</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link to="/admin" className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                                        <div className="text-[11px] font-black text-primary-400 uppercase tracking-widest mb-2">Platform Management</div>
                                        <div className="text-xl font-black mb-4">Admin Dashboard</div>
                                        <div className="text-[9px] text-white/50 leading-relaxed">Manage ideas, franchises, and users.</div>
                                    </Link>
                                    <Link to="/post-franchise" className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                                        <div className="text-[11px] font-black text-accent uppercase tracking-widest mb-2">Growth</div>
                                        <div className="text-xl font-black mb-4">Post New Opportunity</div>
                                        <div className="text-[9px] text-white/50 leading-relaxed">Instantly add new franchises or ideas to the platform.</div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white border border-charcoal-100 rounded-[3rem] p-10 h-full flex flex-col">
                                <h3 className="text-xs font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8">System Health</h3>
                                <div className="space-y-6 flex-1">
                                    {[
                                        { label: 'Platform Speed', status: 'Optimal', val: '24ms' },
                                        { label: 'Data Sync', status: 'Active', val: '100%' },
                                        { label: 'Database Health', status: 'Healthy', val: '99.9%' }
                                    ].map((check, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div>
                                                <div className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">{check.label}</div>
                                                <div className="text-[9px] text-emerald-500 font-bold uppercase">{check.status}</div>
                                            </div>
                                            <div className="text-sm font-black text-charcoal-400">{check.val}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-8 mt-8 border-t border-charcoal-50">
                                    <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-[0.2em] italic">Standard Security Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="bg-cream-50 overflow-hidden">
            <SEO />
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-24 md:pt-20">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary-100/40 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            variants={stagger}
                            initial="initial"
                            animate="animate"
                            className="text-left"
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-charcoal-100 mb-6">
                                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                                <span className="text-sm font-bold text-charcoal-900 tracking-tight">🇮🇳 Trusted by 10,000+ Indians</span>
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-extrabold text-charcoal-950 mb-6 leading-[1] tracking-tightest">
                                Build Your <br />
                                <span className="text-gradient">Income Portfolio</span> <br />
                                <span className="text-primary-600">Quietly.</span>
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-charcoal-600 mb-10 max-w-xl leading-relaxed">
                                Beyond the noise of &apos;get-rich-quick&apos; schemes, discover vetted,
                                <span className="font-bold text-charcoal-900"> data-backed passive income streams</span> tailored for the Indian landscape.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to={user ? "/ideas" : "/signup"}
                                    className="btn-primary text-center group"
                                >
                                    {user ? "Explore Ideas" : "Get Started Now"}
                                    <motion.span
                                        className="inline-block ml-2"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        →
                                    </motion.span>
                                </Link>
                                {!user && (
                                    <Link
                                        to="/about"
                                        className="btn-secondary text-center"
                                    >
                                        See How it Works
                                    </Link>
                                )}
                            </motion.div>

                            {/* Trust Badge */}
                            <motion.div variants={fadeInUp} className="mt-12 pt-8 border-t border-charcoal-100 flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[
                                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
                                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden',
                                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala'
                                    ].map((url, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-charcoal-100">
                                            <img src={url} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-charcoal-500 font-medium">
                                    <span className="text-charcoal-900 font-bold">4.9/5</span> rating from our community
                                </p>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 glass-card p-6 rotate-2 shadow-2xl overflow-visible">
                                <div className="mb-6 bg-charcoal-950/5 p-8 rounded-3xl border border-white/50 backdrop-blur-md">
                                    <div className="flex justify-between items-end mb-4 px-1">
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Target Monthly Yield</div>
                                        <div className="text-2xl font-black text-primary-600">₹{passiveGoal.toLocaleString('en-IN')}</div>
                                    </div>
                                    <input
                                        type="range"
                                        min="10000"
                                        max="500000"
                                        step="5000"
                                        value={passiveGoal}
                                        onChange={(e) => setPassiveGoal(Number(e.target.value))}
                                        className="w-full accent-primary-600 h-1.5 bg-charcoal-200 rounded-full cursor-pointer appearance-none"
                                    />
                                </div>

                                <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426"
                                    className="rounded-xl shadow-inner object-cover h-64 w-full brightness-90 grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                                    alt="Dashboard Preview"
                                    loading="lazy"
                                    decoding="async"
                                />

                                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-premium border border-charcoal-100 max-w-[220px] animate-float">
                                    <div className="text-emerald-500 font-bold text-3xl">₹{passiveGoal.toLocaleString('en-IN')}</div>
                                    <div className="text-charcoal-400 text-[9px] font-black uppercase tracking-widest mt-1">Monthly Passive Reward</div>
                                </div>

                                <div className="absolute -top-10 -right-10 bg-primary-600 text-white p-7 rounded-3xl shadow-button max-w-[200px] animate-pulse-slow border-4 border-white">
                                    <div className="font-bold text-3xl leading-none mb-1 text-white">{sourcesFound}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-primary-100/80">Vetted Sources</div>
                                </div>
                            </div>
                            {/* Glow effect behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-200/20 blur-[100px] -z-10 rounded-full" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Top Rated Ideas (Leaderboard) */}
            <section className="py-16 md:py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Top Rated</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-charcoal-950 tracking-tighter">
                                Our Best <span className="text-primary-600">Ideas</span>
                            </h2>
                        </div>
                        <Link to="/ideas" className="btn-secondary py-3 text-[10px] uppercase font-black tracking-widest w-full md:w-auto text-center font-mono">View All Ideas →</Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {topLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-64 rounded-3xl bg-white border border-charcoal-100 animate-pulse" />
                            ))
                        ) : (
                            topIdeas.map((idea, i) => (
                                <motion.div
                                    key={idea.id}
                                    whileHover={{ y: -10 }}
                                    className="group relative bg-white border border-charcoal-100 rounded-[2.5rem] p-8 hover:border-primary-300 hover:shadow-premium transition-all"
                                >
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-primary-200 z-10">
                                        #{i + 1}
                                    </div>
                                    <div className="relative h-48 overflow-hidden -m-8 mb-8 rounded-t-[2.5rem]">
                                        <img
                                            src={idea.image_url || 'https://images.unsplash.com/photo-1579621970795-87faff2f9160?q=80&w=1000'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt={idea.title}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 to-transparent" />
                                        <div className="absolute bottom-4 left-4 flex gap-2">
                                            <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[7px] font-black tracking-widest uppercase shadow-lg">
                                                ✓ VERIFIED
                                            </span>
                                            {idea.is_premium && (
                                                <span className="bg-primary-600 text-white px-2 py-1 rounded-lg text-[7px] font-black tracking-widest uppercase shadow-lg">
                                                    ⭐ PREMIUM
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <span className="text-3xl">{idea.categories?.icon}</span>
                                        <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">{idea.categories?.name}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-charcoal-950 group-hover:text-primary-600 transition-colors mb-3 tracking-tight">
                                        {idea.title}
                                    </h3>
                                    <p className="text-sm text-charcoal-500 font-medium mb-8 line-clamp-2">
                                        {idea.short_description}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-charcoal-50 mt-auto">
                                        <div>
                                            <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Expected Income</div>
                                            <div className="text-lg font-black text-charcoal-900 leading-none">
                                                ₹{(idea.monthly_income_min / 1000).toFixed(0)}k<span className="text-xs text-charcoal-400 pl-0.5">/mo</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => handleVote(e, idea.id, idea.upvotes_count || 0, idea.hasVoted)}
                                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl border transition-all ${idea.hasVoted
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                                    : 'bg-charcoal-50 border-charcoal-100 text-charcoal-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-bold leading-none">{idea.upvotes_count || 0}</span>
                                                <span className="text-[7px] font-black uppercase tracking-tighter">{idea.hasVoted ? 'Voted' : 'Like'}</span>
                                            </button>

                                            <Link to={`/ideas/${idea.slug}`} className="w-12 h-12 rounded-2xl bg-charcoal-950 flex items-center justify-center text-white group-hover:bg-primary-600 transition-all shadow-xl shrink-0">
                                                →
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Content Restriction Notice (if not logged in) */}
            {!user && (
                <section className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-charcoal-950 mb-6 px-2">
                                Exclusive Insights <span className="text-primary-600">Unlocked</span> After Sign Up
                            </h2>
                            <p className="text-base md:text-lg text-charcoal-600 max-w-2xl mx-auto px-4">
                                To protect the quality of our community and the integrity of our data,
                                detailed income ideas and market analysis are reserved for registered members.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Vetted Ideas", desc: "Detailed breakdown of 50+ real passive income sources.", icon: "💎" },
                                { title: "Franchise Deep Dives", desc: "ROI, investment, and risk analysis for top Indian franchises.", icon: "🏢" },
                                { title: "Profit Predictors", desc: "Custom calculators for each income category.", icon: "📈" }
                            ].map((item, i) => (
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    key={i}
                                    className="p-8 rounded-3xl bg-cream-50 border border-charcoal-100 hover:border-primary-200 transition-all shadow-sm"
                                >
                                    <div className="text-4xl mb-6">{item.icon}</div>
                                    <h3 className="text-xl font-bold text-charcoal-900 mb-3">{item.title}</h3>
                                    <p className="text-charcoal-600 leading-relaxed font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works with Premium Steps */}
            <section className="py-24 bg-charcoal-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-600 via-transparent to-transparent" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16 md:mb-20">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">The Journey to <span className="text-accent">Silent Wealth</span></h2>
                        <p className="text-charcoal-400 text-lg md:text-xl font-medium">Four simple steps to start your secondary income stream.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-12">
                        {[
                            { step: "01", title: "Join Community", desc: "Create your free account to access the directory of assets." },
                            { step: "02", title: "Select Strategy", desc: "Filter by investment size, risk, and category." },
                            { step: "03", title: "Analyze Math", desc: "Use our tools to verify the profit potential." },
                            { step: "04", title: "Start Building", desc: "Get actionable next steps to launch your income stream." }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="text-7xl font-black text-white/5 absolute -top-10 left-0 group-hover:text-primary-500/10 transition-colors">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 relative z-10 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                                <p className="text-charcoal-400 font-medium relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-24"
            >
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-[100px]" />
                        </div>

                        <h2 className="text-3xl md:text-6xl font-bold mb-8 relative z-10 leading-tight">
                            Stop Trading Time <br />For Money.
                        </h2>
                        <p className="text-xl mb-12 text-primary-100 max-w-2xl mx-auto font-medium">
                            Join 10,000+ smart Indians building their portfolios today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                            <Link
                                to={user ? '/dashboard' : '/signup'}
                                className="bg-white text-primary-600 font-bold px-12 py-5 rounded-2xl hover:bg-white hover:shadow-button transition-all text-lg shadow-xl hover:scale-105"
                            >
                                {user ? 'Go to Dashboard' : 'Join Silent Money'}
                            </Link>
                        </div>
                        <p className="mt-8 text-primary-200 text-sm font-semibold opacity-80">
                            No credit card required • Verified data • Weekly updates
                        </p>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
