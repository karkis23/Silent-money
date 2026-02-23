import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import ROICalculator from '../components/ROICalculator';
import ReviewsSection from '../components/ReviewsSection';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';
import AssetAuditTrail from '../components/AssetAuditTrail';
import ErrorBoundary from '../components/ErrorBoundary';
import DetailHero from '../components/details/DetailHero';
import DetailMetrics from '../components/details/DetailMetrics';
import { motion } from 'framer-motion';

/**
 * IdeaDetailPage: The detailed business plan for a specific income-generating idea.
 * 
 * CORE FEATURES:
 * - Expert Review: Honest assessments of effort and risk.
 * - Key Metrics: Shows important numbers like income, risk, and setup time.
 * - Calculator: Tools to help you project your potential earnings.
 * - Progress Tracking: Track your journey from researching to live.
 * - Full Guide: Comprehensive step-by-step guides.
 * @component
 */
export default function IdeaDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [idea, setIdea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [userStatus, setUserStatus] = useState('interested');
    const [userNotes, setUserNotes] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVoted, setIsVoted] = useState(false);
    const [voteCount, setVoteCount] = useState(0);

    useEffect(() => {
        const fetchIdea = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('income_ideas')
                .select(`
                    *,
                    categories (name, slug, icon),
                    profiles (id, full_name, avatar_url)
                `)
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Error fetching idea:', error);
                setError('Idea not found.');
            } else {
                setIdea(data);
                setVoteCount(data.upvotes_count || 0);
            }
            setLoading(false);
        };

        fetchIdea();
    }, [slug]);

    useEffect(() => {
        const checkSaveStatus = async () => {
            if (!user || !idea) return;
            const { data } = await supabase
                .from('user_saved_ideas')
                .select('*')
                .eq('user_id', user.id)
                .eq('idea_id', idea.id)
                .maybeSingle();

            if (data) {
                setIsSaved(true);
                setUserStatus(data.status);
                setUserNotes(data.notes || '');
            }
        };
        checkSaveStatus();
    }, [user, idea]);


    useEffect(() => {
        const checkVoteStatus = async () => {
            if (!user || !idea) return;
            const { data } = await supabase
                .from('income_ideas_votes')
                .select('*')
                .eq('user_id', user.id)
                .eq('idea_id', idea.id)
                .maybeSingle();

            if (data) setIsVoted(true);
        };
        checkVoteStatus();
    }, [user, idea]);

    const handleToggleVote = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isVoted) {
            const { error } = await supabase
                .from('income_ideas_votes')
                .delete()
                .eq('user_id', user.id)
                .eq('idea_id', idea.id);

            if (!error) {
                setIsVoted(false);
                setVoteCount(prev => Math.max(0, prev - 1));
            }
        } else {
            const { error } = await supabase
                .from('income_ideas_votes')
                .insert([{ user_id: user.id, idea_id: idea.id }]);

            if (!error) {
                setIsVoted(true);
                setVoteCount(prev => prev + 1);
            }
        }
    };

    const handleToggleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isSaved) {
            await supabase
                .from('user_saved_ideas')
                .delete()
                .eq('user_id', user.id)
                .eq('idea_id', idea.id);
            setIsSaved(false);
        } else {
            await supabase
                .from('user_saved_ideas')
                .insert([{ user_id: user.id, idea_id: idea.id }]);
            setIsSaved(true);
        }
    };

    const handleUpdateProgress = async () => {
        setUpdateLoading(true);
        const { error } = await supabase
            .from('user_saved_ideas')
            .update({ status: userStatus, notes: userNotes })
            .eq('user_id', user.id)
            .eq('idea_id', idea.id);

        if (error) {
            setUpdateMessage('❌ Failed to save changes.');
        } else {
            setUpdateMessage('✅ Progress saved!');
            setTimeout(() => setUpdateMessage(''), 3000);
        }
        setUpdateLoading(false);
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${Math.floor(amount / 100000)} Lakh`;
        if (amount >= 1000) return `₹${Math.floor(amount / 1000)}k`;
        return `₹${amount}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !idea) return (
        <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="text-6xl mb-6">🏢</div>
            <h1 className="text-3xl font-black text-charcoal-950 mb-4">{error}</h1>
            <Link to="/ideas" className="btn-primary">Back to Ideas</Link>
        </div>
    );

    const ideaMetrics = [
        { label: 'Initial Investment', value: formatCurrency(idea.initial_investment_min) },
        { label: 'Time to First ₹', value: `${idea.time_to_first_income_days || 0} Days`, variant: 'success' },
        { label: 'Projected Profit', value: formatCurrency(idea.monthly_income_min || 0), unit: '/mo', variant: 'primary', highlight: true }
    ];

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": idea.title,
        "description": idea.short_description,
        "brand": {
            "@type": "Brand",
            "name": "Silent Money"
        },
        "offers": {
            "@type": "Offer",
            "price": idea.initial_investment_min,
            "priceCurrency": "INR"
        }
    };

    const heroStats = [
        { label: 'Risk Level', value: idea.risk_level?.toUpperCase() || 'LOW' },
        { label: 'Rating', value: 'AAA+' }
    ];

    const heroActions = (
        <>
            <button
                onClick={handleToggleSave}
                className={`h-14 px-8 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 w-full sm:w-auto min-w-[190px] shrink-0 group border shadow-2xl relative overflow-hidden ${isSaved
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                    : 'bg-charcoal-950 text-white border-charcoal-800 hover:bg-primary-600 shadow-charcoal-900/40'
                    }`}
            >
                <div className="relative z-10 flex items-center gap-3">
                    {isSaved ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l4.59-4.59L17 10.5 11 16.5z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                    )}
                    <span className="whitespace-nowrap font-black tracking-[0.25em]">{isSaved ? 'SAVED' : 'SAVE IDEA'}</span>
                </div>
            </button>

            <button
                onClick={handleToggleVote}
                className={`h-14 px-8 border rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 w-full sm:w-auto min-w-[140px] shrink-0 group shadow-lg ${isVoted
                    ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                    : 'bg-white border-charcoal-100 text-charcoal-900 hover:bg-charcoal-50 hover:border-charcoal-300 shadow-charcoal-900/5'
                    }`}
            >
                <div className="relative z-10 flex items-center gap-3">
                    <span className={`text-base transition-transform group-hover:scale-125 ${isVoted ? 'animate-bounce' : ''}`}>
                        {isVoted ? '🔥' : '⚡'}
                    </span>
                    <span className="whitespace-nowrap font-black tracking-[0.25em]">
                        {voteCount} LIKES
                    </span>
                </div>
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-cream-50 pb-6 md:pb-20 pt-20 transition-all duration-300">
            <SEO
                title={idea.meta_title || `${idea.title} | Silent Money Ideas`}
                description={idea.meta_description || idea.short_description}
                schemaData={schemaData}
            />


            <DetailHero
                title={idea.title}
                category="idea"
                shortDescription={idea.short_description}
                imageUrl={idea.image_url}
                profiles={idea.profiles}
                isVerified={true}
                isPremium={idea.is_premium}
                isFeatured={idea.is_featured}
                assetGrade="Trusted Idea"
                backLabel="Back to Ideas"
                actions={heroActions}
                stats={heroStats}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* 1. FINANCIAL OVERVIEW */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16 items-start">
                    <div className="space-y-12">
                        <DetailMetrics metrics={ideaMetrics} />

                        {/* Reality Check - Moved up to fill gap */}
                        <div className="bg-amber-50 rounded-[3rem] p-6 md:p-10 border border-amber-100/50 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 blur-3xl rounded-full -mr-16 -mt-16" />
                            <h3 className="text-[11px] font-black text-amber-700 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                Expert Review
                            </h3>
                            <div className="prose prose-amber max-w-none prose-p:text-amber-900 prose-p:font-medium text-sm leading-relaxed relative z-10">
                                <ReactMarkdown>{idea.reality_check}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Expertise Required */}
                        {idea.skills_required && idea.skills_required.length > 0 && (
                            <div className="bg-white rounded-[3rem] p-6 md:p-10 border border-charcoal-100 shadow-sm relative overflow-hidden">
                                <h3 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                                    <span>🧠</span> Expertise Required
                                </h3>
                                <div className="flex flex-wrap gap-3 relative z-10">
                                    {idea.skills_required.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-6 py-3 bg-charcoal-50 text-charcoal-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border border-charcoal-100/50 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all cursor-default"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="lg:pt-[72px]"> {/* Align with metrics cards below the heading */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <ErrorBoundary compact>
                                <ROICalculator
                                    assetId={idea.id}
                                    assetType="idea"
                                    initialDefaults={{
                                        investment: idea.initial_investment_min,
                                        income: idea.monthly_income_min,
                                        expenses: 0
                                    }}
                                />
                            </ErrorBoundary>
                        </motion.div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* 2. DETAILS & FEEDBACK */}
                    <div className="space-y-12">
                        {/* How it Works */}
                        <div className={`bg-white rounded-[3rem] p-6 md:p-10 border border-charcoal-100 shadow-xl relative transition-all duration-700 ${isExpanded ? '' : 'max-h-[600px] overflow-hidden'}`}>
                            <h3 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <span>💎</span> How it Works
                            </h3>
                            <div className="prose prose-charcoal max-w-none prose-headings:font-black prose-headings:text-charcoal-900 prose-p:text-charcoal-600 prose-strong:text-charcoal-900 whitespace-pre-wrap text-lg">
                                <ReactMarkdown>{idea.full_description}</ReactMarkdown>
                            </div>

                            {!isExpanded && (
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
                            )}
                        </div>

                        <div className="flex justify-center -mt-6 relative z-10">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="bg-charcoal-950 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-600 transition-all flex items-center gap-3 group"
                            >
                                {isExpanded ? 'Show Less' : 'Read Full Description'}
                                <span className={`text-lg transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-1'}`}>↓</span>
                            </button>
                        </div>

                        {/* Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <ErrorBoundary compact>
                                <ReviewsSection assetId={idea.id} assetType="idea" authorId={idea.author_id} user={user} />
                            </ErrorBoundary>
                        </motion.div>
                    </div>

                    {/* Content & Progress */}
                    <div className="space-y-8">
                        {!user && (
                            <div className="bg-primary-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                                <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Login to Save Information</h3>
                                <p className="text-xs font-medium text-white/80 leading-relaxed mb-6">Create an account to track this idea, save financial projections, and share your reviews.</p>
                                <Link to="/signup" className="inline-flex h-12 px-8 bg-white text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest items-center hover:bg-cream-50 transition-all">
                                    Get Started
                                </Link>
                            </div>
                        )}
                        {/* Progress Section */}
                        {isSaved && (
                            <div className="bg-white rounded-[3rem] p-6 md:p-10 border border-charcoal-100 shadow-xl">
                                <h3 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8">Personal Tracker</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2">My Status</label>
                                        <select
                                            value={userStatus}
                                            onChange={(e) => setUserStatus(e.target.value)}
                                            className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl text-sm font-bold text-charcoal-900 focus:ring-2 focus:ring-primary-600 outline-none transition-all"
                                        >
                                            <option value="interested">Interested</option>
                                            <option value="researching">Researching</option>
                                            <option value="started">Starting</option>
                                            <option value="active">Active</option>
                                            <option value="paused">On Hold</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2">Private Notes</label>
                                        <textarea
                                            value={userNotes}
                                            onChange={(e) => setUserNotes(e.target.value)}
                                            rows={5}
                                            className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-600 outline-none transition-all resize-none"
                                            placeholder="Document your journey..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateProgress}
                                        disabled={updateLoading}
                                        className="w-full py-5 bg-charcoal-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
                                    >
                                        {updateLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    {updateMessage && (
                                        <div className="text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">
                                            {updateMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <AssetAuditTrail assetId={idea.id} assetType="idea" />
                    </div>
                </div>
            </div>

        </div>
    );
}
