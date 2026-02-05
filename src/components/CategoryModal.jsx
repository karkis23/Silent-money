import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryModal({
    isOpen,
    onClose,
    onConfirm,
    category = null, // If null, we're creating a new category
}) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        display_order: 0
    });

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setFormData({
                    name: category.name || '',
                    slug: category.slug || '',
                    description: category.description || '',
                    icon: category.icon || '',
                    display_order: category.display_order || 0
                });
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    icon: '',
                    display_order: 0
                });
            }
        }
    }, [isOpen, category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Auto-generate slug from name if creating new and slug is empty or matches previous name slug
            if (name === 'name' && !category) {
                newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            }
            return newData;
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-charcoal-100"
                    >
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shadow-inner border border-primary-100">
                                    {formData.icon || '📁'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-charcoal-950 tracking-tight leading-none mb-1.5">
                                        {category ? 'Edit Category' : 'Create New Category'}
                                    </h3>
                                    <p className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest">
                                        Institutional Taxonomy Management
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium transition-all"
                                            placeholder="e.g. Digital Real Estate"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">
                                            Category Icon (Emoji)
                                        </label>
                                        <input
                                            type="text"
                                            name="icon"
                                            value={formData.icon}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium transition-all"
                                            placeholder="e.g. 🏠"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">
                                        Slug (URL Identifier)
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium transition-all"
                                        placeholder="e.g. digital-real-estate"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium min-h-[80px] resize-none transition-all"
                                        placeholder="Briefly describe what this category covers..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        name="display_order"
                                        value={formData.display_order}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={onClose}
                                    className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm(formData);
                                        onClose();
                                    }}
                                    disabled={!formData.name || !formData.slug}
                                    className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl bg-charcoal-950 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {category ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
