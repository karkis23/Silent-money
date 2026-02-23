export default function AdminTabs({ activeTab, setActiveTab, counts }) {
    const tabs = [
        { id: 'pending', label: 'Review', count: counts.pending, color: 'charcoal' },
        { id: 'history', label: 'History', count: counts.history, color: 'charcoal' },
        { id: 'all', label: 'Database', count: counts.database, color: 'charcoal' },
        { id: 'archived', label: 'Archived', count: counts.archived, color: 'charcoal' },
        { id: 'audits', label: 'Verifications', count: counts.audits, color: 'primary' },
        { id: 'users', label: 'Users', count: counts.users, color: 'charcoal' },
        { id: 'categories', label: 'Categories', count: counts.categories, color: 'charcoal' },
        { id: 'logs', label: 'Logs', count: counts.logs, color: 'charcoal' },
        { id: 'performance', label: 'Stats', count: null, color: 'emerald' },
        { id: 'maintenance', label: 'System', count: counts.maintenance, color: 'red' },
    ];

    return (
        <div className="w-full bg-white p-1.5 rounded-[1.5rem] border border-charcoal-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] mb-10">
            <div className="w-full overflow-x-auto hide-scrollbar scroll-smooth">
                <div className="flex items-center gap-1.5 min-w-max md:min-w-full md:justify-between px-0.5">
                    {tabs.map((tab) => {
                        const isPrimary = tab.color === 'primary';
                        const isEmerald = tab.color === 'emerald';
                        const isRed = tab.color === 'red';
                        const isActive = activeTab === tab.id;

                        let activeClass = 'bg-charcoal-950 text-white shadow-xl';
                        if (isPrimary) activeClass = 'bg-primary-600 text-white shadow-xl shadow-primary-600/20';
                        if (isEmerald) activeClass = 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl';
                        if (isRed) activeClass = 'bg-red-500 text-white shadow-xl shadow-red-500/20';

                        let hoverClass = 'text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50';
                        if (isPrimary) hoverClass = 'text-charcoal-400 hover:text-primary-600 hover:bg-primary-50';
                        if (isEmerald) hoverClass = 'text-charcoal-400 hover:text-emerald-600 hover:bg-emerald-50';
                        if (isRed) hoverClass = 'text-charcoal-400 hover:text-red-500 hover:bg-red-50';

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 rounded-[1.15rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 whitespace-nowrap flex-1 justify-center ${isActive ? `${activeClass} translate-y-[-1px]` : hoverClass}`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== null && (
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${isActive
                                        ? 'bg-white/10 text-white'
                                        : (isPrimary ? 'bg-primary-50 text-primary-600' : (isRed ? 'bg-red-50 text-red-500' : 'bg-charcoal-100 text-charcoal-400'))
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
