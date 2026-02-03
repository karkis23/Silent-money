import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    inputType = 'text', // 'text' (feedback only) or 'audit' (feedback + url)
    initialFeedback = '',
    initialUrl = '',
    confirmText = "Submit Action"
}) {
    const [feedback, setFeedback] = useState(initialFeedback);
    const [reportUrl, setReportUrl] = useState(initialUrl);

    useEffect(() => {
        if (isOpen) {
            setFeedback(initialFeedback);
            setReportUrl(initialUrl);
        }
    }, [isOpen, initialFeedback, initialUrl]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-charcoal-100"
                    >
                        <div className="p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl shadow-inner border border-primary-100">
                                    {inputType === 'audit' ? '📊' : '📝'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-charcoal-950 tracking-tight leading-none mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-0.5">
                                        Institutional Moderation Command
                                    </p>
                                </div>
                            </div>

                            <p className="text-charcoal-500 font-medium leading-relaxed mb-8 text-sm">
                                {message}
                            </p>

                            <div className="space-y-6 mb-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">
                                        Strategic Feedback
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium min-h-[120px] resize-none transition-all"
                                        placeholder="Enter your expert assessment..."
                                    />
                                </div>

                                {inputType === 'audit' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">
                                            Institutional Report URL
                                        </label>
                                        <input
                                            type="url"
                                            value={reportUrl}
                                            onChange={(e) => setReportUrl(e.target.value)}
                                            className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium transition-all"
                                            placeholder="https://institutional-reports.vault/..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={onClose}
                                    className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-charcoal-500 border border-charcoal-100 hover:bg-charcoal-50 transition-all"
                                >
                                    Cancel Mission
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm(feedback, reportUrl);
                                        onClose();
                                    }}
                                    disabled={!feedback.trim()}
                                    className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl bg-charcoal-950 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-charcoal-950 disabled:hover:scale-100"
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
