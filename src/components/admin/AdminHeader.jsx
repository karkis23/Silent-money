import { motion } from 'framer-motion';

export default function AdminHeader({ loading, pageLoading, onRefresh }) {
    return (
        <header className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <div className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-2">Admin Control Panel</div>
                    <h1 className="text-4xl font-black text-charcoal-900 tracking-tighter">Admin <span className="text-charcoal-400">Dashboard</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onRefresh}
                        className="p-2.5 bg-white rounded-xl border border-charcoal-100 shadow-sm text-charcoal-400 hover:text-primary-600 hover:border-primary-100 transition-all active:scale-95"
                        title="Refresh Dashboard Data"
                        disabled={loading}
                    >
                        <svg className={`w-4 h-4 ${(loading || pageLoading) ? 'animate-spin text-primary-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-charcoal-100 shadow-sm text-[10px] font-black text-charcoal-600 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        System: Operational
                    </div>
                </div>
            </div>
        </header>
    );
}
