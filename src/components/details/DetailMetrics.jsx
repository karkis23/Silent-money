/**
 * DetailMetrics: A high-density grid for visualizing core financial and operational signals.
 * 
 * Supports dynamic highlighting for primary KPIs (e.g., Yield or ROI) and 
 * provides a consistent visual interface for all asset dossiers.
 * 
 * @param {Object} props - Component properties.
 * @param {Array} props.metrics - An array of metric objects {label, value, unit, highlight, variant}.
 */
export default function DetailMetrics({ metrics }) {
    return (
        <section>
            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8">Financial Overview</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {metrics.map((metric, i) => (
                    <div
                        key={i}
                        className={`card border-none shadow-xl shadow-charcoal-100/50 p-4 sm:p-8 flex flex-col justify-between min-h-[140px] sm:h-40 transition-all hover:scale-[1.02] ${metric.highlight ? 'bg-primary-50/50' : 'bg-white'}`}
                    >
                        <div className="text-[9px] sm:text-[10px] font-black text-charcoal-400 uppercase tracking-widest leading-tight mb-2">
                            {metric.label}
                        </div>
                        <div className={`text-xl sm:text-3xl font-black ${metric.variant === 'primary' ? 'text-primary-600' : metric.variant === 'success' ? 'text-emerald-600' : 'text-charcoal-950'} leading-none flex flex-wrap items-baseline gap-1`}>
                            <span>{metric.value === 'null' || !metric.value ? 'TBD' : metric.value}</span>
                            {metric.unit && (
                                <span className="text-xs sm:text-lg text-charcoal-400 font-bold uppercase tracking-tighter">
                                    {metric.unit}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
