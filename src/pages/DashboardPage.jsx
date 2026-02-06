import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-hot-toast';

/**
 * DashboardPage: The "Command Center" for the user.
 * 
 * This component aggregates all user-specific operational data including:
 * - Saved income blueprints (ideas) and franchises.
 * - Created content (ideas/franchises authored by the user).
 * - Social intelligence (reviews/intel provided by the user).
 * - Financial goals and real-time progress tracking.
 * - Expert audit requests for business validation.
 */
export default function DashboardPage() {
    const { user, profile } = useAuth();

    // Core Operational State
    const [savedIdeas, setSavedIdeas] = useState([]);      // Bookmarked income blueprints
    const [savedFranchises, setSavedFranchises] = useState([]); // Bookmarked franchise opportunities
    const [savedCalculations, setSavedCalculations] = useState([]); // Saved ROI projection models
    const [myReviews, setMyReviews] = useState([]);        // User-generated intelligence/reviews
    const [myAudits, setMyAudits] = useState([]);          // Active expert validation requests
    const [myIdeaCount, setMyIdeaCount] = useState(0);      // Total blueprints deployed by user
    const [loading, setLoading] = useState(true);

    const [myFranchiseCount, setMyFranchiseCount] = useState(0);
    const [activeTab, setActiveTab] = useState('ideas');    // UI Navigation state
    const [recommendations, setRecommendations] = useState({ ideas: [], franchises: [] }); // Empty-state suggestions

    // Confirm Modal State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

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

            // Fetch recommendations for empty states
            const { data: recIdeas } = await supabase
                .from('income_ideas')
                .select('id, title, slug, categories(icon)')
                .eq('is_approved', true)
                .order('upvotes_count', { ascending: false })
                .limit(3);

            const { data: recFran } = await supabase
                .from('franchises')
                .select('id, name, slug')
                .eq('is_approved', true)
                .order('roi_months_min', { ascending: true })
                .limit(3);

            setRecommendations({ ideas: recIdeas || [], franchises: recFran || [] });
            setLoading(false);
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleDeleteIdea = (e, savedId) => {
        e.preventDefault();
        e.stopPropagation();

        setConfirmConfig({
            isOpen: true,
            title: 'Remove Idea?',
            message: 'Are you sure you want to remove this idea from your saved list? This action is permanent.',
            onConfirm: async () => {
                const { error } = await supabase
                    .from('user_saved_ideas')
                    .delete()
                    .eq('id', savedId);

                if (!error) {
                    setSavedIdeas(prev => prev.filter(item => item.id !== savedId));
                    toast.success('Idea removed successfully.');
                } else {
                    console.error('Error removing idea:', error);
                    toast.error('Failed to remove idea.');
                }
            },
            type: 'danger'
        });
    };

    const handleDeleteFranchise = (e, savedId) => {
        e.preventDefault();
        e.stopPropagation();

        setConfirmConfig({
            isOpen: true,
            title: 'Stop Tracking?',
            message: 'Are you sure you want to remove this franchise from your list?',
            onConfirm: async () => {
                const { error } = await supabase
                    .from('user_saved_franchises')
                    .delete()
                    .eq('id', savedId);

                if (!error) {
                    setSavedFranchises(prev => prev.filter(item => item.id !== savedId));
                    toast.success('Franchise removed successfully.');
                } else {
                    console.error('Error removing franchise:', error);
                    toast.error('Failed to remove franchise.');
                }
            },
            type: 'danger'
        });
    };

    const handleDeleteReview = (reviewId, assetType) => {
        const tableName = assetType === 'franchise' ? 'franchise_reviews' : 'income_idea_reviews';

        setConfirmConfig({
            isOpen: true,
            title: 'Delete Review?',
            message: 'Are you sure you want to permanently delete this review?',
            onConfirm: async () => {
                const { error } = await supabase
                    .from(tableName)
                    .delete()
                    .eq('id', reviewId);

                if (!error) {
                    setMyReviews(prev => prev.filter(r => r.id !== reviewId));
                    toast.success('Review deleted successfully.');
                } else {
                    console.error('Error removing intel:', error);
                    toast.error('Failed to delete review.');
                }
            },
            type: 'danger'
        });
    };

    const handleDeleteAudit = (auditId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Audit Request?',
            message: 'Are you sure you want to cancel this audit request?',
            onConfirm: async () => {
                const { error } = await supabase
                    .from('expert_audit_requests')
                    .delete()
                    .eq('id', auditId);

                if (!error) {
                    setMyAudits(prev => prev.filter(a => a.id !== auditId));
                    toast.success('Audit request cancelled.');
                } else {
                    console.error('Error removing audit:', error);
                    toast.error('Failed to cancel audit request.');
                }
            },
            type: 'danger'
        });
    };

    const handleUpdateStatus = async (id, newStatus, type = 'idea') => {
        const table = type === 'idea' ? 'user_saved_ideas' : 'user_saved_franchises';
        const { error } = await supabase
            .from(table)
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            if (type === 'idea') {
                setSavedIdeas(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
            } else {
                setSavedFranchises(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
            }
            toast.success(`Deployment status updated to: ${newStatus}`);
        } else {
            toast.error('Operational error. Could not update status.');
        }
    };

    const calculatePotentialIncome = () => {
        if (!savedIdeas.length) return 0;
        return savedIdeas.reduce((total, item) => {
            return total + (item.income_ideas?.monthly_income_min || 0);
        }, 0);
    };

    const calculateAchievedIncome = () => {
        const ideaIncome = savedIdeas
            .filter(item => item.status === 'Active')
            .reduce((total, item) => total + (item.income_ideas?.monthly_income_min || 0), 0);

        const franchiseIncome = savedFranchises
            .filter(item => item.status === 'Active')
            .reduce((total, item) => total + (item.franchises?.expected_profit_min || 0), 0);

        return ideaIncome + franchiseIncome;
    };

    const achieved = calculateAchievedIncome();
    const goal = profile?.income_goal || 100000;
    const progress = Math.min(100, Math.round((achieved / goal) * 100));

    const getCommanderRank = () => {
        const totalAssets = (savedIdeas?.length || 0) + (savedFranchises?.length || 0);
        if (totalAssets === 0) return { title: 'Market Explorer', color: 'text-charcoal-400', icon: '🛰️' };
        if (totalAssets < 3) return { title: 'Wealth Strategist', color: 'text-blue-500', icon: '⚔️' };
        if (totalAssets < 5) return { title: 'Portfolio Commander', color: 'text-primary-600', icon: '🎖️' };
        return { title: 'Elite Wealth Commander', color: 'text-amber-500', icon: '💎' };
    };

    const rank = getCommanderRank();

    return (
        <div className="min-h-screen bg-cream-50 pb-32 pt-24 md:pt-32">
            <SEO
                title="Command Center | Silent Money"
                description="Manage your saved ideas, track ROI progress, and monitor your passive income."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header HUD */}
                <div className="mb-6 md:mb-12 bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-charcoal-100 shadow-premium relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                        {/* Profile Image with Rank Ring */}
                        <div className="relative group">
                            <div className={`w-20 h-20 md:w-32 md:h-32 rounded-[2.5rem] overflow-hidden border-2 md:border-4 shadow-2xl relative z-10 bg-charcoal-50 ${rank.title.includes('Elite') ? 'border-amber-400' : 'border-white'}`}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={profile.full_name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-primary-600">
                                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-charcoal-900 text-white w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center text-sm md:text-lg shadow-xl z-20 border-2 border-white">
                                {rank.icon}
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${rank.color}`}>{rank.title}</span>
                                <span className="w-1 h-1 rounded-full bg-charcoal-200"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">System Status: Optimal</span>
                            </div>
                            <h1 className="text-2xl md:text-5xl font-black text-charcoal-950 tracking-tighter mb-4">
                                {profile?.full_name?.split(' ')[0] || 'Commander'}<span className="text-primary-600">.</span>
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="bg-charcoal-50 px-4 py-2 rounded-xl text-[10px] font-black text-charcoal-600 uppercase tracking-widest border border-charcoal-100">
                                    ID: SM-{user.id.substring(0, 5)}
                                </div>
                                <div className="bg-emerald-50 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                                    Status: Verified
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 md:gap-8 md:pl-12 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-charcoal-100">
                        {/* Freedom Tracker HUD */}
                        <div className="flex items-center gap-6 min-w-[280px]">
                            <div className="relative w-16 h-16 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="transparent"
                                        className="text-charcoal-50"
                                    />
                                    <motion.circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={175.9}
                                        initial={{ strokeDashoffset: 175.9 }}
                                        animate={{ strokeDashoffset: 175.9 - (175.9 * progress) / 100 }}
                                        className="text-emerald-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-600">
                                    {progress}%
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Income Progress</div>
                                <div className="text-2xl font-black text-charcoal-900 tracking-tighter">
                                    ₹{(achieved / 1000).toFixed(1)}k <span className="text-charcoal-300 text-sm">/ {goal / 1000}k</span>
                                </div>
                                <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1 mr-4">Live Yield Achieved</div>
                            </div>
                        </div>

                        <Link to="/edit-profile" className="flex items-center gap-3 bg-charcoal-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl self-center md:self-auto">
                            <span>⚙️</span> Edit Profile & Goals
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-12">
                    <div
                        onClick={() => setActiveTab('ideas')}
                        className="card !p-4 md:!p-6 group hover-lift cursor-pointer transition-colors hover:bg-charcoal-50/50"
                    >
                        {loading ? (
                            <>
                                <div className="skeleton h-4 w-24 mb-2 rounded"></div>
                                <div className="skeleton h-8 w-16 rounded"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1.5 ">Saved Blueprints</div>
                                <div className="text-3xl font-black text-charcoal-950 tracking-tighter">
                                    {savedIdeas.length + savedFranchises.length}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="card !p-4 md:!p-6 group hover-lift">
                        {loading ? (
                            <>
                                <div className="skeleton h-4 w-28 mb-2 rounded"></div>
                                <div className="skeleton h-8 w-12 rounded"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1.5">My Contributions</div>
                                <div className="text-3xl font-black text-charcoal-950 tracking-tighter">
                                    {myIdeaCount + myFranchiseCount}
                                </div>
                                <Link to="/my-ideas" className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-2 px-3 py-1 bg-primary-50 rounded-full inline-block hover:bg-primary-100 transition-colors">Manage Posts →</Link>
                            </>
                        )}
                    </div>

                    <div
                        onClick={() => setActiveTab('projections')}
                        className="card !p-4 md:!p-6 bg-gradient-to-br from-emerald-500 to-emerald-700 border-none group shadow-2xl shadow-emerald-500/20 hover-lift relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                        {loading ? (
                            <>
                                <div className="skeleton h-4 w-28 mb-2 rounded bg-white/20"></div>
                                <div className="skeleton h-8 w-20 rounded bg-white/20"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1.5 relative z-10">Projected Yield</div>
                                <div className="text-3xl font-black text-white tracking-tighter relative z-10">
                                    ₹{(calculatePotentialIncome() / 1000).toFixed(1)}k<span className="text-md text-white/50 ml-1">/mo</span>
                                </div>
                                {/* Yield Trajectory Indicator */}
                                <div className="mt-3 flex items-center gap-2 relative z-10">
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

                    <div className="bg-primary-600 !p-4 md:!p-5 rounded-[2.5rem] shadow-2xl shadow-primary-600/20 flex flex-col justify-between hover-lift">
                        <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-3">Quick Actions</div>
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/add-idea"
                                className="w-full bg-white text-primary-700 font-black text-[9px] py-3 rounded-2xl text-center uppercase tracking-widest hover:bg-cream-50 transition-all shadow-xl shadow-primary-700/20 flex items-center justify-center gap-2"
                            >
                                <span className="text-xs">+</span> Add Idea
                            </Link>
                            <Link
                                to="/post-franchise"
                                className="w-full bg-primary-800 text-white font-black text-[9px] py-3 rounded-2xl text-center uppercase tracking-widest hover:bg-primary-900 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="text-xs">+</span> Add Franchise
                            </Link>
                            <Link
                                to="/compare"
                                className="w-full bg-white/10 text-white border border-white/20 font-black text-[9px] py-2.5 rounded-2xl text-center uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="text-xs">⚔️</span> Compare
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex gap-4 md:gap-8 border-b border-charcoal-100 mb-6 md:mb-8 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
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
                        Audits ({myAudits.length})
                        {activeTab === 'audits' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                    </button>
                </div>

                {/* Section Content */}
                <div className="bg-white rounded-[2rem] md:rounded-xl shadow-premium border border-charcoal-100 overflow-hidden">
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
                                    <div className="text-4xl mb-6">🔖</div>
                                    <h3 className="text-lg font-black text-charcoal-900 mb-2 uppercase tracking-tight">Vault Empty</h3>
                                    <p className="text-charcoal-500 mb-10 text-sm font-medium">Browse Ideas</p>

                                    <div className="max-w-md mx-auto space-y-4">
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest text-left mb-2 pl-2">Recommended for You</div>
                                        {recommendations.ideas.map(idea => (
                                            <Link key={idea.id} to={`/ideas/${idea.slug}`} className="flex items-center justify-between p-4 bg-charcoal-50 rounded-2xl hover:bg-primary-50 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{idea.categories?.icon || '💡'}</span>
                                                    <span className="text-sm font-black text-charcoal-900">{idea.title}</span>
                                                </div>
                                                <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                            </Link>
                                        ))}
                                        <Link to="/ideas" className="btn-primary w-full py-4 text-xs mt-4">Browse Ideas</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-charcoal-100">
                                    {savedIdeas.map((saved) => (
                                        <div key={saved.id} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                            <div className="flex-1">
                                                <Link to={`/ideas/${saved.income_ideas?.slug}`} className="text-lg font-black text-charcoal-900 group-hover:text-primary-600 transition-colors">
                                                    {saved.income_ideas?.title || 'Unknown Asset'}
                                                </Link>
                                                <p className="text-sm text-charcoal-500 mb-2 font-medium line-clamp-1">{saved.income_ideas?.short_description || 'This asset details are no longer available.'}</p>
                                                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-charcoal-400 items-center">
                                                    <span className="text-emerald-600">₹{((saved.income_ideas?.monthly_income_min || 0) / 1000).toFixed(0)}k/mo Yield</span>
                                                    <span>• {saved.income_ideas?.effort_level || 'Unknown'} Effort</span>

                                                    <div className="relative inline-block">
                                                        <select
                                                            value={saved.status}
                                                            onChange={(e) => handleUpdateStatus(saved.id, e.target.value, 'idea')}
                                                            className={`appearance-none bg-charcoal-900 text-white pl-8 pr-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-black transition-all border-none ${saved.status === 'Active' ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)] !bg-emerald-600' : ''}`}
                                                        >
                                                            <option value="Interested">Interested</option>
                                                            <option value="Researching">Researching</option>
                                                            <option value="Deploying">Deploying</option>
                                                            <option value="Active">Active</option>
                                                        </select>
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]">📡</span>
                                                    </div>

                                                    {/* Personality Match Tag */}
                                                    {profile?.risk_tolerance === saved.income_ideas?.risk_level && (
                                                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md text-[8px] border border-primary-100">
                                                            🎯 RISK MATCH
                                                        </span>
                                                    )}
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
                                                <Link to={`/ideas/${saved.income_ideas?.slug || ''}`} className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">View Details</Link>
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
                                    <div className="text-4xl mb-6">🏢</div>
                                    <h3 className="text-lg font-black text-charcoal-900 mb-2 uppercase tracking-tight">No Tracked Brands</h3>
                                    <p className="text-charcoal-500 mb-10 text-sm font-medium">Expansion fleet inactive. Monitor established brands for deployment.</p>

                                    <div className="max-w-md mx-auto space-y-4">
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest text-left mb-2 pl-2">Top Franchises</div>
                                        {recommendations.franchises.map(fran => (
                                            <Link
                                                key={fran.id}
                                                to={`/franchise/${fran.slug}`}
                                                className="flex items-center justify-between p-4 bg-charcoal-50 rounded-2xl hover:bg-emerald-50 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">🏢</span>
                                                    <span className="text-sm font-black text-charcoal-900">{fran.name}</span>
                                                </div>
                                                <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                            </Link>
                                        ))}
                                        <Link to="/franchise" className="btn-primary w-full py-4 text-xs mt-4 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">View All Franchises</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-charcoal-100">
                                    {savedFranchises.map((saved) => (
                                        <div key={saved.id} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                            <div className="flex-1">
                                                <Link to={`/franchise/${saved.franchises?.slug || ''}`} className="text-lg font-black text-charcoal-900 group-hover:text-emerald-600 transition-colors">
                                                    {saved.franchises?.name || 'Unknown Brand'}
                                                </Link>
                                                <p className="text-sm text-charcoal-500 mb-2 font-medium line-clamp-1">{saved.franchises?.description || 'Expansion data is no longer available.'}</p>
                                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-charcoal-400 items-center">
                                                    <span className="text-emerald-600">{saved.franchises?.roi_months_min || '?'}-{saved.franchises?.roi_months_max || '?'}m ROI</span>
                                                    <span>• ₹{((saved.franchises?.investment_min || 0) / 100000).toFixed(1)}L Capital</span>

                                                    <div className="relative inline-block">
                                                        <select
                                                            value={saved.status}
                                                            onChange={(e) => handleUpdateStatus(saved.id, e.target.value, 'franchise')}
                                                            className={`appearance-none bg-emerald-600 text-white pl-8 pr-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-emerald-700 transition-all border-none`}
                                                        >
                                                            <option value="Interested">Interested</option>
                                                            <option value="Researching">Researching</option>
                                                            <option value="Audit Requested">Audit Requested</option>
                                                            <option value="Active">Operational</option>
                                                        </select>
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]">🏢</span>
                                                    </div>
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
                                                <Link to={`/franchise/${saved.franchises?.slug || ''}`} className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">View Details</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : activeTab === 'projections' ? (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Saved ROI Projections</h2>
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
                                                    onClick={() => {
                                                        setConfirmConfig({
                                                            isOpen: true,
                                                            title: 'Wipe Intelligence?',
                                                            message: 'Do you want to permanently erase this ROI report from your intelligence log?',
                                                            onConfirm: async () => {
                                                                await supabase.from('roi_calculations').delete().eq('id', calc.id);
                                                                setSavedCalculations(prev => prev.filter(p => p.id !== calc.id));
                                                            },
                                                            type: 'danger'
                                                        });
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
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Brand Details</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Budget/Target</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-charcoal-400 uppercase tracking-widest text-right">Requested</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-charcoal-100">
                                            {myAudits.map((audit) => (
                                                <tr key={audit.id} className="hover:bg-cream-50 transition-colors group">
                                                    <td className="px-6 py-6">
                                                        <div className="text-sm font-black text-charcoal-900">{audit.brand_name}</div>
                                                        <div className="text-[10px] text-charcoal-400 uppercase tracking-widest mt-1">{audit.brand_sector || 'General Sector'}</div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="text-xs font-black text-charcoal-900">{audit.investment_budget || 'N/A'}</div>
                                                        <div className="text-[10px] text-charcoal-400 uppercase tracking-widest mt-1">📍 {audit.location_target || 'PAN India'}</div>
                                                    </td>
                                                    <td className="px-6 py-6">
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
                                                    <td className="px-6 py-6 text-right">
                                                        <div className="flex flex-col items-end gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-[10px] font-black text-charcoal-600 uppercase tracking-widest">
                                                                    {new Date(audit.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteAudit(audit.id)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-charcoal-100 text-charcoal-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                                    title="Decommission Audit"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <div className="text-[9px] text-charcoal-400 uppercase tracking-widest">48h SLA</div>
                                                        </div>
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

                                                {review.author_response && (
                                                    <div className="mt-4 pl-4 border-l-2 border-emerald-500 py-1 bg-emerald-50/30 rounded-r-xl pr-4">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-[7px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">Asset Owner Strategy</span>
                                                            {review.responded_at && (
                                                                <span className="text-[7px] font-black text-charcoal-400 tracking-widest">{new Date(review.responded_at).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-charcoal-900 font-bold leading-relaxed italic">
                                                            &quot;{review.author_response}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleDeleteReview(review.id, review.assetType)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-charcoal-100 text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Retract Intel"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <Link
                                                    to={review.link}
                                                    className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                                >
                                                    Edit Feedback
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />
        </div >
    );
}
