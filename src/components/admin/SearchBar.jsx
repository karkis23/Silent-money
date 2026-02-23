export default function SearchBar({ value, onChange, onClear }) {
    return (
        <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
            <input
                type="text"
                placeholder="Search by ID, Name, or User..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-charcoal-100 focus:ring-2 focus:ring-primary-600 outline-none font-medium text-sm transition-all shadow-sm"
            />
            {value && (
                <button
                    onClick={onClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-charcoal-50 text-charcoal-400 rounded-lg hover:text-charcoal-900 transition-colors"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
