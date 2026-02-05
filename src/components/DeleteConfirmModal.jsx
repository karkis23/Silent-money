import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Permanent Deletion",
    itemType = "item"
}) {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConfirmText('');
            setError(false);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (confirmText.toUpperCase() === 'DELETE') {
            onConfirm();
            onClose();
        } else {
            setError(true);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-charcoal-950/70 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden border border-red-100"
                    >
                        <div className="p-10">
                            {/* Warning Header */}
                            <div className="w-24 h-24 rounded-3xl bg-red-50 mx-auto mb-8 flex items-center justify-center text-4xl shadow-xl shadow-red-100 border border-red-100/50">
                                ⚠️
                            </div>

                            <div className="text-center mb-10">
                                <h3 className="text-2xl font-black text-charcoal-950 tracking-tight mb-3">
                                    {title}
                                </h3>
                                <p className="text-charcoal-500 font-medium leading-relaxed px-4">
                                    Are you absolutely sure you want to permanently delete <br />
                                    <span className="text-red-600 font-bold uppercase tracking-tight">"{itemType}"</span>?
                                </p>
                                <div className="mt-4 p-4 bg-red-50/50 rounded-2xl border border-red-100 inline-block">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-tight">
                                        Warning: This action is irreversible & removes <br />
                                        all intelligence from the institutional vault.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block text-center">
                                        Confirm by typing <span className="text-red-500 underline decoration-2 underline-offset-4">DELETE</span> in the field below
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => {
                                            setConfirmText(e.target.value);
                                            setError(false);
                                        }}
                                        autoFocus
                                        className={`w-full px-6 py-4 bg-charcoal-50 border-2 ${error ? 'border-red-500 ring-4 ring-red-100' : 'border-charcoal-100'} rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none text-center font-black text-xl text-red-600 placeholder:text-red-100 transition-all uppercase tracking-widest`}
                                        placeholder="DELETE"
                                    />
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest"
                                        >
                                            Auth Failure: Confirmation text mismatch
                                        </motion.p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-charcoal-500 border-2 border-charcoal-100 hover:bg-charcoal-50 hover:border-charcoal-200 transition-all"
                                    >
                                        Abort Mission
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={confirmText.toUpperCase() !== 'DELETE'}
                                        className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-2xl bg-red-600 hover:bg-red-700 shadow-red-600/30 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                                    >
                                        Execute Deletion
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
