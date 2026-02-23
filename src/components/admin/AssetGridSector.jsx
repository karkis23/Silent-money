import { Link } from 'react-router-dom';

export default function AssetGridSector({
    activeTab,
    ideas,
    franchises,
    selectedItems,
    setSelectedItems,
    onApprove,
    onRequestRevision,
    onToggleFeatured,
    onDelete,
    onUnarchive,
    onPermanentDelete,
    searchQuery
}) {
    const filterItems = (items) => {
        if (!searchQuery) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(item =>
            (item.title || item.name || '').toLowerCase().includes(q) ||
            (item.profiles?.full_name || '').toLowerCase().includes(q) ||
            item.id.includes(searchQuery) ||
            (item.description || item.short_description || '').toLowerCase().includes(q)
        );
    };

    const filteredIdeas = filterItems(ideas);
    const filteredFranchises = filterItems(franchises);

    return (
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
            {/* Ideas Section */}
            <section className="card bg-white border-none shadow-xl p-4 md:p-8 h-fit">
                <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                    <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                        <span>💡</span> {activeTab === 'pending' ? 'Pending Ideas' : activeTab === 'history' ? 'Recently Approved' : activeTab === 'archived' ? 'Archived Ideas' : 'All Ideas'}
                    </h2>
                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {filteredIdeas.length} Items
                    </span>
                </div>

                <div className="space-y-6">
                    {filteredIdeas.length === 0 ? (
                        <div className="py-12 text-center text-charcoal-400 font-medium italic">
                            {activeTab === 'pending' ? 'No pending ideas.' : 'No items found.'}
                        </div>
                    ) : (
                        filteredIdeas.map(idea => (
                            <div key={idea.id} className="p-3 md:p-5 bg-charcoal-50 rounded-xl border border-charcoal-100 group hover:border-primary-200 transition-all relative">
                                {activeTab === 'pending' && (
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.ideas.includes(idea.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(prev => ({ ...prev, ideas: [...prev.ideas, idea.id] }));
                                            } else {
                                                setSelectedItems(prev => ({ ...prev, ideas: prev.ideas.filter(id => id !== idea.id) }));
                                            }
                                        }}
                                        className="absolute top-4 left-4 w-5 h-5 rounded border-2 border-charcoal-300 cursor-pointer"
                                    />
                                )}
                                <div className="flex justify-between items-start mb-3 ml-8">
                                    <div className="flex-1">
                                        <h3 className="text-base font-black text-charcoal-950 uppercase tracking-tight leading-tight mb-1">{idea.title}</h3>
                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest flex items-center gap-2">
                                            <span>By {idea.profiles?.full_name || 'Anonymous Author'}</span>
                                            {idea.deleted_at ? (
                                                <span className="text-red-500 flex items-center gap-1 ring-1 ring-red-100 px-2 py-0.5 rounded-full bg-red-50/50">
                                                    <span className="w-1 h-1 rounded-full bg-red-500" /> ARCHIVED
                                                </span>
                                            ) : idea.is_approved ? (
                                                <span className="text-emerald-500 flex items-center gap-1 ring-1 ring-emerald-100 px-2 py-0.5 rounded-full bg-emerald-50/50">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 opacity-50" /> AUTH
                                                </span>
                                            ) : (
                                                <span className="text-amber-500 flex items-center gap-1 ring-1 ring-amber-100 px-2 py-0.5 rounded-full bg-amber-50/50">
                                                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> PENDING
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed font-medium">
                                        {idea.short_description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-charcoal-100/50">
                                    {activeTab !== 'pending' && (
                                        <button
                                            onClick={() => onToggleFeatured(idea.id, 'idea', idea.is_featured)}
                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${idea.is_featured
                                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                                : 'bg-white text-charcoal-400 border border-charcoal-200 hover:border-amber-300'
                                                }`}
                                            title={idea.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                                        >
                                            {idea.is_featured ? '⭐ Featured' : '☆ Feature'}
                                        </button>
                                    )}
                                    {activeTab === 'pending' && (
                                        <div className="flex gap-1.5 w-full sm:w-auto">
                                            <button
                                                onClick={() => onApprove(idea.id, 'idea')}
                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => onRequestRevision(idea.id, 'idea')}
                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-white text-amber-600 border border-amber-200 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-amber-50 transition-all"
                                            >
                                                Revision
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 items-center w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                                        <Link
                                            to={`/ideas/${idea.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1.5 bg-charcoal-50 text-charcoal-600 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-charcoal-900 hover:text-white transition-all"
                                        >
                                            Preview
                                        </Link>
                                        <Link
                                            to={`/edit-idea/${idea.id}`}
                                            className="px-2.5 py-1.5 bg-white text-primary-600 border border-primary-100 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => activeTab === 'archived' ? onUnarchive(idea.id, 'idea') : onDelete(idea.id, 'idea')}
                                            className={`px-2.5 py-1.5 bg-white ${activeTab === 'archived' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-400 hover:bg-red-50 hover:text-red-600'} border border-transparent rounded-lg text-[8px] font-black uppercase tracking-wider transition-all`}
                                        >
                                            {activeTab === 'archived' ? 'Restore' : 'Archive'}
                                        </button>
                                        <button
                                            onClick={() => onPermanentDelete(idea.id, 'idea', idea.title)}
                                            className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-red-700 transition-all"
                                            title="Permanently delete from database"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                                {idea.proof_url && (
                                    <div className="mt-3 text-right">
                                        <a href={idea.proof_url} target="_blank" rel="noreferrer" className="text-[8px] font-black text-primary-600 uppercase tracking-widest hover:underline inline-flex items-center gap-1 opacity-60 hover:opacity-100">
                                            <span>📁</span> Proof Attached
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Franchises Section */}
            <section className="card bg-white border-none shadow-xl p-4 md:p-8 h-fit">
                <div className="flex justify-between items-center mb-8 border-b border-charcoal-50 pb-4">
                    <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                        <span>🏢</span> {activeTab === 'pending' ? 'Pending Franchises' : activeTab === 'history' ? 'Verified Franchises' : activeTab === 'archived' ? 'Archived Franchises' : 'All Franchises'}
                    </h2>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {filteredFranchises.length} Items
                    </span>
                </div>

                <div className="space-y-6">
                    {filteredFranchises.length === 0 ? (
                        <div className="py-12 text-center text-charcoal-400 font-medium italic">
                            {activeTab === 'pending' ? 'No pending franchises.' : 'No items found.'}
                        </div>
                    ) : (
                        filteredFranchises.map(fran => (
                            <div key={fran.id} className="p-3 md:p-5 bg-charcoal-50 rounded-xl border border-charcoal-100 group hover:border-emerald-200 transition-all relative">
                                {activeTab === 'pending' && (
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.franchises.includes(fran.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(prev => ({ ...prev, franchises: [...prev.franchises, fran.id] }));
                                            } else {
                                                setSelectedItems(prev => ({ ...prev, franchises: prev.franchises.filter(id => id !== fran.id) }));
                                            }
                                        }}
                                        className="absolute top-4 left-4 w-5 h-5 rounded border-2 border-charcoal-300 cursor-pointer"
                                    />
                                )}
                                <div className="flex justify-between items-start mb-3 ml-8">
                                    <div className="flex-1">
                                        <h3 className="text-base font-black text-charcoal-950 uppercase tracking-tight leading-tight mb-1">{fran.name}</h3>
                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest flex items-center gap-2">
                                            <span>By {fran.profiles?.full_name || 'Anonymous Author'}</span>
                                            {fran.deleted_at ? (
                                                <span className="text-red-500 flex items-center gap-1 ring-1 ring-red-100 px-2 py-0.5 rounded-full bg-red-50/50">
                                                    <span className="w-1 h-1 rounded-full bg-red-500" /> ARCHIVED
                                                </span>
                                            ) : fran.is_approved ? (
                                                <span className="text-emerald-500 flex items-center gap-1 ring-1 ring-emerald-100 px-2 py-0.5 rounded-full bg-emerald-50/50">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 opacity-50" /> VERIFIED
                                                </span>
                                            ) : (
                                                <span className="text-amber-500 flex items-center gap-1 ring-1 ring-amber-100 px-2 py-0.5 rounded-full bg-amber-50/50">
                                                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> PENDING
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-[8px] font-black text-charcoal-400 bg-white border border-charcoal-100 px-2 py-1 rounded-md uppercase tracking-widest">
                                        {fran.category}
                                    </span>
                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md uppercase tracking-widest">
                                        {(fran.investment_min / 100000).toFixed(1)}L Min
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 pt-3 md:pt-4 border-t border-charcoal-100/50 ml-0 md:ml-8">
                                    {activeTab !== 'pending' && (
                                        <button
                                            onClick={() => onToggleFeatured(fran.id, 'franchise', fran.is_featured)}
                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${fran.is_featured
                                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                                : 'bg-white text-charcoal-400 border border-charcoal-200 hover:border-amber-300'
                                                }`}
                                            title={fran.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                                        >
                                            {fran.is_featured ? '⭐ Featured' : '☆ Feature'}
                                        </button>
                                    )}
                                    {activeTab === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => onApprove(fran.id, 'franchise')}
                                                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all"
                                            >
                                                Verify
                                            </button>
                                            <button
                                                onClick={() => onRequestRevision(fran.id, 'franchise')}
                                                className="px-3.5 py-1.5 bg-white text-amber-600 border border-amber-200 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-amber-50 transition-all"
                                            >
                                                Request Changes
                                            </button>
                                        </>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 items-center w-full sm:w-auto mt-2 sm:mt-0">
                                        <Link
                                            to={`/franchise/${fran.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-charcoal-100 text-charcoal-600 border border-charcoal-200 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-charcoal-900 hover:text-white transition-all text-center"
                                        >
                                            Preview
                                        </Link>
                                        <Link
                                            to={`/edit-franchise/${fran.id}`}
                                            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white text-primary-600 border border-primary-100 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all text-center"
                                        >
                                            Modify
                                        </Link>
                                        <button
                                            onClick={() => activeTab === 'archived' ? onUnarchive(fran.id, 'franchise') : onDelete(fran.id, 'franchise')}
                                            className={`flex-1 sm:flex-none px-2.5 py-1.5 bg-white ${activeTab === 'archived' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-400 hover:bg-red-50 hover:text-red-600'} border border-transparent rounded-lg text-[8px] font-black uppercase tracking-wider transition-all`}
                                        >
                                            {activeTab === 'archived' ? 'Unarchive' : 'Archive'}
                                        </button>
                                        <button
                                            onClick={() => onPermanentDelete(fran.id, 'franchise', fran.name)}
                                            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-red-600 text-white border border-red-700 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-red-700 transition-all"
                                            title="Permanently delete from database"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                                {fran.proof_url && (
                                    <div className="mt-3 text-right">
                                        <a href={fran.proof_url} target="_blank" rel="noreferrer" className="text-[8px] font-black text-primary-600 uppercase tracking-widest hover:underline inline-flex items-center gap-1 opacity-60 hover:opacity-100">
                                            <span>📁</span> Proof Attached
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
