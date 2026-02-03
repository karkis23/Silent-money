import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) {
    if (!isOpen) return null;

    const accentColor = type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-primary-600 hover:bg-primary-700";
    const shadowColor = type === "danger" ? "shadow-red-600/20" : "shadow-primary-600/20";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-charcoal-100"
                    >
                        <div className="p-10 text-center">
                            <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl shadow-xl ${type === 'danger' ? 'bg-red-50 text-red-600 shadow-red-100' : 'bg-primary-50 text-primary-600 shadow-primary-100'}`}>
                                {type === 'danger' ? '⚠️' : '🛡️'}
                            </div>

                            <h3 className="text-2xl font-black text-charcoal-950 tracking-tight mb-3">
                                {title}
                            </h3>

                            <p className="text-charcoal-500 font-medium leading-relaxed mb-10">
                                {message}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={onClose}
                                    className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50 transition-all"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl ${accentColor} ${shadowColor} transition-all hover:scale-[1.02] active:scale-[0.98]`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
