import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import CardShimmer from '../components/CardShimmer';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';

/**
 * IdeasPage: The primary intelligence engine for passive income blueprints.
 * 
 * CORE ARCHITECTURE:
 * - Dynamic intelligence filtering (Risk, Effort, Income, Category).
 * - Personality Alignment: 'Smart Match' logic that cross-references user profile data 
 *   (budget, risk tolerance) with asset metadata.
 * - Reactive Sorting: Implements high-velocity sorting via Supabase query optimization.
 * - Discovery Feed: A responsive 3-column grid designed for rapid cognitive processing of opportunities.
 * 
 * @component
 */
export default function IdeasPage() {
    const [ideas, setIdeas] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [minIncome, setMinIncome] = useState(0);
    const [selectedRisk, setSelectedRisk] = useState('all');
    const [selectedEffort, setSelectedEffort] = useState('all');
    const [smartMatch, setSmartMatch] = useState(false);
    const [sortBy, setSortBy] = useState('created_at');
    const { profile } = useAuth();

    useEffect(() => {
        const query = searchParams.get('search');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (query !== null && query !== searchQuery) setSearchQuery(query);
    }, [searchParams, searchQuery]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('display_order');
            setCategories(data || []);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchIdeas = async () => {
            setLoading(true);

            let query = supabase
                .from('income_ideas')
                .select('*, categories (name, slug), profiles(full_name, id)')
                .order('is_featured', { ascending: false })
                .order(sortBy, { ascending: false });

            // Moderation Gate: Only show approved and non-deleted ideas
            query = query.eq('is_approved', true).is('deleted_at', null);

            if (selectedCategory !== 'all') {
                query = query.eq('category_id', selectedCategory);
            }

            if (minIncome > 0) {
                query = query.gte('monthly_income_min', minIncome);
            }

            if (selectedRisk !== 'all') {
                query = query.eq('risk_level', selectedRisk);
            }

            if (selectedEffort !== 'all') {
                query = query.eq('effort_level', selectedEffort);
            }

            if (smartMatch && profile) {
                // Apply smart match based on user profile
                if (profile.risk_tolerance) query = query.eq('risk_level', profile.risk_tolerance.toLowerCase());
                if (profile.investment_budget) {
                    const budgetMax = profile.investment_budget.includes('Under 5L') ? 500000 :
                        profile.investment_budget.includes('5-25L') ? 2500000 :
                            profile.investment_budget.includes('25-50L') ? 5000000 : 999999999;
                    query = query.lte('initial_investment_min', budgetMax);
                }
            }

            if (searchQuery) {
                query = query.ilike('title', `%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) console.error(error);
            setIdeas(data || []);
            setLoading(false);
        };

        const timer = setTimeout(() => {
            fetchIdeas();
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery, minIncome, selectedRisk, selectedEffort, smartMatch, sortBy, profile]);

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
        <div className="min-h-screen bg-cream-50 pb-20 pt-20 md:pt-32 transition-all duration-300">
            <SEO
                title="60+ Vetted Passive Income Ideas"
                description="Explore a curated list of high-yield passive income blueprints for India. Filter by investment, risk, and category."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. ULTRA-MINIMALIST HEADER */}
                <header className="mb-6 md:mb-8 border-b border-charcoal-100 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Verified Business Ideas</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-charcoal-950 tracking-tightest leading-none">
                                Browse <span className="text-primary-600">Ideas.</span>
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
                <section className="bg-white border border-charcoal-100 rounded-[2rem] md:rounded-[1.5rem] shadow-premium mb-6 md:mb-8 relative overflow-hidden">
                    {/* Top Row: Search & Sort */}
                    <div className="flex flex-col md:flex-row border-b border-charcoal-50">
                        <div className="flex-1 relative border-r border-charcoal-50">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search blueprints..."
                                value={searchQuery}
                                aria-label="Search income ideas"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-transparent outline-none font-bold text-charcoal-900 placeholder:text-charcoal-300 text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-charcoal-50 text-charcoal-400 rounded-lg hover:text-charcoal-900 transition-colors"
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="flex">
                            <div className="px-6 py-3.5 border-r border-charcoal-50 hidden lg:block">
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest">Min Monthly Income</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100000"
                                        step="5000"
                                        value={minIncome}
                                        onChange={(e) => setMinIncome(parseInt(e.target.value))}
                                        className="w-24 accent-primary-600 h-1 bg-charcoal-50 rounded-lg cursor-pointer"
                                    />
                                    <span className="text-[10px] font-black text-primary-600">₹{(minIncome / 1000).toFixed(0)}k+</span>
                                </div>
                            </div>

                            {/* CUSTOM DROPDOWN */}
                            <div className="relative sort-dropdown-container">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className={`h-full px-6 py-3.5 flex items-center gap-3 cursor-pointer transition-all border-r border-charcoal-50 ${showSortDropdown ? 'bg-charcoal-50' : 'hover:bg-charcoal-50/50'}`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-900 whitespace-nowrap">
                                        {sortBy === 'created_at' ? 'Newest First' :
                                            sortBy === 'upvotes_count' ? 'Most Popular' :
                                                sortBy === 'monthly_income_min' ? 'Highest Income' :
                                                    'Highest Income'}
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
                                                    { id: 'created_at', label: 'Newest First', icon: '📅' },
                                                    { id: 'upvotes_count', label: 'Most Popular', icon: '🔥' },
                                                    { id: 'monthly_income_min', label: 'Highest Income', icon: '💰' },
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

                            {/* SMART MATCH TOGGLE */}
                            {profile && (
                                <div className="flex items-center px-4 md:px-6 py-3 md:py-3.5 bg-primary-50/10 shrink-0">
                                    <button
                                        onClick={() => setSmartMatch(!smartMatch)}
                                        className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl transition-all ${smartMatch ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                                    >
                                        <span className="text-xs">🎯</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest leading-none whitespace-nowrap">Smart Match</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: Classification Pills & Expanded Filters */}
                    <div className="p-2 md:p-3 flex flex-col md:flex-row gap-3 md:gap-4 bg-charcoal-50/30 rounded-b-[2rem] items-start md:items-center">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 hide-scrollbar w-full md:w-auto flex-1">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${selectedCategory === 'all' ? 'bg-charcoal-900 text-white shadow-lg' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                            >
                                All Sectors
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${selectedCategory === category.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                                >
                                    <span>{category.icon}</span>
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-charcoal-100 pt-3 md:pt-0 md:pl-4 h-full py-1">
                            <select
                                value={selectedRisk}
                                onChange={(e) => setSelectedRisk(e.target.value)}
                                className="flex-1 md:w-auto bg-white border border-charcoal-100 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                <option value="all">Any Risk</option>
                                <option value="low">Low Risk</option>
                                <option value="medium">Medium Risk</option>
                                <option value="high">High Risk</option>
                            </select>

                            <select
                                value={selectedEffort}
                                onChange={(e) => setSelectedEffort(e.target.value)}
                                className="flex-1 md:w-auto bg-white border border-charcoal-100 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                <option value="all">All Effort</option>
                                <option value="passive">Passive</option>
                                <option value="semi-passive">Semi-Passive</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 3. Grid Section */}
                <div className="flex flex-col gap-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => <CardShimmer key={i} />)}
                        </div>
                    ) : ideas.length === 0 ? (
                        <EmptyState
                            icon="📭"
                            title="No Results"
                            message="No ideas match your filters. Try resetting to see all ideas."
                            onAction={() => { setSearchQuery(''); setSelectedCategory('all'); setMinIncome(0); }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
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
                                        <Link to={`/ideas/${idea.slug}`} className="group relative block bg-white border border-gray-200 rounded-[2rem] hover:border-blue-300 hover:shadow-[0_40px_80px_-15px_rgba(25,70,180,0.1)] transition-all h-full overflow-hidden p-0 flex flex-col">
                                            {/* Visual Header - Fixed Full Bleed */}
                                            <div className="relative h-48 md:h-56 w-full overflow-hidden bg-gray-100 shrink-0">
                                                <img
                                                    src={idea.image_url || (
                                                        idea.categories?.name?.toLowerCase().includes('content') ? `https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1000&auto=format&fit=crop&sig=${idea.id}` :
                                                            idea.categories?.name?.toLowerCase().includes('rental') ? `https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop&sig=${idea.id}` :
                                                                idea.categories?.name?.toLowerCase().includes('automation') ? `https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop&sig=${idea.id}` :
                                                                    idea.categories?.name?.toLowerCase().includes('marketing') ? `https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop&sig=${idea.id}` :
                                                                        `https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1000&auto=format&fit=crop&sig=${idea.id}`
                                                    )}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    alt={idea.title}
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent" />

                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black tracking-widest text-blue-600 uppercase border border-white/20 shadow-sm">
                                                    {idea.categories?.name}
                                                </div>
                                                <div className="absolute bottom-4 left-4 flex gap-2">
                                                    {idea.is_featured && (
                                                        <span className="bg-amber-500/90 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-[7px] font-black tracking-widest uppercase shadow-xl flex items-center gap-1">
                                                            ⭐ FEATURED
                                                        </span>
                                                    )}
                                                    <span className="bg-emerald-500/90 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-[7px] font-black tracking-widest uppercase shadow-xl">
                                                        ✓ VERIFIED
                                                    </span>
                                                    {idea.is_premium && (
                                                        <span className="bg-primary-600/90 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-[7px] font-black tracking-widest uppercase shadow-xl">
                                                            ⭐ PREMIUM
                                                        </span>
                                                    )}
                                                    {profile?.income_goal > 0 && (
                                                        <span className="bg-emerald-600/90 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-[7px] font-black tracking-widest uppercase shadow-xl border border-white/20">
                                                            🚀 +{Math.round((idea.monthly_income_min / profile.income_goal) * 100)}% TO GOAL
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 md:p-8 flex flex-col flex-1">

                                                {/* Impact Metric */}
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex flex-col items-start gap-0.5">
                                                        <div className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Global Rank</div>
                                                        <div className="text-sm font-black text-gray-950 uppercase tracking-tighter">
                                                            #{index + 1} Strategic Asset
                                                        </div>
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
                                                        <span className="text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{idea.profiles?.full_name || 'Anonymous'}</span>
                                                    </div>
                                                )}
                                                <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed h-[2.5rem] mb-8 font-medium">
                                                    {idea.short_description}
                                                </p>

                                                {/* Detailed Metrics */}
                                                <div className="flex items-center gap-6 mb-8 py-5 border-y border-gray-50">
                                                    <div className="flex-1">
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Monthly Income</div>
                                                        <div className="text-xl font-black text-gray-950 tracking-tighter">
                                                            {formatCurrencyShort(idea.monthly_income_min)}
                                                            <span className="text-[10px] text-gray-400 font-medium pl-0.5 tracking-normal">/mo</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-[1px] h-10 bg-gray-100"></div>
                                                    <div className="flex-1">
                                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ">Risk Level</div>
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
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
