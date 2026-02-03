import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ROICalculator({ initialDefaults = {}, assetId = null, assetType = null }) {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    // State for inputs
    const [investment, setInvestment] = useState(initialDefaults.investment ?? 10000);
    const [monthlyIncome, setMonthlyIncome] = useState(initialDefaults.income ?? 1000);
    const [monthlyExpenses, setMonthlyExpenses] = useState(initialDefaults.expenses ?? 0);
    const [years, setYears] = useState(1);
    const [sensitivity, setSensitivity] = useState(20); // Safety margin %

    // State for results
    const [results, setResults] = useState(null);

    // Calculate on change
    useEffect(() => {
        const calculateROI = () => {
            const months = years * 12;
            const totalRevenue = monthlyIncome * months;

            // Sensitivity Adjustment: Add safety margin to expenses
            const adjustedMonthlyExpenses = monthlyExpenses * (1 + sensitivity / 100);
            const totalExpenses = adjustedMonthlyExpenses * months;

            const netProfit = totalRevenue - totalExpenses - investment;
            const roiPercent = investment > 0 ? (netProfit / investment) * 100 : 0;

            const monthlyNet = monthlyIncome - adjustedMonthlyExpenses;
            let breakEvenMonths = 0;
            if (monthlyNet > 0) {
                breakEvenMonths = Math.ceil(investment / monthlyNet);
            } else {
                breakEvenMonths = null;
            }

            setResults({
                totalRevenue,
                totalExpenses,
                netProfit,
                roiPercent,
                breakEvenMonths
            });
        };

        calculateROI();
    }, [investment, monthlyIncome, monthlyExpenses, years, sensitivity]);

    const handleSaveCalculation = async () => {
        if (!user) {
            toast.error('You must be logged in to save projections');
            return;
        }

        if (!results) {
            toast.error('Calculations are not ready yet');
            return;
        }

        setIsSaving(true);

        const calculationData = {
            user_id: user.id,
            initial_investment: Math.round(Number(investment)),
            monthly_income_expected: Math.round(Number(monthlyIncome)),
            monthly_expenses: Math.round(Number(monthlyExpenses)),
            time_horizon_months: Number(years) * 12,
            total_income: Math.round(results.totalRevenue),
            net_profit: Math.round(results.netProfit),
            roi_percentage: parseFloat(results.roiPercent.toFixed(2)),
            break_even_months: results.breakEvenMonths
        };

        if (assetType === 'idea' && assetId) calculationData.idea_id = assetId;
        if (assetType === 'franchise' && assetId) calculationData.franchise_id = assetId;

        const { error } = await supabase
            .from('roi_calculations')
            .insert([calculationData]);

        setIsSaving(false);
        if (!error) {
            setSaveSuccess(true);
            toast.success('Strategy Saved to Intelligence Vault', {
                icon: '💾',
                style: { background: '#111827', color: '#fff' }
            });
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            console.error('Save failed:', error);
            toast.error(`Encryption Error: ${error.message || 'Check database connectivity'}`);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="card">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
                    <span>🧮</span> ROI Calculator
                </h3>
                <p className="text-sm text-charcoal-500 font-medium">
                    Estimate your returns based on realistic numbers.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-charcoal-700 mb-1 pl-1">
                            Initial Capital (₹)
                        </label>
                        <input
                            type="number"
                            value={investment}
                            onChange={(e) => setInvestment(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-charcoal-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-charcoal-700 mb-1 pl-1">
                            Monthly Income (₹)
                        </label>
                        <input
                            type="number"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-charcoal-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-charcoal-700 mb-1 pl-1">
                            Monthly Expenses (₹)
                        </label>
                        <input
                            type="number"
                            value={monthlyExpenses}
                            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-charcoal-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-charcoal-700 mb-2 pl-1">
                            Time Horizon: <span className="text-primary-600 font-black">{years} Year{years > 1 ? 's' : ''}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full accent-primary-600 h-1.5 bg-charcoal-200 rounded-full cursor-pointer appearance-none"
                        />
                        <div className="flex justify-between text-[10px] font-black text-charcoal-400 mt-1 uppercase tracking-widest px-1">
                            <span>1 Year</span>
                            <span>10 Years</span>
                        </div>
                    </div>

                    <div className="p-5 bg-charcoal-50 rounded-2xl border border-charcoal-100">
                        <label className="block text-sm font-bold text-charcoal-700 mb-2 pl-1">
                            Safety Margin: <span className="text-secondary-600 font-black">{sensitivity}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={sensitivity}
                            onChange={(e) => setSensitivity(Number(e.target.value))}
                            className="w-full accent-charcoal-900 h-1.5 bg-charcoal-200 rounded-full cursor-pointer appearance-none"
                        />
                        <p className="text-[9px] text-charcoal-400 mt-2 font-medium leading-tight">
                            Increasing this adds a &quot;Reality Check&quot; by inflating projected expenses to see if the asset remains viable.
                        </p>
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-charcoal-950 rounded-3xl p-8 space-y-8 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl rounded-full" />

                    <div>
                        <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 font-mono">Net Profit ({years}Y)</div>
                        <div className={`text-2xl lg:text-3xl font-black tracking-tightest leading-tight ${results?.netProfit >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
                            {formatCurrency(results?.netProfit || 0)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 font-mono">Total ROI</div>
                            <div className={`text-2xl font-black ${results?.roiPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {results?.roiPercent?.toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 font-mono">Break Even</div>
                            <div className="text-2xl font-black text-white opacity-95">
                                {results?.breakEvenMonths
                                    ? `${results?.breakEvenMonths} Mo`
                                    : 'Never'}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <div className="text-[11px] font-black text-white/30 mb-4 flex justify-between uppercase tracking-[0.2em] font-mono">
                            <span>RECOVERY PROGRESS</span>
                            <span className={results?.breakEvenMonths && results?.breakEvenMonths <= (years * 12) ? 'text-emerald-400' : 'text-red-400'}>
                                {results?.breakEvenMonths && results?.breakEvenMonths <= (years * 12)
                                    ? 'VERIFIED'
                                    : 'AT RISK'}
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className={`h-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)] ${results?.roiPercent >= 0 ? 'bg-primary-500' : 'bg-red-500'}`}
                                style={{
                                    width: `${Math.min(100, Math.max(0, (results?.totalRevenue - results?.totalExpenses) / investment * 100))}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveCalculation}
                        disabled={!user || isSaving || saveSuccess}
                        className={`mt-8 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${saveSuccess
                            ? 'bg-emerald-500 text-white'
                            : isSaving
                                ? 'bg-charcoal-800 text-white/50 cursor-wait'
                                : 'bg-white text-charcoal-900 hover:bg-primary-500 hover:text-white shadow-xl shadow-black/20'
                            }`}
                    >
                        {saveSuccess ? (
                            <><span>✅</span> Projection Saved</>
                        ) : isSaving ? (
                            'Encrypting Data...'
                        ) : (
                            <><span>💾</span> Save this Projection</>
                        )}
                    </button>
                    {!user && (
                        <p className="text-[9px] text-white/30 text-center mt-3 font-medium uppercase tracking-widest">Login to save intelligence</p>
                    )}
                </div>
            </div>
        </div>
    );
}
