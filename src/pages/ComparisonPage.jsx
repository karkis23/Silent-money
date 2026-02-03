import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

/**
 * Universal Asset Comparator (Financial Battle Engine)
 * 
 * DESIGN PHILOSOPHY:
 * Transposes disparate wealth-generation assets (Income Ideas vs. Franchises) 
 * into a high-fidelity side-by-side analysis matrix. 
 */
export default function ComparisonPage() {
    const { user } = useAuth();
    const [savedAssets, setSavedAssets] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVault = async () => {
            setLoading(true);

            // Fetch saved ideas
            const { data: ideasData } = await supabase
                .from('user_saved_ideas')
                .select(`
                    idea_id,
                    income_ideas (
                        id,
                        title,
                        slug,
                        initial_investment_min,
                        initial_investment_max,
                        monthly_income_min,
                        monthly_income_max,
                        time_to_first_income_days,
                        success_rate_percentage,
                        risk_level,
                        effort_level,
                        categories (name, icon)
                    )
                `)
                .eq('user_id', user.id);

            // Fetch saved franchises
            const { data: franchisesData } = await supabase
                .from('user_saved_franchises')
                .select(`
                    franchise_id,
                    franchises (
                        id,
                        name,
                        slug,
                        investment_min,
                        expected_profit_min,
                        roi_months_min,
                        roi_months_max,
                        category
                    )
                `)
                .eq('user_id', user.id);

            /**
             * UNIFIED DATA STITCHING:
             * Normalizes disparate data structures from 'income_ideas' and 'franchises'
             * into a high-authority unified object for the comparison engine.
             */
            const unifiedAssets = [
                ...(ideasData || []).filter(item => item.income_ideas).map(item => ({
                    ...item.income_ideas,
                    type: 'blueprint',
                    displayTitle: item.income_ideas.title,
                    icon: item.income_ideas.categories?.icon || '📄',
                    categoryName: item.income_ideas.categories?.name,
                    investMin: item.income_ideas.initial_investment_min,
                    investMax: item.income_ideas.initial_investment_max,
                    incomeMin: item.income_ideas.monthly_income_min,
                    incomeMax: item.income_ideas.monthly_income_max,
                    payback: `${item.income_ideas.time_to_first_income_days} Days`,
                    risk: item.income_ideas.risk_level,
                    effort: item.income_ideas.effort_level,
                    link: `/ideas/${item.income_ideas.slug}`
                })),
                ...(franchisesData || []).filter(item => item.franchises).map(item => ({
                    ...item.franchises,
                    type: 'franchise',
                    displayTitle: item.franchises.name,
                    icon: '🏢',
                    categoryName: item.franchises.category,
                    investMin: item.franchises.investment_min,
                    investMax: item.franchises.investment_min,
                    incomeMin: item.franchises.expected_profit_min,
                    incomeMax: item.franchises.expected_profit_min,
                    payback: `${item.franchises.roi_months_min} Months`,
                    risk: 'Medium',
                    effort: 'Active',
                    link: `/franchise/${item.franchises.slug}`
                }))
            ];

            setSavedAssets(unifiedAssets);
            setLoading(false);
        };

        if (user) fetchVault();
    }, [user]);

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            if (selectedIds.length >= 3) return; // Silent cap for premium feel
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const comparedItems = savedAssets.filter(asset => selectedIds.includes(asset.id));

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'N/A';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
        return `₹${amount}`;
    };

    return (
        <div className="min-h-screen bg-[#FBFBFD] pt-32 pb-20 px-4">
            <SEO
                title="Universal Asset Comparator | Silent Money"
                description="Institutional-grade side-by-side analysis of institutional franchises and digital blueprints."
            />

            <div className="max-w-7xl mx-auto">
                <header className="mb-16 text-center max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                        <span className="text-[10px] font-black text-primary-700 uppercase tracking-[0.2em]">Institutional Analysis Matrix</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black text-charcoal-950 mb-6 tracking-tighter leading-tight">
                        Universal <span className="text-primary-600 italic">Comparator</span>
                    </h1>
                    <p className="text-lg text-charcoal-500 font-medium leading-relaxed">
                        Identify optimal yield trajectories by stress-testing franchises against proprietary digital blueprints.
                    </p>
                </header>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left: Asset Selector */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-charcoal-100 p-6 shadow-xl shadow-charcoal-200/20">
                                <h3 className="text-xs font-black text-charcoal-900 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                                    Strategic Vault
                                    <span className="text-[10px] text-primary-600">{selectedIds.length}/3 Selected</span>
                                </h3>

                                <div className="space-y-3">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-charcoal-50 rounded-2xl animate-pulse" />)
                                    ) : savedAssets.length === 0 ? (
                                        <div className="text-center py-10 px-4 border-2 border-dashed border-charcoal-100 rounded-3xl">
                                            <p className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest leading-relaxed">Vault Empty. Seal new blueprints to compare.</p>
                                        </div>
                                    ) : (
                                        savedAssets.map(asset => (
                                            <button
                                                key={asset.id}
                                                onClick={() => toggleSelection(asset.id)}
                                                className={`w-full p-4 rounded-2xl transition-all border flex items-center gap-3 text-left group ${selectedIds.includes(asset.id)
                                                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200'
                                                    : 'bg-white border-charcoal-100 text-charcoal-900 hover:border-primary-200 hover:shadow-md'
                                                    }`}
                                            >
                                                <span className={`text-xl transition-transform group-hover:scale-110 ${selectedIds.includes(asset.id) ? 'opacity-100' : 'opacity-60'}`}>
                                                    {asset.icon}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[11px] font-black uppercase tracking-tight truncate">{asset.displayTitle}</div>
                                                    <div className={`text-[8px] font-bold uppercase tracking-widest ${selectedIds.includes(asset.id) ? 'text-white/60' : 'text-charcoal-400'}`}>
                                                        {asset.type}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Comparison Matrix */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {comparedItems.length > 0 ? (
                                <motion.div
                                    key="comparison-active"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[3rem] border border-charcoal-100 shadow-2xl overflow-hidden"
                                >
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="p-8 border-r border-b border-charcoal-50 bg-charcoal-50/50 w-64 text-left">
                                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Metric Protocol</div>
                                                    </th>
                                                    {comparedItems.map(item => (
                                                        <th key={item.id} className="p-8 border-b border-charcoal-100 min-w-[280px]">
                                                            <div className="relative inline-block mb-6">
                                                                <div className="text-5xl scale-125 mb-4">{item.icon}</div>
                                                                <button
                                                                    onClick={() => toggleSelection(item.id)}
                                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:scale-110 transition-transform"
                                                                >✕</button>
                                                            </div>
                                                            <h3 className="text-xl font-black text-charcoal-950 tracking-tighter mb-1 uppercase">{item.displayTitle}</h3>
                                                            <div className="text-[9px] font-black text-primary-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                                                                {item.type}
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-charcoal-50">
                                                {/* Capital Anchor */}
                                                <tr>
                                                    <td className="p-8 border-r border-charcoal-50 bg-charcoal-50/20 uppercase">
                                                        <div className="text-[11px] font-black text-charcoal-900 tracking-widest mb-1">Capital Anchor</div>
                                                        <div className="text-[8px] font-bold text-charcoal-400">ENTRY COST REQUIRED</div>
                                                    </td>
                                                    {comparedItems.map(item => (
                                                        <td key={item.id} className="p-10 text-center">
                                                            <div className="text-3xl font-black text-charcoal-950 tracking-tighter">
                                                                {formatCurrency(item.investMin)}
                                                            </div>
                                                            <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mt-2">Verified Min Exposure</div>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Yield Spectrum */}
                                                <tr className="bg-primary-50/10">
                                                    <td className="p-8 border-r border-charcoal-50 bg-charcoal-50/20 uppercase">
                                                        <div className="text-[11px] font-black text-primary-700 tracking-widest mb-1">Yield Spectrum</div>
                                                        <div className="text-[8px] font-bold text-primary-600/70">MONTHLY CASH FLOW</div>
                                                    </td>
                                                    {comparedItems.map(item => (
                                                        <td key={item.id} className="p-10 text-center">
                                                            <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                                                                {formatCurrency(item.incomeMin)}
                                                            </div>
                                                            <div className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mt-2">Annualized Trajectory: {formatCurrency(item.incomeMin * 12)}</div>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Performance Gauges */}
                                                <tr>
                                                    <td className="p-8 border-r border-charcoal-50 bg-charcoal-50/20 uppercase">
                                                        <div className="text-[11px] font-black text-charcoal-900 tracking-widest mb-1">Risk & Friction</div>
                                                        <div className="text-[8px] font-bold text-charcoal-400">OPERATIONAL STRAIN</div>
                                                    </td>
                                                    {comparedItems.map(item => (
                                                        <td key={item.id} className="p-10">
                                                            <div className="flex flex-col gap-4">
                                                                <div>
                                                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1.5">
                                                                        <span>Risk Profile</span>
                                                                        <span className={item.risk?.toLowerCase() === 'high' ? 'text-red-500' : 'text-emerald-500'}>{item.risk}</span>
                                                                    </div>
                                                                    <div className="h-1 bg-charcoal-100 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: item.risk?.toLowerCase() === 'high' ? '90%' : item.risk?.toLowerCase() === 'medium' ? '50%' : '20%' }}
                                                                            className={`h-full rounded-full ${item.risk?.toLowerCase() === 'high' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1.5">
                                                                        <span>Effort Index</span>
                                                                        <span className="text-primary-600">{item.effort}</span>
                                                                    </div>
                                                                    <div className="h-1 bg-charcoal-100 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: item.effort?.toLowerCase() === 'active' || item.effort?.toLowerCase() === 'high' ? '85%' : '35%' }}
                                                                            className="h-full bg-primary-600 rounded-full"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* ROI Velocity */}
                                                <tr>
                                                    <td className="p-8 border-r border-charcoal-50 bg-charcoal-50/20 uppercase">
                                                        <div className="text-[11px] font-black text-charcoal-900 tracking-widest mb-1">ROI Velocity</div>
                                                        <div className="text-[8px] font-bold text-charcoal-400">BREAK-EVEN HORIZON</div>
                                                    </td>
                                                    {comparedItems.map(item => (
                                                        <td key={item.id} className="p-10 text-center">
                                                            <div className="text-xl font-black text-charcoal-800 tracking-tight mb-1">{item.payback}</div>
                                                            <div className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest">To Capital Recovery</div>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Strategic Action */}
                                                <tr>
                                                    <td className="p-8 border-r border-charcoal-50 bg-charcoal-50/20"></td>
                                                    {comparedItems.map(item => (
                                                        <td key={item.id} className="p-10">
                                                            <Link
                                                                to={item.link}
                                                                className="w-full h-14 bg-charcoal-950 text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-200 transition-all active:scale-95"
                                                            >
                                                                Full Analytics
                                                            </Link>
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="comparison-empty"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-[600px] bg-white rounded-[3.5rem] border-2 border-dashed border-charcoal-100 flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-24 h-24 bg-charcoal-50 rounded-full flex items-center justify-center text-4xl mb-8 grayscale opacity-50">
                                        ⚔️
                                    </div>
                                    <h3 className="text-3xl font-black text-charcoal-950 tracking-tight mb-4 uppercase">Battle Mode Disabled</h3>
                                    <p className="text-charcoal-500 font-medium max-w-sm mb-10 leading-relaxed">
                                        Select up to 3 high-yield assets from your strategic vault to initiate the institutional comparison matrix.
                                    </p>
                                    <Link to="/ideas" className="btn-secondary px-8 h-14 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                        <span>📂</span> Explore Intelligence Hub
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
