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
                title="Compare Assets | Silent Money"
                description="Side-by-side comparison of franchises and income ideas."
            />

            <div className="max-w-7xl mx-auto">
                <header className="mb-16 text-center max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                        <span className="text-[10px] font-black text-primary-700 uppercase tracking-[0.2em]">Comparison Tool</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black text-charcoal-950 mb-6 tracking-tighter leading-tight">
                        Compare <span className="text-primary-600 italic">Assets</span>
                    </h1>
                    <p className="text-lg text-charcoal-500 font-medium leading-relaxed mb-8">
                        View different opportunities side-by-side to make the best decision for your goals.
                    </p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => window.print()}
                            className="h-12 px-8 bg-charcoal-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg flex items-center gap-3"
                        >
                            <span>📊</span> Download Report
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left: Asset Selector */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-charcoal-100 p-6 shadow-xl shadow-charcoal-200/20">
                                <h3 className="text-xs font-black text-charcoal-900 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                                    Saved Items
                                    <span className="text-[10px] text-primary-600">{selectedIds.length}/3 Selected</span>
                                </h3>

                                <div className="space-y-3">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-charcoal-50 rounded-2xl animate-pulse" />)
                                    ) : savedAssets.length === 0 ? (
                                        <div className="text-center py-10 px-4 border-2 border-dashed border-charcoal-100 rounded-3xl">
                                            <p className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest leading-relaxed">No saved items found. Save some assets to compare.</p>
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
                                    <div className="overflow-x-auto print:overflow-visible custom-scrollbar">
                                        <div className="min-w-[800px] print:min-w-full">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr>
                                                        <th className="p-8 border-r border-b border-charcoal-50 bg-charcoal-50/50 w-64 text-left">
                                                            <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Metric</div>
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
                                                            <div className="text-[11px] font-black text-charcoal-900 tracking-widest mb-1">Investment</div>
                                                            <div className="text-[8px] font-bold text-charcoal-400">ENTRY COST</div>
                                                        </td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-10 text-center">
                                                                <div className="text-3xl font-black text-charcoal-950 tracking-tighter">
                                                                    {formatCurrency(item.investMin)}
                                                                </div>
                                                                <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest mt-2">Min Investment</div>
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    {/* Yield Spectrum */}
                                                    <tr className="bg-primary-50/10">
                                                        <td className="p-8 border-r border-charcoal-50 bg-charcoal-50/20 uppercase">
                                                            <div className="text-[11px] font-black text-primary-700 tracking-widest mb-1">Income</div>
                                                            <div className="text-[8px] font-bold text-primary-600/70">MONTHLY</div>
                                                        </td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-10 text-center">
                                                                <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                                                                    {formatCurrency(item.incomeMin)}
                                                                </div>
                                                                <div className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mt-2">Annual: {formatCurrency(item.incomeMin * 12)}</div>
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    {/* Performance Gauges */}
                                                    <tr>
                                                        <td className="p-8 border-r border-charcoal-50 bg-charcoal-50/20 uppercase">
                                                            <div className="text-[11px] font-black text-charcoal-900 tracking-widest mb-1">Effort & Risk</div>
                                                            <div className="text-[8px] font-bold text-charcoal-400">OPERATIONAL</div>
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
                                                                            <span>Time Effort</span>
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
                                                            <div className="text-[11px] font-black text-charcoal-900 tracking-widest mb-1">Payback Period</div>
                                                            <div className="text-[8px] font-bold text-charcoal-400">BREAK-EVEN</div>
                                                        </td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-10 text-center">
                                                                <div className="text-xl font-black text-charcoal-800 tracking-tight mb-1">{item.payback}</div>
                                                                <div className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest">To Recover Capital</div>
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
                                                                    View Details
                                                                </Link>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-4 bg-charcoal-50/50 border-t border-charcoal-50 text-center lg:hidden">
                                            <span className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest italic">← Swipe to compare assets →</span>
                                        </div>
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
                                    <h3 className="text-3xl font-black text-charcoal-950 tracking-tight mb-4 uppercase">No Assets Selected</h3>
                                    <p className="text-charcoal-500 font-medium max-w-sm mb-10 leading-relaxed">
                                        Select up to 3 assets from your saved items to start comparing.
                                    </p>
                                    <Link to="/ideas" className="btn-secondary px-8 h-14 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                        <span>📂</span> Browse Ideas
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Institutional Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    nav, footer, .lg\\:col-span-1, .btn-secondary, button { display: none !important; }
                    body { background: white !important; }
                    .min-h-screen { padding-top: 0 !important; }
                    .max-w-7xl { max-width: 100% !important; }
                    .lg\\:col-span-3 { width: 100% !important; grid-column: span 4 / span 4 !important; }
                    .bg-white { border: none !important; shadow: none !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #e5e7eb !important; padding: 1.5rem !important; }
                    .text-5xl { font-size: 2rem !important; scale: 1 !important; }
                    h1 { font-size: 2.5rem !important; text-align: center !important; }
                    p { text-align: center !important; }
                }
            `}} />
        </div>
    );
}
