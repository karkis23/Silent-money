import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function IdeasPage() {
    const [ideas, setIdeas] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [minIncome, setMinIncome] = useState(0);
    const [sortBy, setSortBy] = useState('created_at'); // upvotes_count or created_at

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('display_order');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchIdeas = async () => {
            setLoading(true);

            let query = supabase
                .from('income_ideas')
                .select('*, categories (name, slug)')
                .order(sortBy, { ascending: false });

            if (selectedCategory !== 'all') {
                query = query.eq('category_id', selectedCategory);
            }

            if (minIncome > 0) {
                query = query.gte('monthly_income_min', minIncome);
            }

            if (searchQuery) {
                query = query.ilike('title', `%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) console.error(error);
            if (data) setIdeas(data);
            setLoading(false);
        };

        const timer = setTimeout(() => {
            fetchIdeas();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery, minIncome, sortBy]);

    const getEffortBadgeColor = (effort) => {
        switch (effort) {
            case 'passive': return 'bg-green-100 text-green-800';
            case 'semi-passive': return 'bg-yellow-100 text-yellow-800';
            case 'active': return 'bg-orange-100 text-orange-800';
            default: return 'bg-charcoal-100 text-charcoal-800';
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-charcoal-900 mb-4">Discover Ideas</h1>
                        <p className="text-charcoal-600 max-w-xl">
                            Filter through vetted passive income opportunities in India.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[240px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search ideas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none transition-all"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-charcoal-200 rounded-xl bg-white text-sm font-medium outline-none"
                        >
                            <option value="created_at">Newest First</option>
                            <option value="upvotes_count">Most Popular</option>
                        </select>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider mb-4">Categories</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all' ? 'bg-sage-600 text-white font-medium shadow-sm' : 'text-charcoal-600 hover:bg-charcoal-100'}`}
                                >
                                    All Categories
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id ? 'bg-sage-600 text-white font-medium shadow-sm' : 'text-charcoal-600 hover:bg-charcoal-100'}`}
                                    >
                                        <span className="mr-2">{category.icon}</span>
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider mb-4">Min. Monthly Income</h3>
                            <input
                                type="range"
                                min="0"
                                max="100000"
                                step="5000"
                                value={minIncome}
                                onChange={(e) => setMinIncome(parseInt(e.target.value))}
                                className="w-full accent-sage-600 mb-2"
                            />
                            <div className="flex justify-between text-xs text-charcoal-500">
                                <span>₹0</span>
                                <span className="font-bold text-sage-700">₹{minIncome.toLocaleString()}</span>
                                <span>₹1L+</span>
                            </div>
                        </section>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-6 animate-pulse">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-charcoal-100 rounded-2xl" />)}
                            </div>
                        ) : ideas.length === 0 ? (
                            <div className="text-center py-24 card bg-white">
                                <div className="text-4xl mb-4">🏜️</div>
                                <h3 className="text-xl font-bold text-charcoal-900 mb-2">No ideas found</h3>
                                <p className="text-charcoal-600">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setMinIncome(0); }}
                                    className="mt-6 text-sage-600 font-bold hover:underline"
                                >
                                    Reset all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {ideas.map((idea) => (
                                    <Link key={idea.id} to={`/ideas/${idea.slug}`} className="card hover:shadow-xl transition-all group border border-charcoal-100 hover:border-sage-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {idea.categories && (
                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-sage-600">
                                                            {idea.categories.name}
                                                        </span>
                                                    )}
                                                    {idea.is_premium && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">PREMIUM</span>}
                                                </div>
                                                <h3 className="text-xl font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors">
                                                    {idea.title}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-center bg-charcoal-50 px-2 py-1 rounded-lg">
                                                <span className="text-sm">👍</span>
                                                <span className="text-[11px] font-bold text-charcoal-700">{idea.upvotes_count || 0}</span>
                                            </div>
                                        </div>

                                        <p className="text-charcoal-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                            {idea.short_description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-cream-100/50 rounded-xl border border-charcoal-50">
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-charcoal-400 mb-1">Monthly Income</span>
                                                <span className="font-bold text-charcoal-900">₹{(idea.monthly_income_min / 1000).toFixed(0)}k+</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-charcoal-400 mb-1">Risk Level</span>
                                                <span className="font-bold text-charcoal-900 capitalize">{idea.risk_level}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${getEffortBadgeColor(idea.effort_level)}`}>
                                                {idea.effort_level}
                                            </span>
                                            <span className="text-sage-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                                View Guide →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
