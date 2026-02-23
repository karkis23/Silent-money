export default function BulkActionsBar({ selectedCount, onApprove, onArchive, onClear }) {
    if (selectedCount === 0) return null;

    return (
        <div className="mb-6 p-3 md:p-4 bg-primary-50 border border-primary-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-xs md:text-sm font-black text-primary-900 uppercase tracking-wider">
                {selectedCount} Items Selected
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button onClick={onApprove} className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider hover:bg-emerald-700">
                    Approve All
                </button>
                <button onClick={onArchive} className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider hover:bg-red-700">
                    Archive All
                </button>
                <button onClick={onClear} className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-white border border-charcoal-200 text-charcoal-600 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider hover:bg-charcoal-50">
                    Clear
                </button>
            </div>
        </div>
    );
}
