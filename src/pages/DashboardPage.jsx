import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [savedIdeas, setSavedIdeas] = useState([]);
    const [savedFranchises, setSavedFranchises] = useState([]);
    const [savedCalculations, setSavedCalculations] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [myAudits, setMyAudits] = useState([]);
    const [myIdeaCount, setMyIdeaCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [myFranchiseCount, setMyFranchiseCount] = useState(0);
    const [activeTab, setActiveTab] = useState('ideas');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);

            // Fetch saved ideas
            const { data: saved, error: savedError } = await supabase
                .from('user_saved_ideas')
                .select(`
                    *,
                    income_ideas (
                        id,
                        title,
                        slug,
                        short_description,
                        monthly_income_min,
                        monthly_income_max,
                        effort_level,
                        author_id
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Fetch saved franchises
            const { data: savedFran, error: franSavedError } = await supabase
                .from('user_saved_franchises')
                .select(`
                    *,
                    franchises (
                        *
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Fetch count of ideas posted by user
            const { count, error: countError } = await supabase
                .from('income_ideas')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', user.id);

            // Fetch count of franchises posted by user
            const { count: fCount, error: fError } = await supabase
                .from('franchises')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', user.id);

            // Fetch user idea reviews
            const { data: ideaReviews, error: reviewsError } = await supabase
                .from('income_idea_reviews')
                .select(`
                    *,
                    income_ideas (
                        title,
                        slug
                    )
                `)
                .eq('user_id', user.id);

            // Fetch user franchise reviews
            const { data: franchiseReviews, error: fReviewsError } = await supabase
                .from('franchise_reviews')
                .select(`
                    *,
                    franchises (
                        name,
                        slug
                    )
                `)
                .eq('user_id', user.id);

            // Fetch saved calculations with explicit error catching
            const { data: calcs, error: calcError } = await supabase
                .from('roi_calculations')
                .select(`
                    *,
                    income_ideas:idea_id (title, slug),
                    franchises:franchise_id (name, slug)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Fetch expert audit requests
            const { data: audits, error: auditError } = await supabase
                .from('expert_audit_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (savedError) console.error('Error fetching saved ideas:', savedError);
            if (franSavedError) console.error('Error fetching saved franchises:', franSavedError);
            if (countError) console.error('Error fetching idea count:', countError);
            if (fError) console.error('Error fetching franchise count:', fError);
            if (reviewsError) console.error('Error fetching idea reviews:', reviewsError);
            if (fReviewsError) console.error('Error fetching franchise reviews:', fReviewsError);
            if (calcError) console.error('Error fetching calculations:', calcError);
            if (auditError) console.error('Error fetching audits:', auditError);

            const allReviews = [
                ...(ideaReviews || []).map(r => ({ ...r, assetType: 'blueprint', asset: r.income_ideas, title: r.income_ideas?.title, link: `/ideas/${r.income_ideas?.slug}` })),
                ...(franchiseReviews || []).map(r => ({ ...r, assetType: 'franchise', asset: r.franchises, title: r.franchises?.name, link: `/franchise/${r.franchises?.slug}` }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setSavedIdeas(saved || []);
            setSavedFranchises(savedFran || []);
            setSavedCalculations(calcs || []);
            setMyReviews(allReviews);
            setMyAudits(audits || []);
            setMyIdeaCount(count || 0);
            setMyFranchiseCount(fCount || 0);
            setLoading(false);
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleDeleteIdea = async (e, savedId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to remove this blueprint from your vault?')) return;

        const { error } = await supabase
            .from('user_saved_ideas')
            .delete()
            .eq('id', savedId);

        if (!error) {
            setSavedIdeas(prev => prev.filter(item => item.id !== savedId));
        } else {
            console.error('Error removing idea:', error);
        }
    };

    const handleDeleteFranchise = async (e, savedId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to remove this franchise from your vault?')) return;

        const { error } = await supabase
            .from('user_saved_franchises')
            .delete()
            .eq('id', savedId);

        if (!error) {
            setSavedFranchises(prev => prev.filter(item => item.id !== savedId));
        } else {
            console.error('Error removing franchise:', error);
        }
    };

    const calculatePotentialIncome = () => {
        if (!savedIdeas.length) return 0;
        return savedIdeas.reduce((total, item) => {
            return total + (item.income_ideas?.monthly_income_min || 0);
        }, 0);
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-32">
            <SEO
                title="Commander Dashboard | Vaulted Assets"
                description="Manage your saved blueprints, track ROI progress, and monitor your passive income fleet in real-time."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center text-4xl shadow-2xl border border-charcoal-100 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <span className="text-primary-600 font-black tracking-tighter">{profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Operational Commander</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 tracking-tighter leading-none">
                                Welcome, <span className="text-primary-600">{profile?.full_name?.split(' ')[0] || 'Commander'}</span>
                            </h1>
                            <p className="text-charcoal-500 font-medium mt-2">
                                Monitoring {savedIdeas.length + savedFranchises.length} active wealth engines & {myReviews.length} intel logs.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/edit-profile"
                        className="btn-secondary flex items-center gap-3 px-8 text-xs h-14"
                    >
                        <span>⚙️</span> COMMAND CONFIG
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="card group hover-lift">
                        {loading ? (
                            <>
                                <div className="skeleton h-4 w-24 mb-2 rounded"></div>
                                <div className="skeleton h-10 w-16 rounded"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-2 font-mono">Vault Assets</div>
                                <div className="text-4xl font-black text-charcoal-950 tracking-tighter">
                                    {savedIdeas.length + savedFranchises.length}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="card group hover-lift">
                        {loading ? (
                            <>
                                <div className="skeleton h-4 w-28 mb-2 rounded"></div>
                                <div className="skeleton h-10 w-12 rounded"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-2 font-mono">My Deployments</div>
                                <div className="text-4xl font-black text-charcoal-950 tracking-tighter">
                                    {myIdeaCount + myFranchiseCount}
                                </div>
                                <Link to="/my-ideas" className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-4 inline-block hover:underline">Manage Fleet →</Link>
                            </>
                        )}
                    </div>

                    <div className="card bg-gradient-to-br from-emerald-500 to-emerald-700 border-none group shadow-2xl shadow-emerald-500/20 hover-lift relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        {loading ? (
                            <>
                                <div className="skeleton h-4 w-28 mb-2 rounded bg-white/20"></div>
                                <div className="skeleton h-10 w-20 rounded bg-white/20"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-mono relative z-10">Projected Yield</div>
                                <div className="text-4xl font-black text-white tracking-tighter relative z-10">
                                    ₹{(calculatePotentialIncome() / 1000).toFixed(1)}k<span className="text-lg text-white/50 ml-1">/mo</span>
                                </div>
                                {/* Yield Trajectory Indicator */}
                                <div className="mt-4 flex items-center gap-2 relative z-10">
                                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min((calculatePotentialIncome() / 500000) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
                                        {Math.min((calculatePotentialIncome() / 500000) * 100, 100).toFixed(0)}%
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-primary-600 p-8 rounded-[2.5rem] shadow-2xl shadow-primary-600/20 flex flex-col justify-between hover-lift">
                        <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4 font-mono">New Deployment</div>
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/add-idea"
                                className="w-full bg-white text-primary-700 font-black text-[10px] py-4 rounded-2xl text-center uppercase tracking-widest hover:bg-cream-50 transition-all shadow-xl shadow-primary-700/20 hover:scale-105 active:scale-95"
                            >
                                + Forge Idea
                            </Link>
                            <Link
                                to="/post-franchise"
                                className="w-full bg-primary-800 text-white font-black text-[10px] py-4 rounded-2xl text-center uppercase tracking-widest hover:bg-primary-900 transition-all hover:scale-105 active:scale-95"
                            >
                                + Deploy Brand
                            </Link>
                            <Link
                                to="/compare"
                                className="w-full bg-white/10 text-white border border-white/20 font-black text-[10px] py-4 rounded-2xl text-center uppercase tracking-widest hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                            >
                                ⚔️ Compare Assets
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex gap-8 border-b border-charcoal-100 mb-8">
                    <button
                        onClick={() => setActiveTab('ideas')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'ideas' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        Saved Blueprints ({savedIdeas.length})
                        {activeTab === 'ideas' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('franchises')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'franchises' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        Saved Franchises ({savedFranchises.length})
                        {activeTab === 'franchises' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('intel')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'intel' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        My Intel ({myReviews.length})
                        {activeTab === 'intel' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('projections')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'projections' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        ROI Projections ({savedCalculations.length})
                        {activeTab === 'projections' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('audits')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'audits' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        Lead Accelerator ({myAudits.length})
                        {activeTab === 'audits' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                    </button>
                </div>

                {/* Section Content */}
                <div className="bg-white rounded-xl shadow-premium border border-charcoal-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-charcoal-500 font-bold">Syncing Vault...</p>
                        </div>
                    ) : activeTab === 'ideas' ? (
                        <>
                            <div className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/30 flex justify-between items-center">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Saved Income Blueprints</h2>
                                <Link to="/ideas" className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Browse More →</Link>
                            </div>
                            {savedIdeas.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="text-4xl mb-4">🔖</div>
                                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Saved Blueprints</h3>
                                    <p className="text-charcoal-500 mb-6 text-sm font-medium">Explore the discovery hub to track high-yield income streams.</p>
                                    <Link to="/ideas" className="btn-primary py-2 px-6 text-xs">Explore Hub</Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-charcoal-100">
                                    {savedIdeas.map((saved) => (
                                        <div key={saved.id} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                            <div className="flex-1">
                                                <Link to={`/ideas/${saved.income_ideas.slug}`} className="text-lg font-black text-charcoal-900 group-hover:text-primary-600 transition-colors">
                                                    {saved.income_ideas.title}
                                                </Link>
                                                <p className="text-sm text-charcoal-500 mb-2 font-medium line-clamp-1">{saved.income_ideas.short_description}</p>
                                                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                                                    <span className="text-emerald-600">₹{(saved.income_ideas.monthly_income_min / 1000).toFixed(0)}k/mo Yield</span>
                                                    <span>• {saved.income_ideas.effort_level} Effort</span>
                                                    <span className="bg-charcoal-900 text-white px-2 py-0.5 rounded-md text-[8px] animate-pulse">
                                                        📡 {saved.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleDeleteIdea(e, saved.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-charcoal-100 text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Remove from Vault"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <Link to={`/ideas/${saved.income_ideas.slug}`} className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">View Asset</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : activeTab === 'franchises' ? (
                        <>
                            <div className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/30 flex justify-between items-center">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Saved Franchise Opportunities</h2>
                                <Link to="/franchise" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Explore Brands →</Link>
                            </div>
                            {savedFranchises.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="text-4xl mb-4">🏢</div>
                                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Saved Franchises</h3>
                                    <p className="text-charcoal-500 mb-6 text-sm font-medium">Bookmark established brands with high ROI potential.</p>
                                    <Link to="/franchise" className="btn-primary py-2 px-6 text-xs bg-emerald-600 hover:bg-emerald-700">View Franchises</Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-charcoal-100">
                                    {savedFranchises.map((saved) => (
                                        <div key={saved.id} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                            <div className="flex-1">
                                                <Link to={`/franchise/${saved.franchises.slug}`} className="text-lg font-black text-charcoal-900 group-hover:text-emerald-600 transition-colors">
                                                    {saved.franchises.name}
                                                </Link>
                                                <p className="text-sm text-charcoal-500 mb-2 font-medium line-clamp-1">{saved.franchises.description}</p>
                                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                                                    <span className="text-emerald-600">{saved.franchises.roi_months_min}-{saved.franchises.roi_months_max}m ROI</span>
                                                    <span>• ₹{(saved.franchises.investment_min / 100000).toFixed(1)}L Capital</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleDeleteFranchise(e, saved.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-charcoal-100 text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Remove from Vault"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <Link to={`/franchise/${saved.franchises.slug}`} className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Open Portal</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : activeTab === 'projections' ? (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Financial Intelligence Reports</h2>
                            </div>

                            {savedCalculations.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="text-4xl mb-4">📊</div>
                                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Projections Found</h3>
                                    <p className="text-charcoal-500 text-sm font-medium">Use the ROI calculator on any asset to save your custom projections.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedCalculations.map(calc => (
                                        <div key={calc.id} className="p-6 bg-charcoal-50 rounded-3xl border border-charcoal-100 hover:border-primary-200 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">
                                                        {calc.income_ideas ? 'Blueprint' : 'Franchise'}
                                                    </div>
                                                    <Link
                                                        to={calc.income_ideas ? `/ideas/${calc.income_ideas.slug}` : `/franchise/${calc.franchises.slug}`}
                                                        className="text-sm font-black text-charcoal-950 uppercase tracking-tight group-hover:text-primary-600 transition-colors"
                                                    >
                                                        {calc.income_ideas?.title || calc.franchises?.name}
                                                    </Link>
                                                </div>
                                                <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                    +{Number(calc.roi_percentage || 0).toFixed(0)}% ROI
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="p-3 bg-white rounded-2xl border border-charcoal-100">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Net Profit</div>
                                                    <div className="text-xs font-black text-charcoal-900">₹{calc.net_profit.toLocaleString()}</div>
                                                </div>
                                                <div className="p-3 bg-white rounded-2xl border border-charcoal-100">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Break Even</div>
                                                    <div className="text-xs font-black text-charcoal-900">{calc.break_even_months || 'N/A'} Mo</div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-[8px] font-black text-charcoal-400 uppercase tracking-widest pt-4 border-t border-charcoal-100">
                                                <span>{new Date(calc.created_at).toLocaleDateString()}</span>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Delete projection?')) {
                                                            await supabase.from('roi_calculations').delete().eq('id', calc.id);
                                                            setSavedCalculations(prev => prev.filter(p => p.id !== calc.id));
                                                        }
                                                    }}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'audits' ? (
                        <>
                            <div className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/30 flex justify-between items-center">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Expert Audit Accelerator</h2>
                                <span className="bg-primary-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase">Active Analysis</span>
                            </div>
                            {myAudits.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="text-4xl mb-4">🚀</div>
                                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Audits Requested</h3>
                                    <p className="text-charcoal-500 mb-6 text-sm font-medium">Request a deep-dive feasibility report for any brand you're interested in.</p>
                                    <Link to="/franchise" className="btn-primary py-2 px-6 text-xs">Request Audit</Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-charcoal-50 border-b border-charcoal-100">
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest font-mono">Brand Details</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest font-mono">Budget/Target</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest font-mono">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest font-mono text-right">Requested</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-charcoal-100">
                                            {myAudits.map((audit) => (
                                                <tr key={audit.id} className="hover:bg-cream-50 transition-colors group">
                                                    <td className="px-6 py-6 font-mono">
                                                        <div className="text-sm font-black text-charcoal-900">{audit.brand_name}</div>
                                                        <div className="text-[10px] text-charcoal-400 uppercase tracking-widest mt-1">{audit.brand_sector || 'General Sector'}</div>
                                                    </td>
                                                    <td className="px-6 py-6 font-mono">
                                                        <div className="text-xs font-black text-charcoal-900">{audit.investment_budget || 'N/A'}</div>
                                                        <div className="text-[10px] text-charcoal-400 uppercase tracking-widest mt-1">📍 {audit.location_target || 'PAN India'}</div>
                                                    </td>
                                                    <td className="px-6 py-6 font-mono">
                                                        <div className="flex flex-col gap-3">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 w-fit ${audit.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                audit.status === 'in-review' ? 'bg-primary-50 text-primary-600 border border-primary-100' :
                                                                    audit.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                                        'bg-charcoal-50 text-charcoal-400 border border-charcoal-200'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${audit.status === 'pending' ? 'bg-amber-500 animate-pulse' :
                                                                    audit.status === 'in-review' ? 'bg-primary-500 animate-pulse' :
                                                                        audit.status === 'completed' ? 'bg-emerald-500' :
                                                                            'bg-charcoal-400'
                                                                    }`} />
                                                                {audit.status}
                                                            </span>

                                                            {audit.admin_feedback && (
                                                                <div className="p-3 bg-white rounded-xl border border-charcoal-100 shadow-sm max-w-xs transition-all group-hover:border-primary-100">
                                                                    <div className="text-[8px] font-black text-primary-600 uppercase tracking-widest mb-1">Expert Intel</div>
                                                                    <p className="text-[10px] text-charcoal-600 font-medium leading-relaxed italic">"{audit.admin_feedback}"</p>
                                                                    {audit.report_url && (
                                                                        <a
                                                                            href={audit.report_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="mt-2 inline-flex items-center gap-2 text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                                                                        >
                                                                            <span>🗂️</span> View Detailed Report
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-right font-mono">
                                                        <div className="text-[10px] font-black text-charcoal-600 uppercase tracking-widest">
                                                            {new Date(audit.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-[9px] text-charcoal-400 mt-1 uppercase tracking-widest">48h SLA</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/30 flex justify-between items-center">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">My Intelligence Logs</h2>
                            </div>
                            {myReviews.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="text-4xl mb-4">📡</div>
                                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Intel Shared Yet</h3>
                                    <p className="text-charcoal-500 mb-6 text-sm font-medium">Contribute to the ecosystem by sharing your experience on blueprints.</p>
                                    <Link to="/ideas" className="btn-primary py-2 px-6 text-xs">Browse Ideas</Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-charcoal-100">
                                    {myReviews.map((review) => (
                                        <div key={`${review.assetType}-${review.id}`} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6 group">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Link to={review.link} className="text-lg font-black text-charcoal-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                                                        {review.title}
                                                    </Link>
                                                    <span className="text-[8px] font-black uppercase text-charcoal-400 bg-charcoal-100 px-2 py-0.5 rounded-full border border-charcoal-200">
                                                        {review.assetType}
                                                    </span>
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-charcoal-600 text-sm font-medium leading-relaxed italic">
                                                    "{review.content}"
                                                </p>
                                                <div className="mt-4 flex items-center gap-4 text-[9px] font-black text-charcoal-400 uppercase tracking-widest">
                                                    <span>Logged on {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    {review.author_response && (
                                                        <span className="text-emerald-600 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                            Response Received
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                to={review.link}
                                                className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                            >
                                                Edit Feedback
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
