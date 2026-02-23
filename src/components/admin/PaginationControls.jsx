export default function PaginationControls({ page, setPage, loading, hasNextPage, type = 'Registry' }) {
    return (
        <div className="mt-10 flex justify-end">
            <div className="flex items-center bg-white p-1 rounded-2xl border border-charcoal-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] h-12">
                <button
                    disabled={page === 0 || loading}
                    onClick={() => {
                        setPage(p => p - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="h-full px-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-charcoal-400 hover:text-charcoal-900 flex items-center gap-2 transition-all disabled:opacity-30"
                >
                    ← Previous
                </button>

                <div className="w-px h-6 bg-charcoal-100 mx-1" />

                <div className="px-6 h-full flex items-center justify-center min-w-[140px]">
                    {loading ? (
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    ) : (
                        <span className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">
                            {type} <span className="text-primary-600">Page {page + 1}</span>
                        </span>
                    )}
                </div>

                <div className="w-px h-6 bg-charcoal-100 mx-1" />

                <button
                    disabled={loading || !hasNextPage}
                    onClick={() => {
                        setPage(p => p + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="h-full px-6 bg-charcoal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group transition-all hover:bg-black disabled:opacity-30"
                >
                    Next Page <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );
}
