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

            // Break even calculation
            const monthlyNet = monthlyIncome - monthlyExpenses;
            let breakEvenMonths = 0;
            if (monthlyNet > 0) {
                breakEvenMonths = Math.ceil(investment / monthlyNet);
            } else {
                breakEvenMonths = null; // Never breaks even
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
        <div className="card border-t-4 border-t-sage-600">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
                    <span>🧮</span> ROI Calculator
                </h3>
                <p className="text-sm text-charcoal-500">
                    Estimate your returns based on realistic numbers.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                            Initial Investment (₹)
                        </label>
                        <input
                            type="number"
                            value={investment}
                            onChange={(e) => setInvestment(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                            Expected Monthly Income (₹)
                        </label>
                        <input
                            type="number"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                            Monthly Expenses (₹)
                        </label>
                        <input
                            type="number"
                            value={monthlyExpenses}
                            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                            Time Horizon: <span className="font-bold">{years} Year{years > 1 ? 's' : ''}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full accent-sage-600"
                        />
                        <div className="flex justify-between text-xs text-charcoal-400 mt-1">
                            <span>1 Year</span>
                            <span>10 Years</span>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-charcoal-50 rounded-xl p-6 space-y-6">

                    <div>
                        <div className="text-sm text-charcoal-500 mb-1">Net Profit ({years} Years)</div>
                        <div className={`text-3xl font-bold ${results?.netProfit >= 0 ? 'text-sage-700' : 'text-red-600'}`}>
                            {formatCurrency(results?.netProfit || 0)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-charcoal-500 mb-1">ROI</div>
                            <div className={`text-xl font-bold ${results?.roiPercent >= 0 ? 'text-sage-700' : 'text-red-600'}`}>
                                {results?.roiPercent?.toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-charcoal-500 mb-1">Break Even</div>
                            <div className="text-xl font-bold text-charcoal-900">
                                {results?.breakEvenMonths
                                    ? `${results?.breakEvenMonths} Months`
                                    : 'Never'}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-charcoal-200">
                        <div className="text-xs text-charcoal-500 mb-2 flex justify-between">
                            <span>Investment Recovery</span>
                            <span>
                                {results?.breakEvenMonths && results?.breakEvenMonths <= (years * 12)
                                    ? 'Recovered'
                                    : 'Not Recovered'}
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 bg-charcoal-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sage-600 rounded-full transition-all duration-500"
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
