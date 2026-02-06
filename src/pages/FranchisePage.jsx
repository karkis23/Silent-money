import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import CardShimmer from '../components/CardShimmer';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';
import ExpertAuditModal from '../components/ExpertAuditModal';

/**
 * FranchisePage: The institutional marketplace for verified franchise brands in India.
 * 
 * CORE FEATURES:
 * - Vetted ROI Analytics: Filters and displays brands based on proven investment windows.
 * - Multi-Channel Search: Optimized for brand name, utility, and sector-based discovery.
 * - Institutional Favorites: A curated ticker of top-performing high-density brands.
 * - Strategic Auditing: Direct integration with the expert audit request pipeline.
 * - Personalized Discovery: Smart Match filters that align brand requirements with user capital profiles.
 * 
 * @component
 */
export default function FranchisePage() {
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [savedFranchiseIds, setSavedFranchiseIds] = useState(new Set());
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [smartMatch, setSmartMatch] = useState(false);
    const [investmentFilter, setInvestmentFilter] = useState('all');
    const [roiFilter, setRoiFilter] = useState('all');
    const { profile } = useAuth();
    useEffect(() => {
        const fetchFranchises = async () => {
            setLoading(true);
            let query = supabase.from('franchises')
                .select('*, profiles(full_name, id)')
                .eq('is_approved', true) // Moderation Gate
                .is('deleted_at', null)
                .order('is_featured', { ascending: false })
                .order('is_verified', { ascending: false });

            if (selectedCategory !== 'all') {
                query = query.eq('category', selectedCategory);
            }

            if (investmentFilter !== 'all') {
                const max = parseInt(investmentFilter);
                query = query.lte('investment_min', max);
            }

            if (roiFilter !== 'all') {
                const maxRoi = parseInt(roiFilter);
                query = query.lte('roi_months_min', maxRoi);
            }

            if (smartMatch && profile) {
                if (profile.investment_budget) {
                    const budgetMax = profile.investment_budget.includes('Under 5L') ? 500000 :
                        profile.investment_budget.includes('5-25L') ? 2500000 :
                            profile.investment_budget.includes('25-50L') ? 5000000 : 999999999;
                    query = query.lte('investment_min', budgetMax);
                }
            }

            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user;

            const [franchiseRes, savedRes] = await Promise.all([
                query,
                currentUser ? supabase.from('user_saved_franchises').select('franchise_id').eq('user_id', currentUser.id) : Promise.resolve({ data: [] })
            ]);

            if (franchiseRes.data) setFranchises(franchiseRes.data || []);
            if (savedRes.data) {
                setSavedFranchiseIds(new Set(savedRes.data.map(item => item.franchise_id)));
            } else {
                setSavedFranchiseIds(new Set());
            }
            setLoading(false);
        };

        fetchFranchises();
    }, [selectedCategory, investmentFilter, roiFilter, smartMatch, profile]);

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
        ? franchises.filter(f =>
            (f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            (f.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
        )
        : franchises;

    const formatCurrencyShort = (amount) => {
        if (!amount) return 'N/A';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
        return `₹${amount}`;
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-20 md:pt-32 transition-all duration-300">
            <SEO
                title="Verified Franchise Opportunities"
                description="Browse established franchise brands in India with vetted ROI, investment requirements, and growth potential."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. PROFESSIONAL HEADER */}
                <header className="mb-6 md:mb-8 border-b border-charcoal-100 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Verified Franchise List</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-charcoal-950 tracking-tightest leading-none">
                                Franchise <span className="text-primary-600">Business.</span>
                            </h1>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <Link to="/post-franchise" className="w-full md:w-auto px-8 py-4 bg-charcoal-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-charcoal-100 text-center">
                                + Deploy Brand
                            </Link>
                        </div>
                    </div>
                </header>

                {/* 2. COMPACT INTELLIGENCE BAR */}
                <section className="bg-white border border-charcoal-100 rounded-[1.5rem] shadow-premium mb-8 overflow-hidden">
                    <div className="flex flex-col md:flex-row border-b border-charcoal-50">
                        <div className="flex-1 relative border-r border-charcoal-50">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search blueprints..."
                                value={searchQuery}
                                aria-label="Search franchises"
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
                        <div className="px-6 py-3.5 bg-charcoal-50/10 flex items-center justify-center">
                            <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest whitespace-nowrap">
                                {filteredFranchises.length} Brands Verified
                            </div>
                        </div>
                    </div>

                    <div className="p-2 flex flex-col md:flex-row gap-3 bg-charcoal-50/30 items-start md:items-center">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0 hide-scrollbar w-full md:w-auto flex-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'bg-charcoal-900 text-white shadow-lg' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                                >
                                    {cat === 'all' ? 'All Sectors' : cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-charcoal-100 pt-3 md:pt-0 md:pl-4 py-1">
                            <select
                                value={investmentFilter}
                                onChange={(e) => setInvestmentFilter(e.target.value)}
                                className="flex-1 md:w-auto bg-white border border-charcoal-100 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                <option value="all">Any Capital</option>
                                <option value="500000">Under 5L</option>
                                <option value="2500000">Under 25L</option>
                                <option value="5000000">Under 50L</option>
                                <option value="10000000">Under 1Cr</option>
                            </select>

                            <select
                                value={roiFilter}
                                onChange={(e) => setRoiFilter(e.target.value)}
                                className="flex-1 md:w-auto bg-white border border-charcoal-100 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                <option value="all">Any ROI</option>
                                <option value="12">Under 12m</option>
                                <option value="24">Under 24m</option>
                                <option value="36">Under 36m</option>
                            </select>

                            {profile && (
                                <button
                                    onClick={() => setSmartMatch(!smartMatch)}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${smartMatch ? 'bg-primary-600 text-white shadow-lg border-primary-600' : 'bg-white text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50'}`}
                                >
                                    <span className="text-xs">🎯</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none whitespace-nowrap">{smartMatch ? 'Match On' : 'Smart Match'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. TRENDING TICKER (Redesigned) */}
                <div className="mb-8">
                    <div className="flex border-b border-charcoal-50 pb-2 mb-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        <h3 className="text-[8px] font-black text-charcoal-400 uppercase tracking-[0.4em] mb-4 pl-1 whitespace-nowrap">Institutional Favorites</h3>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        {['Amul', 'Tata EV', 'Lenskart', 'Zudio', 'FirstCry'].map(brand => (
                            <button
                                key={brand}
                                onClick={() => setSearchQuery(brand)}
                                className={`px-4 py-2 border rounded-lg text-[10px] font-black transition-all whitespace-nowrap shrink-0 ${searchQuery === brand
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-white border border-gray-200 rounded-3xl" />)}
                        </div>
                    ) : filteredFranchises.length === 0 ? (
                        <EmptyState
                            icon="🏢"
                            title="No Results"
                            message="We couldn't find any brands matching your search. Try adjusting your filters."
                            onAction={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                            <AnimatePresence mode="popLayout">
                                {filteredFranchises.map((f, index) => (
                                    <motion.div
                                        layout
                                        key={f.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <Link to={`/franchise/${f.slug}`} className="group relative block bg-white border border-charcoal-100 rounded-[2rem] overflow-hidden hover:border-primary-300 hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.1)] transition-all h-full flex flex-col p-0">
                                            {/* Visual Header - Fixed Full Bleed */}
                                            <div className="relative h-48 md:h-64 overflow-hidden bg-gray-100 shrink-0">
                                                <img
                                                    src={f.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000'}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    alt={f.name}
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent" />

                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[8px] font-black tracking-widest text-primary-600 uppercase border border-white/20 shadow-sm">
                                                    {f.category}
                                                </div>

                                                <div className="absolute bottom-4 left-4 flex gap-2">
                                                    {f.is_featured && (
                                                        <div className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase shadow-xl flex items-center gap-1">
                                                            ⭐ FEATURED
                                                        </div>
                                                    )}
                                                    {f.is_verified && (
                                                        <div className="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase shadow-xl">
                                                            ✓ VERIFIED
                                                        </div>
                                                    )}
                                                </div>

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

                                                {profile?.income_goal > 0 && f.expected_profit_min > 0 && (
                                                    <div className="absolute bottom-4 right-4 bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[7px] font-black tracking-widest uppercase shadow-xl border border-white/20">
                                                        🚀 +{Math.round((f.expected_profit_min / profile.income_goal) * 100)}% TO GOAL
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-5 md:px-8 pb-6 md:pb-8 pt-6 flex-1 flex flex-col">
                                                <h3 className="text-2xl font-black text-charcoal-950 group-hover:text-primary-600 transition-colors mb-1 tracking-tightest">
                                                    {f.name}
                                                </h3>
                                                {f.profiles && (
                                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                                                        <span>by</span>
                                                        <span className="text-charcoal-900 group-hover:text-primary-600 transition-colors uppercase">{f.profiles?.full_name || 'Verified Partner'}</span>
                                                    </div>
                                                )}
                                                <p className="text-[13px] text-charcoal-500 line-clamp-2 leading-relaxed mb-6 font-medium h-[2.5rem]">
                                                    {f.description}
                                                </p>

                                                {/* Strategic Metrics */}
                                                <div className="grid grid-cols-2 gap-4 md:gap-6 py-5 md:py-6 border-y border-charcoal-50 mb-6 bg-charcoal-50/20 -mx-5 md:-mx-8 px-5 md:px-8">
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
                                                    {/* Personality Match Tag */}
                                                    {profile?.investment_budget && f.investment_min <= (profile.investment_budget.includes('Under 5L') ? 500000 : 2500000) && (
                                                        <div className="px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-[7px] font-black uppercase border border-primary-100">
                                                            BUDGET MATCH
                                                        </div>
                                                    )}
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
                    className="mt-20 md:mt-32 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] bg-gray-950 text-white flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                    <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight relative z-10">Need Detailed Analysis?</h2>
                    <p className="text-gray-400 text-base font-medium max-w-xl mb-8 relative z-10">
                        Request a full business audit for any Indian brand. Our analysts provide a detailed feasibility report within 48 hours.
                    </p>
                    <button
                        onClick={() => setIsAuditModalOpen(true)}
                        className="px-10 py-5 bg-white text-gray-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] relative z-10 hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                    >
                        Request Expert Audit
                    </button>
                </motion.div>
            </div>
            {/* Expert Audit Modal */}
            <ExpertAuditModal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
            />
        </div>
    );
}
