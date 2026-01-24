import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function DashboardPage() {
    const { user } = useAuth();
    const [savedIdeas, setSavedIdeas] = useState([]);
    const [myIdeaCount, setMyIdeaCount] = useState(0);
    const [loading, setLoading] = useState(true);

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

            // Fetch count of ideas posted by user
            const { count, error: countError } = await supabase
                .from('income_ideas')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', user.id);

            if (savedError) console.error('Error fetching saved ideas:', savedError);
            if (countError) console.error('Error fetching idea count:', countError);

            setSavedIdeas(saved || []);
            setMyIdeaCount(count || 0);
            setLoading(false);
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const calculatePotentialIncome = () => {
        if (!savedIdeas.length) return 0;
        return savedIdeas.reduce((total, item) => {
            return total + (item.income_ideas?.monthly_income_min || 0);
        }, 0);
    };

    return (
        <div className="min-h-screen bg-cream-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                            Dashboard
                        </h1>
                        <p className="text-charcoal-600">
                            Welcome back, {user?.user_metadata?.full_name || user?.email}
                        </p>
                    </div>
                    <Link
                        to="/edit-profile"
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <span>⚙️</span> Edit Profile
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="text-sm text-charcoal-600 mb-1">Saved Ideas</div>
                        <div className="text-3xl font-bold text-charcoal-900">
                            {savedIdeas.length}
                        </div>
                    </div>

                    <div className="card">
                        <div className="text-sm text-charcoal-600 mb-1">Posted Ideas</div>
                        <div className="text-3xl font-bold text-charcoal-900 group">
                            <Link to="/my-ideas" className="hover:text-sage-700 transition-colors flex items-center gap-2">
                                {myIdeaCount}
                                <span className="text-xs font-normal text-sage-600">Manage →</span>
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <div className="text-sm text-charcoal-600 mb-1">Potential Monthly Income</div>
                        <div className="text-3xl font-bold text-sage-700">
                            ₹{(calculatePotentialIncome() / 1000).toFixed(1)}k
                        </div>
                        <p className="text-xs text-charcoal-400 mt-1">
                            Min/mo from saved
                        </p>
                    </div>

                    <div className="card border-sage-200 bg-sage-50">
                        <div className="text-sm text-sage-800 mb-1 font-semibold">Have an Idea?</div>
                        <Link
                            to="/add-idea"
                            className="inline-block w-full text-center bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors mt-2"
                        >
                            + Post New
                        </Link>
                    </div>
                </div>

                {/* Saved Ideas Section */}
                <div className="bg-white rounded-xl shadow-sm border border-charcoal-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-charcoal-100 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-charcoal-900">
                            Your Saved Ideas
                        </h2>
                        <div className="flex gap-4">
                            <Link to="/my-ideas" className="text-sm text-charcoal-500 hover:text-charcoal-700 font-medium">
                                View My Posts
                            </Link>
                            <Link to="/ideas" className="text-sm text-sage-600 hover:text-sage-700 font-medium">
                                Browse All →
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-charcoal-500">Loading...</p>
                        </div>
                    ) : savedIdeas.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="text-4xl mb-4">🔖</div>
                            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No saved ideas yet</h3>
                            <p className="text-charcoal-500 mb-6 max-w-sm mx-auto">
                                Start building your passive income portfolio by exploring and saving ideas that interest you.
                            </p>
                            <Link to="/ideas" className="btn-primary">
                                Explore Income Ideas
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-charcoal-100">
                            {savedIdeas.map((saved) => (
                                <div key={saved.id} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link
                                                to={`/ideas/${saved.income_ideas.slug}`}
                                                className="text-lg font-semibold text-charcoal-900 hover:text-sage-700"
                                            >
                                                {saved.income_ideas.title}
                                            </Link>
                                            <span className="text-xs bg-charcoal-100 text-charcoal-600 px-2 py-0.5 rounded capitalize">
                                                {saved.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-charcoal-500 mb-2 line-clamp-1">
                                            {saved.income_ideas.short_description}
                                        </p>
                                        <div className="flex gap-4 text-xs text-charcoal-500">
                                            <span>
                                                Income: ₹{(saved.income_ideas.monthly_income_min / 1000).toFixed(0)}k - ₹{(saved.income_ideas.monthly_income_max / 1000).toFixed(0)}k/mo
                                            </span>
                                            <span className="capitalize">
                                                • {saved.income_ideas.effort_level} Effort
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            to={`/ideas/${saved.income_ideas.slug}`}
                                            className="btn-secondary text-sm py-2"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
