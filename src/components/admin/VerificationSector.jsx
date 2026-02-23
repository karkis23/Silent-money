export default function VerificationSector({ auditRequests, onUpdateStatus }) {
    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="card bg-white border-none shadow-xl p-8">
                <div className="flex justify-between items-center mb-10 border-b border-charcoal-50 pb-6">
                    <div>
                        <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter flex items-center gap-3">
                            <span>🔍</span> Verification Requests
                        </h2>
                        <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-1">Pending reviews from investors</p>
                    </div>
                    <span className="text-[11px] font-black text-white bg-primary-600 px-4 py-2 rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-primary-200">
                        {auditRequests.filter(a => a.status === 'pending').length} Requests
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                <th className="pb-4 pl-4">Business / Individual</th>
                                <th className="pb-4">Requirements</th>
                                <th className="pb-4 text-center">Status</th>
                                <th className="pb-4 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-50">
                            {auditRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-charcoal-400 font-medium italic">
                                        No verification requests in the current cycle.
                                    </td>
                                </tr>
                            ) : (
                                auditRequests.map(audit => (
                                    <tr key={audit.id} className="group hover:bg-charcoal-50 transition-colors">
                                        <td className="py-6 pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-xl border border-primary-100">
                                                    🏢
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-charcoal-900">{audit.brand_name}</div>
                                                    <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">
                                                        By {audit.profiles?.full_name || 'Anonymous User'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-charcoal-900 uppercase tracking-tight">
                                                    Sector: <span className="text-charcoal-500">{audit.brand_sector || 'General'}</span>
                                                </div>
                                                <div className="text-[10px] font-black text-charcoal-900 uppercase tracking-tight">
                                                    Budget: <span className="text-emerald-600">{audit.investment_budget || 'N/A'}</span>
                                                </div>
                                                <div className="text-[10px] font-black text-charcoal-900 uppercase tracking-tight">
                                                    Target: <span className="text-charcoal-500">{audit.location_target || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 text-center">
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${audit.status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : audit.status === 'in-review'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-charcoal-100 text-charcoal-400'
                                                }`}>
                                                {audit.status?.replace('-', ' ') || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right pr-4">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => onUpdateStatus(audit.id, 'completed')}
                                                    className="px-3 py-1.5 bg-charcoal-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-md"
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => onUpdateStatus(audit.id, 'in-review', 'Review process started.')}
                                                    className="px-3 py-1.5 bg-white border border-charcoal-200 text-charcoal-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-charcoal-50 transition-all"
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
