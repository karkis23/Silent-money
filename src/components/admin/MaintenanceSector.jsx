export default function MaintenanceSector({ queue, onPurge }) {
    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="card bg-white border-none shadow-xl p-8">
                <div className="flex justify-between items-center mb-10 border-b border-red-50 pb-6">
                    <div>
                        <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter flex items-center gap-3">
                            <span>🧹</span> System Maintenance
                        </h2>
                        <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-1">Orphaned storage cleanup queue</p>
                    </div>
                    {queue.length > 0 && (
                        <button
                            onClick={onPurge}
                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2"
                        >
                            <span>⚠️</span> Purge Storage Queue
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                <th className="pb-4 pl-4">File Path</th>
                                <th className="pb-4">Bucket</th>
                                <th className="pb-4 text-center">Queued On</th>
                                <th className="pb-4 text-right pr-4">Size / Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-50">
                            {queue.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-charcoal-400 font-medium italic">
                                        Storage system is optimized. No files pending deletion.
                                    </td>
                                </tr>
                            ) : (
                                queue.map(item => (
                                    <tr key={item.id} className="group hover:bg-red-50/30 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="text-[11px] font-mono font-bold text-charcoal-900 break-all max-w-md">{item.file_path}</div>
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 bg-charcoal-100 rounded text-[9px] font-black uppercase tracking-widest text-charcoal-600">{item.bucket_name}</span>
                                        </td>
                                        <td className="py-4 text-center text-[10px] font-bold text-charcoal-500">
                                            {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="py-4 text-right pr-4 text-[9px] font-mono text-charcoal-300">
                                            SYSTEM_ORPHAN
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100">
                    <div className="flex gap-4 items-start">
                        <div className="text-2xl pt-1">💡</div>
                        <div>
                            <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">Institutional Storage Optimization</h4>
                            <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                                Files are added to this queue when an asset is permanently deleted or its proof is replaced.
                                A purge operation will permanently remove these blobs from Supabase Storage to recover infrastructure space.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
