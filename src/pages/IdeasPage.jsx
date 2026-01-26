import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import CardShimmer from '../components/CardShimmer';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';

export default function IdeasPage() {
    const [ideas, setIdeas] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [minIncome, setMinIncome] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');

    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) setSearchQuery(query);
    }, [searchParams]);

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
                .select('*, categories (name, slug), profiles(full_name, id)')
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
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery, minIncome, sortBy]);

    const formatCurrencyShort = (amount) => {
        if (amount === 0) return 'Free';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
        return `₹${amount}`;
    };

    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSortDropdown && !event.target.closest('.sort-dropdown-container')) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSortDropdown]);

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-32 transition-all duration-300">
            <SEO
                title="60+ Vetted Passive Income Ideas"
                description="Explore a curated list of high-yield passive income blueprints for India. Filter by investment, risk, and category."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. ULTRA-MINIMALIST HEADER */}
                <header className="mb-12 border-b border-charcoal-100 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Institutional Grade Assets</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 tracking-tightest leading-none">
                                DISCOVERY <span className="text-primary-600">HUB.</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Market Sentiment</div>
                                <div className="text-sm font-black text-charcoal-950">100+ BLUEPRINTS LIVE</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. COMPACT INTELLIGENCE BAR (Unified Filter) */}
                <section className="bg-white border border-charcoal-100 rounded-[2rem] shadow-premium mb-12 relative">
                    {/* Top Row: Search & Sort */}
                    <div className="flex flex-col md:flex-row border-b border-charcoal-50">
                        <div className="flex-1 relative border-r border-charcoal-50 rounded-t-[2rem] md:rounded-tr-none md:rounded-tl-[2rem] overflow-hidden">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search the asset matrix..."
                                value={searchQuery}
                                aria-label="Search income ideas"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-bold text-charcoal-900 placeholder:text-charcoal-300"
                            />
                        </div>
                        <div className="flex">
                            <div className="px-6 py-5 border-r border-charcoal-50 hidden lg:block">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Yield Floor</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100000"
                                        step="5000"
                                        value={minIncome}
                                        onChange={(e) => setMinIncome(parseInt(e.target.value))}
                                        className="w-32 accent-primary-600 h-1 bg-charcoal-100 rounded-lg cursor-pointer"
                                    />
                                    <span className="text-xs font-black text-primary-600 font-mono">₹{(minIncome / 1000).toFixed(0)}k+</span>
                                </div>
                            </div>

                            {/* CUSTOM DROPDOWN */}
                            <div className="relative sort-dropdown-container">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className={`h-full px-8 py-5 flex items-center gap-3 cursor-pointer transition-all rounded-tr-[2rem] md:rounded-tr-[2rem] md:rounded-tl-none ${showSortDropdown ? 'bg-charcoal-50' : 'hover:bg-charcoal-50/50'}`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-900 whitespace-nowrap">
                                        {sortBy === 'created_at' ? 'Recency Index' :
                                            sortBy === 'upvotes_count' ? 'Popularity Index' :
                                                sortBy === 'monthly_income_min' ? 'Yield Matrix' :
                                                    'Opportunity Matrix'}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: showSortDropdown ? 180 : 0 }}
                                        className="text-[10px] text-charcoal-300"
                                    >
                                        ▼
                                    </motion.span>
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {showSortDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 w-64 pt-2 z-[100]"
                                        >
                                            <div className="bg-white border border-charcoal-100 rounded-[1.5rem] shadow-2xl overflow-hidden shadow-charcoal-900/10 backdrop-blur-xl">
                                                {[
                                                    { id: 'created_at', label: 'Recency Index', icon: '📅' },
                                                    { id: 'upvotes_count', label: 'Popularity Index', icon: '🔥' },
                                                    { id: 'monthly_income_min', label: 'Yield Matrix', icon: '💰' },
                                                    { id: 'monthly_income_max', label: 'Opportunity Matrix', icon: '🚀' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => {
                                                            setSortBy(option.id);
                                                            setShowSortDropdown(false);
                                                        }}
                                                        className={`w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${sortBy === option.id ? 'bg-primary-50 text-primary-600' : 'text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-900'}`}
                                                    >
                                                        <span>{option.icon} {option.label}</span>
                                                        {sortBy === option.id && <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Classification Pills */}
                    <div className="p-3 flex flex-wrap gap-2 bg-charcoal-50/30 rounded-b-[2rem]">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-charcoal-900 text-white shadow-lg' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedCategory === category.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                            >
                                <span>{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. Grid Section */}
                <div className="flex flex-col gap-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => <CardShimmer key={i} />)}
                        </div>
                    ) : ideas.length === 0 ? (
                        <EmptyState
                            icon="📭"
                            title="Null Result"
                            message="No asset matches your current parameters. Reset the matrix to see all blueprints."
                            onAction={() => { setSearchQuery(''); setSelectedCategory('all'); setMinIncome(0); }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode="popLayout">
                                {ideas.map((idea, index) => (
                                    <motion.div
                                        layout
                                        key={idea.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <Link to={`/ideas/${idea.slug}`} className="group relative block bg-white border border-gray-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.08)] transition-all h-full">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase text-blue-600 px-2 py-0.5 bg-blue-50 rounded-lg border border-blue-100">
                                                        {idea.categories?.name}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-colors">
                                                    <span className="text-[10px] font-bold leading-none">{idea.upvotes_count || 0}</span>
                                                    <span className="text-[7px] font-black uppercase tracking-tighter">Impact</span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <h3 className="text-xl font-black text-gray-950 group-hover:text-blue-600 transition-colors mb-1 tracking-tight">
                                                {idea.title}
                                            </h3>
                                            {idea.profiles && (
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                                    <span>by</span>
                                                    <span className="text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{idea.profiles.full_name}</span>
                                                </div>
                                            )}
                                            <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed h-[2.5rem] mb-8 font-medium">
                                                {idea.short_description}
                                            </p>

                                            {/* Detailed Metrics */}
                                            <div className="flex items-center gap-6 mb-8 py-5 border-y border-gray-50">
                                                <div className="flex-1">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Potential Yield</div>
                                                    <div className="text-xl font-black text-gray-950 font-mono tracking-tighter">
                                                        {formatCurrencyShort(idea.monthly_income_min)}
                                                        <span className="text-[10px] text-gray-400 font-medium pl-0.5 tracking-normal">/mo</span>
                                                    </div>
                                                </div>
                                                <div className="w-[1px] h-10 bg-gray-100"></div>
                                                <div className="flex-1">
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 font-mono">Risk Level</div>
                                                    <div className={`text-[12px] font-black uppercase tracking-widest flex items-center gap-2 ${idea.risk_level === 'low' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${idea.risk_level === 'low' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                                        {idea.risk_level}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Effort Tag */}
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg inline-flex items-center gap-2 ${idea.effort_level === 'passive' ? 'bg-emerald-50 text-emerald-600' :
                                                    idea.effort_level === 'semi-passive' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></span>
                                                    {idea.effort_level}
                                                </span>
                                                <span className="text-xs font-black text-gray-950 group-hover:text-blue-600 flex items-center gap-2 transition-all">
                                                    Blueprint <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                </span>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
