import { motion, AnimatePresence } from 'framer-motion';

export default function LogSector({ logs, selectedLog, setSelectedLog }) {
    return (
        <div className="card bg-white border-none shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter">System Activity Logs</h2>
                <span className="text-[10px] font-black text-charcoal-400 bg-charcoal-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    {logs.length} Events
                </span>
            </div>
            <div className="space-y-2">
                {logs.length === 0 ? (
                    <div className="py-20 text-center text-charcoal-400 font-medium italic">
                        No activity logs recorded yet.
                    </div>
                ) : (
                    logs.map(log => {
                        const isExpanded = selectedLog === log.id;
                        const icon = String(log.action_type ?? '').includes('approve') || log.action_type === 'AUTHORIZATION' ? '✅' :
                            String(log.action_type ?? '').includes('ban') ? '🚫' :
                                String(log.action_type ?? '').includes('REVISION') ? '📝' :
                                    String(log.action_type ?? '').includes('RESTORE') ? '♻️' :
                                        String(log.action_type ?? '').includes('DECOMMISSION') || String(log.action_type ?? '').includes('archive') ? '📁' :
                                            String(log.action_type ?? '').includes('DELETE') ? '🗑️' :
                                                String(log.action_type ?? '').includes('REVOKE') ? '⚡' :
                                                    String(log.action_type ?? '').includes('ADMIN') ? '👑' : '⚙️';

                        let parsedDetails = null;
                        if (log.details) {
                            try {
                                parsedDetails = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                            } catch {
                                parsedDetails = log.details;
                            }
                        }

                        return (
                            <div key={log.id}>
                                {/* Collapsed Row */}
                                <div
                                    onClick={() => setSelectedLog(isExpanded ? null : log.id)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isExpanded
                                        ? 'bg-charcoal-900 border-charcoal-700 rounded-b-none'
                                        : 'bg-charcoal-50 border-charcoal-100 hover:border-primary-200 hover:bg-white'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm flex-shrink-0 transition-all ${isExpanded ? 'bg-white/10 border border-white/20' : 'bg-white border border-charcoal-100'}`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-black uppercase tracking-wide flex items-center gap-2 flex-wrap ${isExpanded ? 'text-white' : 'text-charcoal-900'}`}>
                                            {log.profiles?.full_name || 'System Admin'}
                                            <span className={isExpanded ? 'text-white/30' : 'text-charcoal-300'}>•</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest ${isExpanded ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-600'}`}>
                                                {String(log.action_type ?? '').replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className={`text-[10px] font-mono mt-1 flex items-center gap-2 ${isExpanded ? 'text-white/50' : 'text-charcoal-500'}`}>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isExpanded ? 'bg-white/10 text-white/60' : 'bg-charcoal-100 text-charcoal-500'}`}>
                                                {typeof log.target_type === 'object' ? JSON.stringify(log.target_type) : (log.target_type ?? '')}
                                            </span>
                                            <span className="truncate max-w-[200px]">
                                                {typeof log.target_id === 'object' ? JSON.stringify(log.target_id) : (log.target_id ?? '')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className={`text-[10px] font-bold whitespace-nowrap ${isExpanded ? 'text-white/40' : 'text-charcoal-400'}`}>
                                            {log.created_at ? new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                                        </div>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-transform ${isExpanded ? 'bg-white/10 text-white rotate-180' : 'bg-charcoal-100 text-charcoal-400'}`}>
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail Panel */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-charcoal-950 rounded-b-xl border border-t-0 border-charcoal-700 p-6 space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Performed By</div>
                                                        <div className="text-xs font-black text-white">{log.profiles?.full_name || 'System Admin'}</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Action Type</div>
                                                        <div className="text-xs font-black text-primary-400">{String(log.action_type ?? '')}</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Target Type</div>
                                                        <div className="text-xs font-black text-white uppercase">{typeof log.target_type === 'object' ? JSON.stringify(log.target_type) : (log.target_type ?? 'N/A')}</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3">
                                                        <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Timestamp</div>
                                                        <div className="text-xs font-black text-white">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</div>
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Target ID</div>
                                                    <div className="text-xs font-mono text-emerald-400 break-all">
                                                        {typeof log.target_id === 'object' ? JSON.stringify(log.target_id) : (log.target_id || 'N/A')}
                                                    </div>
                                                </div>

                                                {parsedDetails && (
                                                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                                        <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-3">Event Details / Metadata</div>
                                                        {typeof parsedDetails === 'object' ? (
                                                            <div className="space-y-2">
                                                                {Object.entries(parsedDetails).map(([key, val]) => (
                                                                    <div key={key} className="flex items-start gap-3">
                                                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest min-w-[100px] pt-0.5">{key.replace(/_/g, ' ')}</span>
                                                                        <span className="text-xs font-mono text-amber-300 break-all">{String(val)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <pre className="text-xs font-mono text-amber-300 whitespace-pre-wrap break-all">{String(parsedDetails)}</pre>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        onClick={() => setSelectedLog(null)}
                                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                    >
                                                        Close Details
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
