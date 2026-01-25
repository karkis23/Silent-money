import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import CardShimmer from '../components/CardShimmer';

export default function FranchisePage() {
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [savedFranchiseIds, setSavedFranchiseIds] = useState(new Set());
    const { user } = supabase.auth?.getSession() || {}; // Fallback if auth context isn't globally available here

    useEffect(() => {
        fetchFranchises();
    }, [selectedCategory]);

    const fetchFranchises = async () => {
        setLoading(true);
        let query = supabase.from('franchises').select('*').order('is_verified', { ascending: false });

        if (selectedCategory !== 'all') {
            query = query.eq('category', selectedCategory);
        }

        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;

        const [franchiseRes, savedRes] = await Promise.all([
            query,
            currentUser ? supabase.from('user_saved_franchises').select('franchise_id').eq('user_id', currentUser.id) : Promise.resolve({ data: [] })
        ]);

        if (franchiseRes.data) setFranchises(franchiseRes.data);
        if (savedRes.data) {
            setSavedFranchiseIds(new Set(savedRes.data.map(item => item.franchise_id)));
        }
        setLoading(false);
    };

    const handleSave = async (e, franchiseId) => {
        e.preventDefault();
        e.stopPropagation();

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Please sign in to save opportunities.');
            return;
        }

        const isSaved = savedFranchiseIds.has(franchiseId);

        if (isSaved) {
            const { error } = await supabase
                .from('user_saved_franchises')
                .delete()
                .eq('user_id', session.user.id)
                .eq('franchise_id', franchiseId);

            if (!error) {
                const newSaved = new Set(savedFranchiseIds);
                newSaved.delete(franchiseId);
                setSavedFranchiseIds(newSaved);
            }
        } else {
            const { error } = await supabase
                .from('user_saved_franchises')
                .insert([{ user_id: session.user.id, franchise_id: franchiseId }]);

            if (!error) {
                const newSaved = new Set(savedFranchiseIds);
                newSaved.add(franchiseId);
                setSavedFranchiseIds(newSaved);
            }
        }
    };

    const categories = ['all', 'Food & Beverage', 'Retail', 'Logistics', 'Healthcare', 'Education'];

    const filteredFranchises = searchQuery
        ? franchises.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : franchises;

    const formatCurrencyShort = (amount) => {
        if (!amount) return 'N/A';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
        return `₹${amount}`;
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-32 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. PROFESSIONAL HEADER */}
                <header className="mb-12 border-b border-charcoal-100 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Verified ROI Matrix</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 tracking-tightest leading-none">
                                FRANCHISE <span className="text-primary-600">EMPIRE.</span>
                            </h1>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/post-franchise" className="w-full sm:w-auto px-8 py-4 bg-charcoal-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-charcoal-100">
                                + Deploy Brand
                            </Link>
                        </div>
                    </div>
                </header>

                {/* 2. COMPACT INTELLIGENCE BAR */}
                <section className="bg-white border border-charcoal-100 rounded-[2rem] shadow-premium mb-12 overflow-hidden">
                    <div className="flex flex-col md:flex-row border-b border-charcoal-50">
                        <div className="flex-1 relative border-r border-charcoal-50">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by brand name or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-bold text-charcoal-900 placeholder:text-charcoal-300"
                            />
                        </div>
                        <div className="px-8 py-5 bg-charcoal-50/30 flex items-center justify-center">
                            <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">
                                Global Expansion Ready
                            </div>
                        </div>
                    </div>

                    <div className="p-3 flex flex-wrap gap-2 bg-charcoal-50/30">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-charcoal-900 text-white shadow-lg' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                            >
                                {cat === 'all' ? 'All Sectors' : cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. TRENDING TICKER (Redesigned) */}
                <div className="mb-12">
                    <h3 className="text-[8px] font-black text-charcoal-400 uppercase tracking-[0.4em] mb-4 pl-1">Institutional Favorites</h3>
                    <div className="flex flex-wrap gap-3">
                        {['Amul', 'Tata EV', 'Lenskart', 'Zudio', 'FirstCry'].map(brand => (
                            <button
                                key={brand}
                                onClick={() => setSearchQuery(brand)}
                                className={`px-4 py-2 border rounded-lg text-[10px] font-black transition-all ${searchQuery === brand
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'bg-white border-charcoal-100 text-charcoal-600 hover:border-primary-200'
                                    }`}
                            >
                                {brand}
                            </button>
                        ))}
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 text-[10px] font-black text-red-500 hover:text-red-600 underline"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. PROFESSIONAL 3-COLUMN FRANCHISE GRID */}
                <div className="flex flex-col gap-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-white border border-gray-200 rounded-3xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode="popLayout">
                                {franchises.filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase())).map((f, index) => (
                                    <motion.div
                                        layout
                                        key={f.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <Link to={`/franchise/${f.slug}`} className="group relative block bg-white border border-charcoal-100 rounded-[2.5rem] overflow-hidden hover:border-primary-300 hover:shadow-premium transition-all">
                                            {/* Visual Header */}
                                            <div className="relative h-60 overflow-hidden m-4 rounded-[2rem]">
                                                <img
                                                    src={f.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    alt={f.name}
                                                />
                                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest text-primary-600 uppercase border border-primary-50">
                                                    {f.category}
                                                </div>
                                                {f.is_verified && (
                                                    <div className="absolute bottom-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[8px] font-black tracking-widest uppercase shadow-lg">
                                                        ✓ VERIFIED ROI
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => handleSave(e, f.id)}
                                                    className={`absolute top-4 left-4 w-11 h-11 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all ${savedFranchiseIds.has(f.id)
                                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                                        : 'bg-white/90 text-charcoal-400 hover:text-primary-600 hover:scale-110'
                                                        }`}
                                                >
                                                    <svg className="w-5 h-5" fill={savedFranchiseIds.has(f.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="px-8 pb-8 pt-2">
                                                <h3 className="text-2xl font-black text-charcoal-950 group-hover:text-primary-600 transition-colors mb-2 tracking-tightest">
                                                    {f.name}
                                                </h3>
                                                <p className="text-[13px] text-charcoal-500 line-clamp-2 leading-relaxed mb-6 font-medium h-[2.5rem]">
                                                    {f.description}
                                                </p>

                                                {/* Strategic Metrics */}
                                                <div className="grid grid-cols-2 gap-6 py-6 border-y border-charcoal-50 mb-6 bg-charcoal-50/20 -mx-8 px-8">
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mb-1.5 font-mono">Investment</div>
                                                        <div className="text-xl font-black text-charcoal-900 font-mono tracking-tighter">
                                                            {formatCurrencyShort(f.investment_min)}
                                                        </div>
                                                    </div>
                                                    <div className="border-l border-charcoal-100 pl-6">
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mb-1.5 font-mono">ROI Window</div>
                                                        <div className="text-xl font-black text-emerald-600 font-mono tracking-tighter">
                                                            {f.roi_months_min}-{f.roi_months_max}
                                                            <span className="text-[10px] text-charcoal-400 ml-1 tracking-normal font-sans uppercase">mo</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Monthly Yield</div>
                                                        <div className="text-lg font-black text-primary-600">{formatCurrencyShort(f.expected_profit_min)}<span className="text-[10px] text-charcoal-400 pl-0.5 tracking-normal lowercase">/mo</span></div>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-2xl bg-charcoal-950 text-white flex items-center justify-center group-hover:bg-primary-600 transition-all group-hover:translate-x-1 shadow-xl">
                                                        →
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* 5. AUDIT CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 p-12 rounded-[3rem] bg-gray-950 text-white flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                    <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight relative z-10">Unlisted Brand Analysis?</h2>
                    <p className="text-gray-400 text-base font-medium max-w-xl mb-8 relative z-10">
                        Request a full ROI audit for any Indian brand. Our analysts provide a deep-dive feasibility report within 48 hours.
                    </p>
                    <button className="px-10 py-5 bg-white text-gray-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] relative z-10 hover:bg-blue-500 hover:text-white transition-all shadow-2xl">
                        Request Expert Audit
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
