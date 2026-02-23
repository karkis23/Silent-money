export default function CategorySector({ categories, onAddCategory, onEditCategory, onDeleteCategory }) {
    return (
        <div className="space-y-6">
            <section className="card bg-white border-none shadow-xl p-8 mb-10 overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tighter">Category Management</h2>
                        <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">Manage all business categories and tags</p>
                    </div>
                    <button
                        onClick={onAddCategory}
                        className="px-6 py-2.5 bg-charcoal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 shadow-lg shadow-charcoal-900/10 transition-all flex items-center gap-2"
                    >
                        <span>➕</span> Add New Category
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] border-b border-charcoal-50">
                                <th className="pb-4 pl-4 text-center">Order</th>
                                <th className="pb-4">Category</th>
                                <th className="pb-4">Slug / Path</th>
                                <th className="pb-4">Description</th>
                                <th className="pb-4 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-50">
                            {categories.map(cat => (
                                <tr key={cat.id} className="group hover:bg-charcoal-50 transition-colors">
                                    <td className="py-6 pl-4 text-center">
                                        <span className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center text-[10px] font-black text-charcoal-600 mx-auto">
                                            {cat.display_order}
                                        </span>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-lg border border-primary-100 group-hover:scale-110 transition-transform">
                                                {cat.icon || '📁'}
                                            </div>
                                            <div className="text-sm font-black text-charcoal-900">{cat.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="px-2 py-1 bg-charcoal-100 rounded text-[9px] font-mono font-bold text-charcoal-600">/{cat.slug}</span>
                                    </td>
                                    <td className="py-6 pr-8">
                                        <div className="text-[10px] font-medium text-charcoal-500 line-clamp-1 max-w-xs">{cat.description || 'No description provided.'}</div>
                                    </td>
                                    <td className="py-6 text-right pr-4">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => onEditCategory(cat)} className="p-2 bg-white text-charcoal-400 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-all">⚙️</button>
                                            <button onClick={() => onDeleteCategory(cat.id)} className="p-2 bg-white text-charcoal-400 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
