import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function ComparisonPage() {
    const { user } = useAuth();
    const [savedIdeas, setSavedIdeas] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVault = async () => {
            setLoading(true);
            // Fetch saved ideas
            const { data, error } = await supabase
                .from('user_saved_ideas')
                .select(`
                    id,
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

            if (data) {
                setSavedIdeas(data.map(item => item.income_ideas));
            }
            setLoading(false);
        };

        if (user) fetchVault();
    }, [user]);

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            if (selectedIds.length >= 3) {
                alert("You can compare up to 3 blueprints at a time.");
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const getComparisonData = () => {
        return savedIdeas.filter(idea => selectedIds.includes(idea.id));
    };

    const formatCurrency = (amount) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
        return `₹${amount}`;
    };

    const comparedItems = getComparisonData();

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4">
            <SEO title="Asset Comparison Matrix | Silent Money" />
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-charcoal-950 mb-4 tracking-tighter">
                        Tactical <span className="text-primary-600">Comparison</span>
                    </h1>
                    <p className="text-charcoal-500 font-medium">
                        Analyze your saved blueprints side-by-side to optimize your portfolio.
                    </p>
                </header>

                {/* Selection Tray */}
                <div className="card mb-12 border-none shadow-xl p-6 bg-white">
                    <h2 className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-4">Select Assets from Vault (Max 3)</h2>
                    <div className="flex flex-wrap gap-4">
                        {loading ? (
                            <div className="text-sm text-charcoal-400">Loading vault...</div>
                        ) : savedIdeas.length === 0 ? (
                            <div className="text-sm text-charcoal-400">No assets in vault. Save some ideas first.</div>
                        ) : (
                            savedIdeas.map(idea => (
                                <button
                                    key={idea.id}
                                    onClick={() => toggleSelection(idea.id)}
                                    className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center gap-2 ${selectedIds.includes(idea.id)
                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                        : 'border-charcoal-100 text-charcoal-600 hover:border-charcoal-300'
                                        }`}
                                >
                                    <span className="text-lg">{idea.categories?.icon || '📄'}</span>
                                    {idea.title}
                                    {selectedIds.includes(idea.id) && <span className="text-primary-600">✓</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Comparison Grid */}
                {comparedItems.length > 0 && (
                    <div className="overflow-x-auto pb-8">
                        <div className="min-w-[800px] grid grid-cols-[200px_repeat(3,1fr)] gap-0 border border-charcoal-200 rounded-3xl overflow-hidden bg-white shadow-2xl">

                            {/* Header Row */}
                            <div className="p-6 bg-charcoal-50 border-r border-b border-charcoal-100 flex items-center font-black text-charcoal-400 uppercase tracking-widest text-xs">
                                Metric
                            </div>
                            {comparedItems.map(item => (
                                <div key={item.id} className="p-6 bg-charcoal-50 border-b border-charcoal-100 flex flex-col items-center text-center">
                                    <div className="text-3xl mb-2">{item.categories?.icon}</div>
                                    <h3 className="font-black text-charcoal-900 text-lg leading-tight mb-2">{item.title}</h3>
                                    <Link to={`/ideas/${item.slug}`} className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">View Blueprint →</Link>
                                </div>
                            ))}
                            {/* Fill empty columns if less than 3 */}
                            {[...Array(3 - comparedItems.length)].map((_, i) => (
                                <div key={i} className="p-6 bg-charcoal-50 border-b border-charcoal-100 hidden md:block" />
                            ))}


                            {/* Capital Row */}
                            <div className="p-6 border-r border-b border-charcoal-100 font-bold text-charcoal-600 flex items-center">
                                Capital Required
                            </div>
                            {comparedItems.map(item => (
                                <div key={item.id} className="p-6 border-b border-charcoal-100 text-center flex items-center justify-center font-black text-charcoal-900 text-xl">
                                    {formatCurrency(item.initial_investment_min)} - {formatCurrency(item.initial_investment_max)}
                                </div>
                            ))}
                            {[...Array(3 - comparedItems.length)].map((_, i) => <div key={i} className="border-b border-charcoal-100 hidden md:block" />)}

                            {/* Income Row */}
                            <div className="p-6 border-r border-b border-charcoal-100 font-bold text-charcoal-600 flex items-center">
                                Monthly Yield
                            </div>
                            {comparedItems.map(item => (
                                <div key={item.id} className="p-6 border-b border-charcoal-100 text-center flex items-center justify-center font-black text-emerald-600 text-xl bg-emerald-50/10">
                                    {formatCurrency(item.monthly_income_min)} - {formatCurrency(item.monthly_income_max)}
                                </div>
                            ))}
                            {[...Array(3 - comparedItems.length)].map((_, i) => <div key={i} className="border-b border-charcoal-100 hidden md:block" />)}

                            {/* ROI Speed */}
                            <div className="p-6 border-r border-b border-charcoal-100 font-bold text-charcoal-600 flex items-center">
                                Time to First ₹
                            </div>
                            {comparedItems.map(item => (
                                <div key={item.id} className="p-6 border-b border-charcoal-100 text-center flex items-center justify-center font-bold text-charcoal-800">
                                    {item.time_to_first_income_days} Days
                                </div>
                            ))}
                            {[...Array(3 - comparedItems.length)].map((_, i) => <div key={i} className="border-b border-charcoal-100 hidden md:block" />)}

                            {/* Success Probability */}
                            <div className="p-6 border-r border-b border-charcoal-100 font-bold text-charcoal-600 flex items-center">
                                Success Rate
                            </div>
                            {comparedItems.map(item => (
                                <div key={item.id} className="p-6 border-b border-charcoal-100 text-center flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary-100 flex items-center justify-center font-black text-primary-700 relative">
                                        {item.success_rate_percentage}%
                                        <svg className="absolute inset-0 w-full h-full -rotate-90 text-primary-600" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeDasharray={`${item.success_rate_percentage}, 100`}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                            {[...Array(3 - comparedItems.length)].map((_, i) => <div key={i} className="border-b border-charcoal-100 hidden md:block" />)}

                            {/* Risk / Effort */}
                            <div className="p-6 border-r border-charcoal-100 font-bold text-charcoal-600 flex items-center">
                                Risk / Effort
                            </div>
                            {comparedItems.map(item => (
                                <div key={item.id} className="p-6 text-center flex flex-col items-center justify-center gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${item.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                                            item.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {item.risk_level} Risk
                                    </span>
                                    <span className="text-xs font-bold text-charcoal-500 uppercase">{item.effort_level} Effort</span>
                                </div>
                            ))}
                            {[...Array(3 - comparedItems.length)].map((_, i) => <div key={i} className="hidden md:block" />)}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
