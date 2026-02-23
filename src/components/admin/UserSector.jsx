export default function UserSector({ users, currentUser, onDownloadCSV, onToggleAdmin, onBanUser, onUnbanUser }) {
    return (
        <div className="mt-8">
            <section className="card bg-white border-none shadow-xl p-8">
                <div className="flex justify-between items-center mb-10 border-b border-charcoal-50 pb-6">
                    <div>
                        <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter flex items-center gap-3">
                            <span>👤</span> Users
                        </h2>
                        <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-1">{users.length} Active Profiles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onDownloadCSV}
                            className="px-4 py-2 bg-white border border-charcoal-200 text-charcoal-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-charcoal-50 flex items-center gap-2 transition-all shadow-sm"
                        >
                            <span>📥</span> Export CSV
                        </button>
                        <span className="text-[11px] font-black text-white bg-charcoal-900 px-4 py-2 rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-charcoal-200">
                            Active Nodes
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                <th className="pb-4 pl-4">User</th>
                                <th className="pb-4 text-center">Role Status</th>
                                <th className="pb-4 text-center">Joined On</th>
                                <th className="pb-4 text-right pr-4">Profile ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-50">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-charcoal-400 font-medium italic">
                                        No users registered in the system yet.
                                    </td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="group hover:bg-charcoal-50 transition-colors">
                                        <td className="py-6 pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-xl border border-primary-100 group-hover:scale-110 transition-transform">
                                                    {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : '👤'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-charcoal-900 flex items-center gap-2">
                                                        {u.full_name || 'Anonymous'}
                                                        {currentUser?.id === u.id && (
                                                            <span className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-widest">You</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{u.membership_tier || 'Basic'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 text-center">
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                {u.is_admin ? (
                                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${u.role === 'owner'
                                                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg'
                                                        : u.role === 'super_admin'
                                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                                            : 'bg-charcoal-900 text-white'
                                                        }`}>
                                                        {u.role === 'owner' && '👑'}
                                                        {u.role === 'super_admin' && '⚡'}
                                                        {u.role === 'admin' && '🔑'}
                                                        {u.role === 'moderator' && '🛡️'}
                                                        {u.role === 'owner' ? 'OWNER' : u.role === 'super_admin' ? 'SUPER ADMIN' : u.role === 'admin' ? 'ADMINISTRATOR' : 'MODERATOR'}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-charcoal-100 text-charcoal-400">
                                                        INVESTOR
                                                    </span>
                                                )}
                                                {!u.is_banned && (
                                                    <button
                                                        onClick={() => onToggleAdmin(u.id, u.is_admin, u.full_name)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${u.is_admin
                                                            ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
                                                            : 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
                                                            }`}
                                                        title={u.is_admin ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}
                                                    >
                                                        {u.is_admin ? '⚡ Revoke Admin' : '👑 Make Admin'}
                                                    </button>
                                                )}
                                                {!u.is_admin && !u.is_banned && (
                                                    <button
                                                        onClick={() => onBanUser(u.id)}
                                                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-200"
                                                    >
                                                        BAN
                                                    </button>
                                                )}
                                                {u.is_banned && (
                                                    <button
                                                        onClick={() => onUnbanUser(u.id)}
                                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200"
                                                    >
                                                        BANNED (UNBAN)
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-6 text-center text-[11px] font-mono font-bold text-charcoal-500">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="py-6 text-right pr-4 text-[9px] font-mono text-charcoal-300">
                                            {u.id?.slice(0, 16) ?? ''}...
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
