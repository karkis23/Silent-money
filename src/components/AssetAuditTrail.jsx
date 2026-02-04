import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';

export default function AssetAuditTrail({ assetId, assetType }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('asset_audit_logs')
                .select('*')
                .eq('asset_id', assetId)
                .eq('asset_type', assetType)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setLogs(data);
            }
            setLoading(false);
        };

        if (assetId) {
            fetchLogs();
        }
    }, [assetId, assetType]);

    if (loading) return null;
    if (logs.length === 0) return null;

    const getActionIcon = (action) => {
        switch (action) {
            case 'AUTHORIZATION': return '✅';
            case 'REVISION_REQUEST': return '📝';
            case 'DECOMMISSION': return '🛑';
            case 'STATUS_CHANGE': return '🔄';
            default: return '📋';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'AUTHORIZATION': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'REVISION_REQUEST': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'DECOMMISSION': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-primary-600 bg-primary-50 border-primary-100';
        }
    };

    return (
        <div className="mt-12 pt-12 border-t border-charcoal-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-charcoal-900 flex items-center justify-center text-lg">📜</div>
                <div>
                    <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Institutional Change Log</h3>
                    <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-0.5">Asset evolution and moderation history</p>
                </div>
            </div>

            <div className="relative space-y-6 pl-8">
                {/* Timeline Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-charcoal-100" />

                {logs.map((log, index) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${log.action === 'AUTHORIZATION' ? 'bg-emerald-500' :
                                log.action === 'REVISION_REQUEST' ? 'bg-amber-500' :
                                    log.action === 'DECOMMISSION' ? 'bg-red-500' : 'bg-primary-500'
                            }`} />

                        <div className="bg-white border border-charcoal-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                                    <span>{getActionIcon(log.action)}</span>
                                    <span>{log.action.replace('_', ' ')}</span>
                                </div>
                                <span className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest bg-charcoal-50 px-2 py-1 rounded-lg">
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>

                            {log.feedback && (
                                <div className="mt-3 p-3 bg-charcoal-50 rounded-xl border border-charcoal-100 italic">
                                    <p className="text-[11px] text-charcoal-600 font-medium leading-relaxed">
                                        "{log.feedback}"
                                    </p>
                                </div>
                            )}

                            <div className="mt-3 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-charcoal-400">
                                {log.previous_status && (
                                    <span className="flex items-center gap-2">
                                        Status: <span className="text-charcoal-900">{log.previous_status}</span>
                                        <span className="text-primary-600">→</span>
                                        <span className="text-primary-600">{log.new_status}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
