import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import ROICalculator from '../components/ROICalculator';
import ReviewsSection from '../components/ReviewsSection';
import SEO from '../components/SEO';

export default function IdeaDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

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
        <div className="min-h-screen bg-cream-50 pb-20 pt-32">
            <SEO title={`${idea.title} | Silent Money Blueprints`} description={idea.short_description} />

            {/* Hero Header */}
            <div className="bg-white border-b border-charcoal-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="max-w-4xl mx-auto">
                        <Link to="/ideas" className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-8 inline-flex items-center gap-2 hover:text-primary-600 transition-colors">
                            ← Back to Discovery feed
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="bg-charcoal-50 text-charcoal-900 border border-charcoal-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        {idea.categories?.icon} {idea.categories?.name}
                                    </span>
                                    {idea.is_premium && (
                                        <span className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            ⭐ Premium
                                        </span>
                                    )}
                                    {isSaved && (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-float">
                                            🛰️ {userStatus}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 mb-6 leading-tight tracking-tighter">
                                    {idea.title}
                                </h1>

                                <p className="text-xl text-charcoal-600 font-medium leading-relaxed max-w-2xl mb-8">
                                    {idea.short_description}
                                </p>

                                {/* Author Attribution */}
                                {idea.profiles && (
                                    <Link
                                        to={`/profile/${idea.profiles.id}`}
                                        className="inline-flex items-center gap-3 p-2 pr-6 bg-charcoal-50 rounded-2xl hover:bg-charcoal-100 transition-all group border border-charcoal-100"
                                    >
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm">
                                            {idea.profiles.avatar_url ? (
                                                <img src={idea.profiles.avatar_url} className="w-full h-full object-cover" alt={idea.profiles.full_name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-sm font-black text-primary-600">
                                                    {idea.profiles.full_name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest">Authored By</div>
                                            <div className="text-sm font-black text-charcoal-900 group-hover:text-primary-600 transition-colors uppercase">
                                                {idea.profiles.full_name}
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                                <button
                                    onClick={handleVoteToggle}
                                    disabled={voteLoading}
                                    className={`px-8 py-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black text-lg ${hasUpvoted ? 'bg-primary-50 border-primary-600 text-primary-600 shadow-lg' : 'border-charcoal-200 text-charcoal-400 hover:border-primary-600 hover:text-primary-600'}`}
                                >
                                    <span className={hasUpvoted ? 'animate-bounce' : ''}>
                                        {hasUpvoted ? '❤️' : '🤍'}
                                    </span>
                                    <span>{voteCount}</span>
                                </button>

                                <button
                                    onClick={handleSaveToggle}
                                    disabled={saveLoading}
                                    className={`px-8 py-5 rounded-2xl font-black text-lg transition-all ${isSaved
                                        ? 'bg-primary-600 text-white shadow-2xl shadow-primary-200'
                                        : 'bg-charcoal-900 text-white hover:bg-primary-600 shadow-2xl shadow-charcoal-100'
                                        }`}
                                >
                                    {saveLoading ? '...' : (isSaved ? '✓ Saved' : '🔖 Save Blueprint')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">

                    {/* Main Content Column */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Reality Check - The Core Feature */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">⚠️</div>
                            <h2 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">⚠️</span> Reality Check
                            </h2>
                            <div className="text-yellow-900 leading-relaxed prose prose-yellow max-w-none prose-p:my-2 prose-headings:text-yellow-900 prose-headings:font-bold prose-headings:text-sm prose-headings:uppercase prose-headings:tracking-widest">
                                <ReactMarkdown>{idea.reality_check}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Markdown-like Description */}
                        <div className="card">
                            <h3 className="text-xl font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                                <span>🚀</span> Operational Protocol
                            </h3>
                            <div className="prose prose-charcoal max-w-none prose-headings:font-black prose-headings:text-charcoal-900 prose-p:text-charcoal-600 prose-li:text-charcoal-600 prose-strong:text-charcoal-900 prose-strong:font-black prose-a:text-primary-600">
                                <ReactMarkdown>{idea.full_description}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Skills & Requirements */}
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

                        {/* ROI Calculator Section */}
                        <ROICalculator
                            initialDefaults={{
                                investment: idea.initial_investment_min,
                                income: idea.monthly_income_min,
                                expenses: 0
                            }}
                        />

                        {/* Community Reviews */}
                        <ReviewsSection ideaId={idea.id} authorId={idea.author_id} user={user} />
                    </div>

                    {/* Sidebar Metrics */}
                    <div className="space-y-6">

                        {/* User Progress Tracking - Only visible if saved */}
                        {isSaved && (
                            <div className="card border-none shadow-xl p-8 bg-white overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary-600" />
                                <h3 className="text-lg font-black text-charcoal-900 mb-6 flex items-center gap-3 tracking-tight">
                                    <span className="text-xl">📝</span> Your Deployment
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
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Mission Notes</label>
                                        <textarea
                                            value={userNotes}
                                            onChange={(e) => setUserNotes(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium resize-none transition-all"
                                            placeholder="Log your progress, strategy adjustments, or key milestones..."
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        {updateMessage && (
                                            <div className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center animate-float ${updateMessage.includes('✅') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                {updateMessage}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleUpdateProgress}
                                            disabled={updateLoading}
                                            className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${updateMessage.includes('✅')
                                                ? 'bg-emerald-600 text-white shadow-emerald-200'
                                                : 'bg-charcoal-900 text-white hover:bg-primary-600 shadow-charcoal-100'}`}
                                        >
                                            {updateLoading ? 'Synchronizing...' : updateMessage.includes('✅') ? '✓ System Updated' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card sticky top-24 border-none shadow-xl p-8 bg-white">
                            <h3 className="text-lg font-black text-charcoal-900 mb-8 tracking-tight">Vitals & Metrics</h3>

                            <div className="space-y-8">
                                <div>
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-2 font-mono">Initial Capital</div>
                                    <div className="text-2xl font-black text-charcoal-900 tracking-tighter">
                                        {formatCurrency(idea.initial_investment_min)} - {formatCurrency(idea.initial_investment_max)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-2 font-mono">Monthly Yield Target</div>
                                    <div className="text-2xl font-black text-emerald-600 tracking-tighter">
                                        {formatCurrency(idea.monthly_income_min)} - {formatCurrency(idea.monthly_income_max)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-charcoal-50">
                                    <div>
                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mb-1.5 font-mono">Payback</div>
                                        <div className="text-lg font-black text-charcoal-950 tracking-tighter">{idea.time_to_first_income_days} Days</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mb-1.5 font-mono">Probability</div>
                                        <div className="text-lg font-black text-charcoal-950 tracking-tighter">{idea.success_rate_percentage}%</div>
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
            </div>
        </div>
    );
}
