import { motion } from 'framer-motion';

export default function StatsSector({ stats, growthMetrics, users, ideas, franchises, categories }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="grid lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-charcoal-50 shadow-xl shadow-charcoal-900/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">📈</div>
                    <h3 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-4">User Adoption</h3>
                    <div className="text-4xl font-black text-charcoal-950 mb-2">{users.length} <span className="text-emerald-500 text-sm">Active</span></div>
                    <div className="w-full h-1 bg-charcoal-50 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(10, (users.length / 500) * 100))}%` }} />
                    </div>
                    <p className="text-[10px] text-charcoal-400 font-bold mt-4 uppercase tracking-widest">Growth: +{growthMetrics.userGrowth}% (30d)</p>
                </div>

                <div className="bg-charcoal-950 p-8 rounded-[2rem] text-white shadow-2xl shadow-charcoal-950/20 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-20">💎</div>
                    <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4">Total Assets</h3>
                    <div className="text-4xl font-black text-white mb-2">{stats.ideas + stats.franchises}</div>
                    <div className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-4 mt-6">
                        <div className="flex flex-col">
                            <span className="text-primary-400">{stats.ideas}</span>
                            <span>Ideas</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-emerald-400">{stats.franchises}</span>
                            <span>Brands</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-charcoal-50 shadow-xl shadow-charcoal-900/5 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:-rotate-12 transition-transform">🛡️</div>
                    <h3 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-4">Audit Performance</h3>
                    <div className="text-4xl font-black text-charcoal-950 mb-2">{stats.audits} <span className="text-amber-500 text-sm">Pending</span></div>
                    <div className="flex items-center gap-2 mt-6">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">Response Required</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-primary-900/20 relative group overflow-hidden">
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
                    <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-4">System Velocity</h3>
                    <div className="text-4xl font-black text-white mb-2">{growthMetrics.recentAssets} <span className="text-white/50 text-sm">New</span></div>
                    <div className="text-[10px] font-bold text-white/80 mt-4 uppercase tracking-widest">Assets Processed (Last 30d)</div>
                </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 border border-charcoal-100 shadow-2xl">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-2xl font-black text-charcoal-950 tracking-tightest uppercase">Growth Analytics</h2>
                        <p className="text-xs text-charcoal-400 font-bold uppercase tracking-widest mt-1">Institutional expansion metrics</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-end justify-between">
                            <h4 className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">Database Health</h4>
                            <span className="text-[10px] font-mono font-bold text-emerald-600">98.4% Integrity</span>
                        </div>
                        <div className="h-24 bg-charcoal-50 rounded-2xl flex items-end gap-1 p-4 overflow-hidden relative">
                            {[40, 70, 45, 90, 65, 80, 55, 95, 75, 40, 85, 60, 90, 70, 100].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.05, duration: 1 }}
                                    className="flex-1 bg-primary-500/20 rounded-t-sm hover:bg-primary-500 transition-colors cursor-pointer"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-end justify-between">
                            <h4 className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">User Conversion</h4>
                            <span className="text-[10px] font-mono font-bold text-primary-600">Institutional Range</span>
                        </div>
                        <div className="h-24 bg-charcoal-50 rounded-2xl flex items-end gap-1 p-4 overflow-hidden relative">
                            {[30, 50, 80, 40, 60, 90, 70, 100, 85, 45, 75, 55, 65, 95, 80].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.05 + 0.5, duration: 1 }}
                                    className="flex-1 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500 transition-colors cursor-pointer"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white p-10 rounded-[2.5rem] border border-charcoal-50 shadow-xl">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-black text-charcoal-950 uppercase tracking-tighter">Growth by Category</h2>
                    <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Market Stats</span>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {categories.slice(0, 8).map((cat, i) => {
                        const count = (ideas.filter(id => id.category === cat.name).length + franchises.filter(f => f.category === cat.name).length);
                        const total = stats.ideas + stats.franchises || 1;
                        const percentage = Math.max(5, (count / total) * 100);
                        return (
                            <div key={cat.id} className="group p-4 rounded-2xl bg-charcoal-50/50 hover:bg-white transition-all border border-transparent hover:border-charcoal-100">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-charcoal-600">
                                    <span className="flex items-center gap-2">
                                        <span className="text-sm">{cat.icon || '📁'}</span>
                                        {cat.name}
                                    </span>
                                    <span className="text-primary-600">{count} Units</span>
                                </div>
                                <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-primary-600 to-indigo-600"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
