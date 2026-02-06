export default function DetailMetrics({ metrics }) {
    return (
        <section>
            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8">Financial Overview</h2>
            <div className="grid grid-cols-2 gap-6">
                {metrics.map((metric, i) => (
                    <div
                        key={i}
                        className={`card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40 transition-all hover:scale-[1.02] ${metric.highlight ? 'bg-primary-50/50' : 'bg-white'}`}
                    >
                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">{metric.label}</div>
                        <div className={`text-3xl font-black ${metric.variant === 'primary' ? 'text-primary-600' : metric.variant === 'success' ? 'text-emerald-600' : 'text-charcoal-950'}`}>
                            {metric.value}
                            {metric.unit && <span className="text-lg text-charcoal-400 ml-1 font-bold">{metric.unit}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
