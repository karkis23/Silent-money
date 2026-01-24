import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function MyIdeasPage() {
    const { user } = useAuth();
    const [myIdeas, setMyIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyIdeas = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('income_ideas')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching my ideas:', error);
                setError('Failed to load your ideas.');
            } else {
                setMyIdeas(data || []);
            }
            setLoading(false);
        };

        if (user) {
            fetchMyIdeas();
        }
    }, [user]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('income_ideas')
                .delete()
                .eq('id', id)
                .eq('author_id', user.id); // Extra safety

            if (error) throw error;

            setMyIdeas(myIdeas.filter(idea => idea.id !== id));
        } catch (err) {
            console.error('Error deleting idea:', err);
            alert('Failed to delete idea: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">My Posted Ideas</h1>
                        <p className="text-charcoal-600">Manage the ideas you've shared with the community</p>
                    </div>
                    <Link to="/add-idea" className="btn-primary flex items-center gap-2">
                        <span>+</span> Add New
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-charcoal-500">Loading your ideas...</p>
                    </div>
                ) : myIdeas.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-4xl mb-4">✍️</div>
                        <h3 className="text-lg font-medium text-charcoal-900 mb-2">You haven't posted any ideas yet</h3>
                        <p className="text-charcoal-500 mb-8 max-w-sm mx-auto">
                            Share your knowledge with others by posting your first passive income idea.
                        </p>
                        <Link to="/add-idea" className="btn-primary">
                            Post First Idea
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myIdeas.map((idea) => (
                            <div key={idea.id} className="card hover:shadow-md transition-shadow group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors">
                                                {idea.title}
                                            </h2>
                                            {idea.is_premium && (
                                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    Premium
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-charcoal-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                            {idea.short_description}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-xs text-charcoal-500">
                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-charcoal-50 rounded-md">
                                                💰 Min ₹{(idea.monthly_income_min / 1000).toFixed(0)}k/mo
                                            </span>
                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-charcoal-50 rounded-md capitalize">
                                                ⚙️ {idea.effort_level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-charcoal-100 pt-4 md:pt-0 md:pl-4">
                                        <Link
                                            to={`/edit-idea/${idea.id}`}
                                            className="p-2 text-charcoal-400 hover:text-blue-500 transition-colors"
                                            title="Edit Idea"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <Link
                                            to={`/ideas/${idea.slug}`}
                                            className="p-2 text-charcoal-400 hover:text-sage-600 transition-colors"
                                            title="View Details"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(idea.id)}
                                            className="p-2 text-charcoal-400 hover:text-red-500 transition-colors"
                                            title="Delete Idea"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
