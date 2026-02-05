import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

export default function ExpertAuditModal({ isOpen, onClose, prefillBrand = '', prefillSector = '' }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        brand_name: prefillBrand || '',
        brand_sector: prefillSector || '',
        website_url: '',
        investment_budget: '5-10L',
        location_target: '',
        additional_notes: ''
    });

    // Handle prefill when modal opens or props change
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                brand_name: prefillBrand || prev.brand_name,
                brand_sector: prefillSector || prev.brand_sector
            }));
        }
    }, [isOpen, prefillBrand, prefillSector]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be signed in to request an audit.');

            const { error: insertError } = await supabase
                .from('expert_audit_requests')
                .insert([{
                    ...formData,
                    user_id: user.id
                }]);

            if (insertError) {
                console.error('Audit Submission Error:', insertError);
                throw insertError;
            }

            setSuccess(true);
            toast.success('Audit Request Transmitted! Check your Lead Accelerator tab.', {
                duration: 5000,
                icon: '🚀',
            });
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({
                    brand_name: '',
                    brand_sector: '',
                    website_url: '',
                    investment_budget: '5-10L',
                    location_target: '',
                    additional_notes: ''
                });
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

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
                    className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-charcoal-950 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full -mr-16 -mt-16" />
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-charcoal-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">Expert Audit</h2>
                        <p className="text-charcoal-400 text-xs font-bold uppercase tracking-widest">
                            Business Analysis • 48HR Turnaround
                        </p>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-6">
                                    ✓
                                </div>
                                <h3 className="text-2xl font-black text-charcoal-950 mb-2">Request Sent</h3>
                                <p className="text-charcoal-500 font-medium max-w-xs">
                                    Our analysts have received your brief. A detailed report will be available in your dashboard within 48 hours.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest">
                                        🚫 Error: {error}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Brand Name</label>
                                        <input
                                            required
                                            type="text"
                                            name="brand_name"
                                            value={formData.brand_name}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold text-charcoal-900 transition-all"
                                            placeholder="e.g. Blue Tokai"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Industry Sector</label>
                                        <input
                                            type="text"
                                            name="brand_sector"
                                            value={formData.brand_sector}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold text-charcoal-900 transition-all"
                                            placeholder="e.g. Specialty Coffee"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Investment Budget</label>
                                        <select
                                            name="investment_budget"
                                            value={formData.investment_budget}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 appearance-none cursor-pointer"
                                        >
                                            <option value="Under 5L">Under ₹5L</option>
                                            <option value="5-10L">₹5L - ₹10L</option>
                                            <option value="10-25L">₹10L - ₹25L</option>
                                            <option value="25-50L">₹25L - ₹50L</option>
                                            <option value="50L+">₹50L+</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Target Location</label>
                                        <input
                                            type="text"
                                            name="location_target"
                                            value={formData.location_target}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold text-charcoal-900 transition-all"
                                            placeholder="City or Region"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Specific Questions / Notes</label>
                                    <textarea
                                        name="additional_notes"
                                        value={formData.additional_notes}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-5 py-3.5 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-medium text-charcoal-700 transition-all"
                                        placeholder="Any specific concerns or data you need from us?"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-5 bg-charcoal-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-600 transition-all shadow-xl disabled:bg-charcoal-400"
                                >
                                    {loading ? 'Submitting Request...' : '🚀 Submit Audit Request'}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
