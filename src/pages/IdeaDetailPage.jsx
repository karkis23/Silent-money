import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import ROICalculator from '../components/ROICalculator';

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

    useEffect(() => {
        const fetchIdea = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('income_ideas')
                .select(`
          *,
          categories (name, slug, icon)
        `)
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Error fetching idea:', error);
                setError('Idea not found');
            } else {
                setIdea(data);
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

    // Upvote state
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [voteCount, setVoteCount] = useState(0);
    const [voteLoading, setVoteLoading] = useState(false);

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

        if (idea) {
            setVoteCount(idea.upvotes_count || 0);
            checkVoteStatus();
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

        const { error } = await supabase
            .from('user_saved_ideas')
            .update({
                status: userStatus,
                notes: userNotes,
                updated_at: new Date()
            })
            .eq('id', savedData.id);

        if (error) {
            console.error('Error updating progress:', error);
            setUpdateMessage('Failed to save changes.');
        } else {
            setUpdateMessage('Changes saved!');
            setTimeout(() => setUpdateMessage(''), 3000);
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
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 mb-6 leading-tight tracking-tighter">
                                    {idea.title}
                                </h1>

                                <p className="text-xl text-charcoal-600 font-medium leading-relaxed max-w-2xl">
                                    {idea.short_description}
                                </p>
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
                            <p className="text-yellow-800 leading-relaxed">
                                {idea.reality_check}
                            </p>
                        </div>

                        {/* Markdown-like Description */}
                        <div className="card prose prose-charcoal max-w-none">
                            <h3 className="text-xl font-bold text-charcoal-900 mb-4">How it works</h3>
                            <div className="whitespace-pre-wrap text-charcoal-700 leading-relaxed">
                                {idea.full_description}
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
                    </div>

                    {/* Sidebar Metrics */}
                    <div className="space-y-6">

                        {/* User Progress Tracking - Only visible if saved */}
                        {isSaved && (
                            <div className="card bg-sage-50 border-sage-200">
                                <h3 className="text-lg font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                                    <span>📝</span> Your Progress
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal-700 mb-1">Status</label>
                                        <select
                                            value={userStatus}
                                            onChange={(e) => setUserStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 bg-white"
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
                                        <label className="block text-sm font-medium text-charcoal-700 mb-1">Notes</label>
                                        <textarea
                                            value={userNotes}
                                            onChange={(e) => setUserNotes(e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 bg-white resize-none"
                                            placeholder="Jot down your thoughts, plans, or questions..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-sage-700 font-medium h-4 block">
                                            {updateMessage}
                                        </span>
                                        <button
                                            onClick={handleUpdateProgress}
                                            disabled={updateLoading}
                                            className="bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {updateLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card sticky top-24">
                            <h3 className="text-lg font-bold text-charcoal-900 mb-6">Key Metrics</h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-sm text-charcoal-500 mb-1">Initial Investment</div>
                                    <div className="text-xl font-bold text-charcoal-900">
                                        {formatCurrency(idea.initial_investment_min)} - {formatCurrency(idea.initial_investment_max)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-charcoal-500 mb-1">Monthly Income Potential</div>
                                    <div className="text-xl font-bold text-sage-700">
                                        {formatCurrency(idea.monthly_income_min)} - {formatCurrency(idea.monthly_income_max)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-charcoal-500 mb-1">Time to First ₹</div>
                                        <div className="font-semibold text-charcoal-900">{idea.time_to_first_income_days} days</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-charcoal-500 mb-1">Success Rate</div>
                                        <div className="font-semibold text-charcoal-900">{idea.success_rate_percentage}%</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-charcoal-100 space-y-3">
                                    <div className={`px-3 py-2 rounded-lg border flex justify-between items-center ${getRiskColor(idea.risk_level)}`}>
                                        <span className="font-medium capitalize">Risk Level</span>
                                        <span className="font-bold capitalize">{idea.risk_level}</span>
                                    </div>

                                    <div className="px-3 py-2 rounded-lg bg-charcoal-50 border border-charcoal-200 flex justify-between items-center text-charcoal-700">
                                        <span className="font-medium capitalize">Effort</span>
                                        <span className="font-bold capitalize">{idea.effort_level}</span>
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
