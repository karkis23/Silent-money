import { useState, useEffect } from 'react';

export default function ROICalculator({ initialDefaults = {} }) {
    // State for inputs
    const [investment, setInvestment] = useState(initialDefaults.investment ?? 10000);
    const [monthlyIncome, setMonthlyIncome] = useState(initialDefaults.income ?? 1000);
    const [monthlyExpenses, setMonthlyExpenses] = useState(initialDefaults.expenses ?? 0);
    const [years, setYears] = useState(1);

    // State for results
    const [results, setResults] = useState(null);

    // Calculate on change
    useEffect(() => {
        const calculateROI = () => {
            const months = years * 12;
            const totalRevenue = monthlyIncome * months;
            const totalExpenses = monthlyExpenses * months;
            const netProfit = totalRevenue - totalExpenses - investment;
            const roiPercent = investment > 0 ? (netProfit / investment) * 100 : 0;

            const monthlyNet = monthlyIncome - monthlyExpenses;
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
    }, [investment, monthlyIncome, monthlyExpenses, years]);

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
                </div>

                {/* Results Section */}
                <div className="bg-charcoal-950 rounded-3xl p-8 space-y-8 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl rounded-full" />

                    <div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 font-mono">Net Profit ({years} Years)</div>
                        <div className={`text-4xl font-black ${results?.netProfit >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
                            {formatCurrency(results?.netProfit || 0)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 font-mono">Total ROI</div>
                            <div className={`text-2xl font-black ${results?.roiPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {results?.roiPercent?.toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 font-mono">Break Even</div>
                            <div className="text-2xl font-black text-white opacity-90">
                                {results?.breakEvenMonths
                                    ? `${results?.breakEvenMonths} Mo`
                                    : 'Never'}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <div className="text-[10px] font-black text-white/40 mb-3 flex justify-between uppercase tracking-widest font-mono">
                            <span>Recovery Status</span>
                            <span className={results?.breakEvenMonths && results?.breakEvenMonths <= (years * 12) ? 'text-emerald-400' : 'text-red-400'}>
                                {results?.breakEvenMonths && results?.breakEvenMonths <= (years * 12)
                                    ? 'RECOVERED'
                                    : 'AT RISK'}
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${results?.roiPercent >= 0 ? 'bg-primary-600' : 'bg-red-600'}`}
                                style={{
                                    width: `${Math.min(100, Math.max(0, (results?.totalRevenue - results?.totalExpenses) / investment * 100))}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
