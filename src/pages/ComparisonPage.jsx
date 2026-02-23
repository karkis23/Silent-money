import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

/**
 * Comparison Tool
 * 
 * DESIGN PHILOSOPHY:
 * Shows different income ideas and franchises 
 * in a side-by-side comparison. 
 */
/**
 * ComparisonPage: A simple side-by-side comparison tool.
 * 
 * ARCHITECTURAL STACK:
 * - Data Matching: Combines different data from 'income_ideas' and 'franchises' into a unified model.
 * - Selection Tool: Manages the selection process (1-5 slots) with real-time feedback.
 * - Unified Scroll: Implements a single-container scroll wrapper for mobile to maintain row synchronization.
 * - Intelligence Logic: Automatically identifies top performers (e.g., 'Highest Yield') within the active set.
 */
export default function ComparisonPage() {
    const { user } = useAuth();
    const [savedAssets, setSavedAssets] = useState([]); // All items in user vault
    const [selectedIds, setSelectedIds] = useState([]); // Active comparison set (max 5)
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
             * UNIFIED DATA MATCHING:
             * Combines different data structures from 'income_ideas' and 'franchises'
             * into a unified object for the comparison engine.
             */
            const unifiedAssets = [
                ...(ideasData || []).filter(item => item.income_ideas).map(item => ({
                    ...item.income_ideas,
                    id: `idea-${item.income_ideas.id}`,
                    realId: item.income_ideas.id,
                    type: 'Idea',
                    displayTitle: item.income_ideas.title,
                    icon: item.income_ideas.categories?.icon || '💡',
                    categoryName: item.income_ideas.categories?.name,
                    investMin: item.income_ideas.initial_investment_min,
                    investMax: item.income_ideas.initial_investment_max,
                    incomeMin: item.income_ideas.monthly_income_min,
                    incomeMax: item.income_ideas.monthly_income_max,
                    payback: item.income_ideas.time_to_first_income_days && item.income_ideas.time_to_first_income_days !== 'null' ? `${item.income_ideas.time_to_first_income_days} Days` : 'TBD',
                    risk: item.income_ideas.risk_level || 'Low',
                    effort: item.income_ideas.effort_level || 'Passive',
                    link: `/ideas/${item.income_ideas.slug}`
                })),
                ...(franchisesData || []).filter(item => item.franchises).map(item => ({
                    ...item.franchises,
                    id: `franchise-${item.franchises.id}`,
                    realId: item.franchises.id,
                    type: 'Franchise',
                    displayTitle: item.franchises.name,
                    icon: '🏢',
                    categoryName: item.franchises.category,
                    investMin: item.franchises.investment_min,
                    investMax: item.franchises.investment_max || item.franchises.investment_min,
                    incomeMin: item.franchises.expected_profit_min,
                    incomeMax: item.franchises.expected_profit_max || item.franchises.expected_profit_min,
                    payback: item.franchises.roi_months_min && item.franchises.roi_months_min !== 'null' ? `${item.franchises.roi_months_min} Months` : 'TBD',
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

    /**
     * TOGGLE SELECTION:
     * Manages the active comparison set with a cap of 5 items.
     * Triggers alerts when the limit is hit.
     */
    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            if (selectedIds.length >= 5) {
                toast.error('Limit Reached: Max 5 items for comparison', {
                    style: { background: '#111827', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
                });
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };

    // Filter unified assets into the active comparison set
    const comparedItems = savedAssets.filter(asset => selectedIds.includes(asset.id));

    /**
     * CURRENCY FORMATTER:
     * Scales large figures into readable numbers (k, L, Cr).
     */
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'N/A';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
        return `₹${amount}`;
    };

    return (
        <div className="min-h-screen bg-[#FBFBFD] pt-20 md:pt-32 pb-20 px-4">
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

                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                    {/* Top/Left: Item Selector */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 md:top-32 space-y-6 z-30">
                            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-charcoal-100 p-4 md:p-6 shadow-xl shadow-charcoal-200/20">
                                <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                                    <h3 className="text-[10px] md:text-xs font-black text-charcoal-900 uppercase tracking-[0.2em]">
                                        Saved Items
                                    </h3>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-lg uppercase tracking-widest">{selectedIds.length}/5 Select</span>
                                        {selectedIds.length > 0 && (
                                            <button
                                                onClick={() => setSelectedIds([])}
                                                className="text-[7px] font-black text-red-500 uppercase tracking-[0.2em] hover:text-red-700 transition-colors"
                                            >
                                                [ Clear Selection ]
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex overflow-x-auto md:flex-col gap-3 pb-2 md:pb-0 hide-scrollbar -mx-1 px-1">
                                    {loading ? (
                                        [1, 2, 3].map(i => <div key={i} className="min-w-[140px] md:w-full h-12 md:h-16 bg-charcoal-50 rounded-xl md:rounded-2xl animate-pulse shrink-0" />)
                                    ) : savedAssets.length === 0 ? (
                                        <div className="text-center py-6 md:py-10 px-4 border-2 border-dashed border-charcoal-100 rounded-2xl md:rounded-3xl w-full">
                                            <p className="text-[8px] md:text-[10px] font-black text-charcoal-400 uppercase tracking-widest leading-relaxed">No saved items found.</p>
                                        </div>
                                    ) : (
                                        savedAssets.map(asset => (
                                            <button
                                                key={asset.id}
                                                onClick={() => toggleSelection(asset.id)}
                                                className={`min-w-[140px] md:w-full p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border flex items-center gap-2 md:gap-3 text-left group shrink-0 ${selectedIds.includes(asset.id)
                                                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                                                    : 'bg-white border-charcoal-100 text-charcoal-900 hover:border-primary-200'
                                                    }`}
                                            >
                                                <span className={`text-lg md:text-xl shrink-0 ${selectedIds.includes(asset.id) ? 'opacity-100' : 'opacity-60'}`}>
                                                    {asset.icon}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-tight truncate">{asset.displayTitle}</div>
                                                    <div className={`text-[7px] md:text-[8px] font-bold uppercase tracking-widest ${selectedIds.includes(asset.id) ? 'text-white/60' : 'text-charcoal-400'}`}>
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
                                    {/* Desktop Matrix */}
                                    <div className="hidden md:block overflow-x-auto print:overflow-visible custom-scrollbar">
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
                                                        {comparedItems.map(item => {
                                                            const isHighestIncome = comparedItems.length > 1 && item.incomeMin === Math.max(...comparedItems.map(i => i.incomeMin));
                                                            return (
                                                                <td key={item.id} className={`p-10 text-center relative ${isHighestIncome ? 'bg-emerald-50/30' : ''}`}>
                                                                    {isHighestIncome && (
                                                                        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
                                                                            Highest Yield
                                                                        </div>
                                                                    )}
                                                                    <div className={`text-3xl font-black tracking-tighter ${isHighestIncome ? 'text-emerald-700' : 'text-emerald-600'}`}>
                                                                        {formatCurrency(item.incomeMin)}
                                                                    </div>
                                                                    <div className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mt-2">Annual: {formatCurrency(item.incomeMin * 12)}</div>
                                                                </td>
                                                            );
                                                        })}
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
                                    </div>

                                    {/* Mobile Comparison Hub: Unified Scroll Engine */}
                                    <div className="md:hidden overflow-hidden">
                                        <div className="overflow-x-auto hide-scrollbar scroll-smooth">
                                            <table className="w-full border-collapse table-fixed min-w-max">
                                                <thead>
                                                    <tr className="sticky top-0 z-30 bg-white">
                                                        <th className="sticky left-0 z-40 bg-charcoal-50/80 backdrop-blur-md p-3 w-20 border-b border-r border-charcoal-100 text-left">
                                                            <div className="text-[7px] font-black text-charcoal-400 uppercase tracking-widest">V/S</div>
                                                        </th>
                                                        {comparedItems.map(item => (
                                                            <th key={item.id} className="w-[140px] p-4 text-center border-b border-charcoal-50">
                                                                <div className="text-2xl mb-1">{item.icon}</div>
                                                                <div className="text-[9px] font-black text-charcoal-900 uppercase truncate px-1">{item.displayTitle}</div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-charcoal-50">
                                                    {/* Investment Row */}
                                                    <tr>
                                                        <td className="sticky left-0 z-20 bg-charcoal-50/80 backdrop-blur-md p-4 w-20 border-r border-charcoal-100">
                                                            <div className="text-[7px] font-black text-charcoal-500 uppercase tracking-widest leading-tight">Investment</div>
                                                        </td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-5 text-center">
                                                                <div className="text-base font-black text-charcoal-950 leading-tight mb-0.5">{formatCurrency(item.investMin)}</div>
                                                                <div className="text-[7px] font-bold text-charcoal-400 uppercase tracking-widest">Entry Cost</div>
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    {/* Monthly Income Row */}
                                                    <tr className="bg-primary-50/5">
                                                        <td className="sticky left-0 z-20 bg-primary-50/80 backdrop-blur-md p-4 w-20 border-r border-primary-100">
                                                            <div className="text-[7px] font-black text-primary-700 uppercase tracking-widest leading-tight">Mo. Income</div>
                                                        </td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-5 text-center relative">
                                                                {comparedItems.length > 1 && item.incomeMin === Math.max(...comparedItems.map(i => i.incomeMin)) && (
                                                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                                )}
                                                                <div className="text-base font-black text-emerald-600 leading-tight mb-0.5">{formatCurrency(item.incomeMin)}</div>
                                                                <div className="text-[7px] font-bold text-emerald-600/50 uppercase tracking-widest">Revenue</div>
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    {/* Payback Row */}
                                                    <tr>
                                                        <td className="sticky left-0 z-20 bg-charcoal-50/80 backdrop-blur-md p-4 w-20 border-r border-charcoal-100">
                                                            <div className="text-[7px] font-black text-charcoal-500 uppercase tracking-widest leading-tight">Payback</div>
                                                        </td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-5 text-center">
                                                                <div className="text-xs font-black text-charcoal-800 leading-tight mb-0.5">{item.payback}</div>
                                                                <div className="text-[7px] font-bold text-charcoal-400 uppercase tracking-widest italic leading-none">Break-Even</div>
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    {/* Risk/Load Row */}
                                                    <tr>
                                                        <td className="sticky left-0 z-20 bg-charcoal-50/80 backdrop-blur-md p-4 w-20 border-r border-charcoal-100">
                                                            <div className="text-[7px] font-black text-charcoal-500 uppercase tracking-widest leading-tight">Risk & Load</div>
                                                        </td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-5">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-tight">
                                                                        <span className="text-charcoal-400">Risk:</span>
                                                                        <span className={item.risk?.toLowerCase() === 'high' ? 'text-red-500' : 'text-emerald-500'}>{item.risk}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-tight">
                                                                        <span className="text-charcoal-400">Effort:</span>
                                                                        <span className="text-primary-600">{item.effort}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    {/* Action Row */}
                                                    <tr>
                                                        <td className="sticky left-0 z-20 bg-white p-4 w-20 border-r border-charcoal-50"></td>
                                                        {comparedItems.map(item => (
                                                            <td key={item.id} className="p-4 text-center">
                                                                <Link
                                                                    to={item.link}
                                                                    className="w-full inline-flex h-10 items-center justify-center bg-charcoal-950 text-white rounded-xl text-[8px] font-black uppercase tracking-widest"
                                                                >
                                                                    Details
                                                                </Link>
                                                                <button
                                                                    onClick={() => toggleSelection(item.id)}
                                                                    className="mt-3 w-full text-[7px] font-black text-red-500 uppercase tracking-widest leading-none outline-none"
                                                                >
                                                                    Dismiss
                                                                </button>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
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
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div >
    );
}
