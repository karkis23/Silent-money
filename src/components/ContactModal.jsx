import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function ContactModal({ isOpen, onClose, brandName, email, phone }) {
    if (!isOpen) return null;

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard`);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-charcoal-100"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-primary-600" />

                    <div className="p-10">
                        <header className="mb-10 text-center">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-inner">
                                📞
                            </div>
                            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.4em] mb-2">Connect with Brand</h2>
                            <h3 className="text-2xl font-black text-charcoal-900 tracking-tight">{brandName}</h3>
                        </header>

                        <div className="space-y-4">
                            {email ? (
                                <button
                                    onClick={() => {
                                        window.location.href = `mailto:${email}`;
                                        copyToClipboard(email, 'Email');
                                    }}
                                    className="w-full bg-charcoal-50 p-6 rounded-[2rem] border border-charcoal-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-left flex items-center gap-5"
                                >
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                        ✉️
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest">Email Address</div>
                                        <div className="text-sm font-bold text-charcoal-900">{email}</div>
                                    </div>
                                </button>
                            ) : (
                                <div className="w-full bg-charcoal-50/50 p-6 rounded-[2rem] border border-charcoal-50 opacity-50 flex items-center gap-5 italic text-sm font-medium">
                                    No email provided.
                                </div>
                            )}

                            {phone ? (
                                <button
                                    onClick={() => {
                                        window.location.href = `tel:${phone}`;
                                        copyToClipboard(phone, 'Phone number');
                                    }}
                                    className="w-full bg-charcoal-50 p-6 rounded-[2rem] border border-charcoal-100 hover:bg-primary-50 hover:border-primary-200 transition-all group text-left flex items-center gap-5"
                                >
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                        📱
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest">Phone Number</div>
                                        <div className="text-sm font-bold text-charcoal-900">{phone}</div>
                                    </div>
                                </button>
                            ) : (
                                <div className="w-full bg-charcoal-50/50 p-6 rounded-[2rem] border border-charcoal-50 opacity-50 flex items-center gap-5 italic text-sm font-medium">
                                    No phone number provided.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-10 w-full py-5 bg-charcoal-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-charcoal-800 transition-all shadow-xl"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
