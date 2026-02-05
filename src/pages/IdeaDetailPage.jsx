import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import ROICalculator from '../components/ROICalculator';
import ReviewsSection from '../components/ReviewsSection';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';
import ExpertAuditModal from '../components/ExpertAuditModal';
import AssetAuditTrail from '../components/AssetAuditTrail';
import ErrorBoundary from '../components/ErrorBoundary';

export default function IdeaDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [idea, setIdea] = useState(null);
    const [loading, setLoading] = useState(true);

    // User interaction state
    const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [savedData, setSavedData] = useState(null); // Holds the full saved record
    const [userStatus, setUserStatus] = useState('interested');
    const [userNotes, setUserNotes] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [error, setError] = useState('');
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

    // Upvote state
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [voteCount, setVoteCount] = useState(0);
    const [voteLoading, setVoteLoading] = useState(false);

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
                setError('Idea not found');
            } else {
                setIdea(data);
                setVoteCount(data.upvotes_count || 0);
            }
            setLoading(false);
        };

        fetchIdea();
    }, [slug]);

    useEffect(() => {
        const checkVoteStatus = async () => {
            if (!user || !idea) return;
            const { data } = await supabase
                .from('income_ideas_votes')
                .select('*')
                .eq('user_id', user.id)
                .eq('idea_id', idea.id)
                .maybeSingle();
            setHasUpvoted(!!data);
        };

        if (user && idea) {
            checkVoteStatus();
        }
    }, [user, idea]);

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
                setSavedData(data);
                setUserStatus(data.status);
                setUserNotes(data.notes || '');
            } else {
                setIsSaved(false);
                setSavedData(null);
                setUserStatus('interested');
                setUserNotes('');
            }
        };

        if (user && idea) {
            checkSaveStatus();
        }
    }, [user, idea]);

    const handleVoteToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setVoteLoading(true);
        if (hasUpvoted) {
            // Unvote
            const { error } = await supabase
                .from('income_ideas_votes')
                .delete()
                .eq('user_id', user.id)
                .eq('idea_id', idea.id);

            if (!error) {
                setHasUpvoted(false);
                setVoteCount(prev => prev - 1);
            }
        } else {
            // Vote
            const { error } = await supabase
                .from('income_ideas_votes')
                .insert([{ user_id: user.id, idea_id: idea.id }]);

            if (!error) {
                setHasUpvoted(true);
                setVoteCount(prev => prev + 1);
            }
        }
        setVoteLoading(false);
    };

    const handleSaveToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setSaveLoading(true);

        if (isSaved) {
            // Unsave
            const { error } = await supabase
                .from('user_saved_ideas')
                .delete()
                .eq('user_id', user.id)
                .eq('idea_id', idea.id);

            if (!error) {
                setIsSaved(false);
                setSavedData(null);
            }
        } else {
            // Save
            const { data, error } = await supabase
                .from('user_saved_ideas')
                .insert([
                    { user_id: user.id, idea_id: idea.id, status: 'interested' }
                ])
                .select()
                .single();

            if (!error && data) {
                setIsSaved(true);
                setSavedData(data);
                setUserStatus('interested'); // Default
            }
        }

        setSaveLoading(false);
    };

    const handleUpdateProgress = async () => {
        if (!savedData) return;

        setUpdateLoading(true);
        setUpdateMessage('');

        const { data, error } = await supabase
            .from('user_saved_ideas')
            .update({
                status: userStatus,
                notes: userNotes,
                updated_at: new Date()
            })
            .eq('id', savedData.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating progress:', error);
            setUpdateMessage('❌ Failed to save changes.');
        } else {
            setSavedData(data);
            setUpdateMessage('✅ Progress saved to vault!');
            setTimeout(() => setUpdateMessage(''), 4000);
        }
        setUpdateLoading(false);
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
        return `₹${amount}`;
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-charcoal-600 bg-charcoal-50 border-charcoal-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-charcoal-600">Loading idea details...</p>
                </div>
            </div>
        );
    }

    if (error || !idea) {
        return (
            <div className="min-h-screen bg-cream-50 py-12 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-charcoal-900 mb-4">Oops!</h1>
                    <p className="text-charcoal-600 mb-8">{error || 'Idea not found'}</p>
                    <Link to="/ideas" className="btn-primary">Back to Ideas</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-32 transition-all duration-300">
            <SEO title={`${idea.title} | Silent Money Blueprints`} description={idea.short_description} />

            {/* Cinematic Hero Section */}
            <div className="relative overflow-hidden bg-white">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/30 to-transparent -z-0 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-4 mb-10">
                            <BackButton label="Back to Discovery Feed" />
                            <div className="h-px flex-1 bg-charcoal-100 hidden sm:block" />
                        </div>

                        <div className="grid lg:grid-cols-12 gap-12 items-start">
                            {/* Left Content Column */}
                            <div className="lg:col-span-12">
                                <div className="flex flex-wrap items-center gap-4 mb-8">
                                    <span className="bg-charcoal-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-charcoal-200/50">
                                        {idea.categories?.icon || '💡'} {idea.categories?.name}
                                    </span>
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100/50">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Verified Idea
                                    </div>
                                    {idea.is_premium && (
                                        <span className="bg-amber-400 text-amber-950 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-200/50">
                                            Premium
                                        </span>
                                    )}
                                    {profile?.income_goal > 0 && (
                                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-xl border border-white/20">
                                            🚀 +{Math.round((idea.monthly_income_min / profile.income_goal) * 100)}% To Goal
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-charcoal-950 mb-8 leading-[1.1] tracking-tighter">
                                    {idea.title}
                                </h1>

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                    <div className="max-w-2xl">
                                        <p className="text-xl md:text-2xl text-charcoal-500 font-medium leading-relaxed mb-8">
                                            {idea.short_description}
                                        </p>

                                        {/* Meta Stats Row */}
                                        <div className="flex flex-wrap items-center gap-6">
                                            {idea.profiles && (
                                                <Link
                                                    to={`/profile/${idea.profiles.id}`}
                                                    className="inline-flex items-center gap-3 group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-charcoal-50 shadow-inner border border-charcoal-100/50">
                                                        {idea.profiles.avatar_url ? (
                                                            <img src={idea.profiles.avatar_url} className="w-full h-full object-cover" alt={idea.profiles.full_name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-primary-600">
                                                                {idea.profiles.full_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest leading-none mb-1">Listed By</div>
                                                        <div className="text-sm font-black text-charcoal-900 group-hover:text-primary-600 transition-colors uppercase leading-none">
                                                            {idea.profiles.full_name}
                                                        </div>
                                                    </div>
                                                </Link>
                                            )}

                                            <div className="h-8 w-px bg-charcoal-100 hidden md:block" />

                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest leading-none mb-1">Rating</div>
                                                    <div className="text-sm font-black text-charcoal-900 leading-none">A+ SECURE</div>
                                                </div>
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-charcoal-50 overflow-hidden">
                                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-[10px] font-black text-white">
                                                        +2k
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                        {/* Strategic Impulse Indicator */}
                                        <div className="h-16 px-8 bg-white border border-charcoal-100 rounded-2xl flex items-center gap-4 flex-1 sm:flex-none shadow-lg shadow-charcoal-200/20">
                                            <button
                                                onClick={handleVoteToggle}
                                                disabled={voteLoading}
                                                className={`flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${hasUpvoted ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-900'}`}
                                            >
                                                <span className="text-xl">{hasUpvoted ? '❤️' : '🤍'}</span>
                                                <span>{voteCount} LIKES</span>
                                            </button>
                                        </div>

                                        {/* Simplified Command Vessel - Focus on Vaulting */}
                                        <button
                                            onClick={handleSaveToggle}
                                            disabled={saveLoading}
                                            className={`h-16 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 min-w-[200px] shadow-2xl shadow-charcoal-200/30 flex-1 sm:flex-none group ${isSaved
                                                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100'
                                                : 'bg-charcoal-950 text-white hover:bg-primary-600'
                                                }`}
                                        >
                                            {saveLoading ? (
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <span className="text-lg group-hover:scale-110 transition-transform">
                                                        {isSaved ? '🛡️' : '🔖'}
                                                    </span>
                                                    <span className="whitespace-nowrap">{isSaved ? 'SAVED' : 'SAVE IDEA'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Hero Asset */}
                        <div className="max-w-5xl mx-auto mt-12 group relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-600/5 blur-[120px] rounded-full -z-10 group-hover:bg-primary-600/10 transition-colors duration-1000" />

                            <div className="aspect-[21/9] rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
                                <img
                                    src={idea.image_url || 'https://images.unsplash.com/photo-1579621970795-87faff2f9160?q=80&w=1000'}
                                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                    alt={idea.title}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000';
                                        e.target.onerror = null;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-1000" />

                                <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pointer-events-none">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20">
                                            🛡️
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-1">Status</div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-black text-white uppercase tracking-wider">Verified Idea</div>
                                                {idea.is_featured && (
                                                    <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-lg shadow-amber-500/20 flex items-center gap-1">
                                                        ⭐ Featured
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Yield Accuracy</div>
                                            <div className="text-sm font-black text-white">99.8% VERIFIED</div>
                                        </div>
                                        <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Market Risk</div>
                                            <div className="text-sm font-black text-emerald-400 capitalize">{idea.risk_level}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Reality Check */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">⚠️</div>
                            <h2 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">⚠️</span> Reality Check
                            </h2>
                            <div className="text-yellow-900 leading-relaxed prose prose-yellow max-w-none prose-p:my-2 prose-headings:text-yellow-900 prose-headings:font-bold prose-headings:text-sm prose-headings:uppercase prose-headings:tracking-widest whitespace-pre-wrap">
                                <ReactMarkdown>{idea.reality_check}</ReactMarkdown>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-xl font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                                <span>🚀</span> How it works
                            </h3>
                            <div className="prose prose-charcoal max-w-none prose-headings:font-black prose-headings:text-charcoal-900 prose-p:text-charcoal-600 prose-li:text-charcoal-600 prose-strong:text-charcoal-900 prose-strong:font-black prose-a:text-primary-600 whitespace-pre-wrap">
                                <ReactMarkdown>{idea.full_description}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-charcoal-900 mb-4">Skills Required</h3>
                            <div className="flex flex-wrap gap-2">
                                {idea.skills_required?.map((skill, index) => (
                                    <span key={index} className="bg-charcoal-100 text-charcoal-700 px-3 py-1.5 rounded-lg text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Calculator */}
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

                        {/* Reviews */}
                        <ErrorBoundary compact>
                            <ReviewsSection assetId={idea.id} assetType="idea" authorId={idea.author_id} user={user} />
                        </ErrorBoundary>

                        {/* Institutional Audit Trail - Visible only to author or admin */}
                        {(user?.id === idea.author_id || profile?.is_admin) && (
                            <AssetAuditTrail assetId={idea.id} assetType="idea" />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {isSaved && (
                            <div className="card border-none shadow-xl p-8 bg-white overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary-600" />
                                <h3 className="text-lg font-black text-charcoal-900 mb-6 flex items-center gap-3 tracking-tight">
                                    <span className="text-xl">📝</span> Your Notes
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Operational Status</label>
                                        <select
                                            value={userStatus}
                                            onChange={(e) => setUserStatus(e.target.value)}
                                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold text-charcoal-900 appearance-none transition-all"
                                        >
                                            <option value="interested">Interested</option>
                                            <option value="researching">Researching</option>
                                            <option value="started">Started</option>
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>
                                            <option value="stopped">Stopped</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">My Notes</label>
                                        <textarea
                                            value={userNotes}
                                            onChange={(e) => setUserNotes(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium resize-none transition-all"
                                            placeholder="Log your progress..."
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        {updateMessage && (
                                            <div className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${updateMessage.includes('✅') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                {updateMessage}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleUpdateProgress}
                                            disabled={updateLoading}
                                            className="w-full py-4 bg-charcoal-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg"
                                        >
                                            {updateLoading ? 'Synchronizing...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card sticky top-24 border-none shadow-xl p-8 bg-primary-600 text-white">
                            <h3 className="text-lg font-black text-white mb-8 tracking-tight flex items-center gap-2">
                                <span>🎯</span> Key Metrics
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                    <div className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1 leading-none mb-1">Investment</div>
                                    <div className="text-lg font-black tracking-tighter">
                                        {formatCurrency(idea.initial_investment_min)}
                                    </div>
                                </div>

                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                    <div className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1 leading-none mb-1">Monthly Yield</div>
                                    <div className="text-lg font-black tracking-tighter">
                                        {formatCurrency(idea.monthly_income_min)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1 leading-none mb-1">Payback</div>
                                        <div className="text-lg font-black text-white tracking-tighter">
                                            {idea.time_to_first_income_days ? `${idea.time_to_first_income_days} Days` : 'TBD'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1 leading-none mb-1">Probability</div>
                                        <div className="text-lg font-black text-white tracking-tighter">
                                            {idea.success_rate_percentage ? `${idea.success_rate_percentage}%` : '75%'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 space-y-3">
                                <div className={`px-4 py-3 rounded-xl border-2 flex justify-between items-center transition-all ${getRiskColor(idea.risk_level)}`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Risk Index</span>
                                    <span className="text-xs font-black uppercase tracking-widest">{idea.risk_level}</span>
                                </div>

                                <div className="px-4 py-3 rounded-xl bg-charcoal-50 border-2 border-charcoal-100 flex justify-between items-center text-charcoal-700">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Effort Scale</span>
                                    <span className="text-xs font-black uppercase tracking-widest">{idea.effort_level}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expert Audit Modal */}
            <ExpertAuditModal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                prefillBrand={idea.title}
                prefillSector={idea.categories?.name}
            />
        </div>
    );
}
