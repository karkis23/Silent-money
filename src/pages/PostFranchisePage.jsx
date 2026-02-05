import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ImageUpload from '../components/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostFranchisePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: 'Food & Beverage',
        investment_min: '',
        investment_max: '',
        roi_months_min: '',
        roi_months_max: '',
        space_required_sqft: '',
        expected_profit_min: '',
        expected_profit_max: '',
        description: '',
        image_url: '',
        website_url: '',
        contact_email: '',
        contact_phone: '',
        proof_url: '',
        // Enhanced Data Fields
        unit_model: '',
        market_maturity: '',
        corporate_support: '',
        operator_retention: '',
        network_density: '',
        asset_grade: 'A',
        risk_profile: 'Low',
        supply_chain: '',
        staffing_model: '',
        tech_stack: '',
        marketing_support: '',
    });

    const categories = ['Food & Beverage', 'Retail', 'Healthcare', 'Logistics', 'Education', 'Automotive', 'Service'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.category || !formData.image_url)) {
            setError('Please complete the business foundation.');
            return;
        }
        if (step === 2 && (!formData.investment_min || !formData.roi_months_min || !formData.description)) {
            setError('Operational metrics are required for verification.');
            return;
        }
        setError('');
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Strategic Safeguard: Only allow submission on the final Phase
        if (step < 3) {
            nextStep();
            return;
        }

        setLoading(true);
        setError('');

        const baseSlug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

        const { error } = await supabase.from('franchises').insert([{
            ...formData,
            slug,
            investment_min: parseInt(formData.investment_min),
            investment_max: parseInt(formData.investment_max),
            roi_months_min: parseInt(formData.roi_months_min),
            roi_months_max: parseInt(formData.roi_months_max),
            space_required_sqft: parseInt(formData.space_required_sqft),
            expected_profit_min: parseInt(formData.expected_profit_min),
            expected_profit_max: parseInt(formData.expected_profit_max),
            // Pass Enhanced Fields
            unit_model: formData.unit_model,
            market_maturity: formData.market_maturity,
            corporate_support: formData.corporate_support,
            operator_retention: formData.operator_retention ? parseInt(formData.operator_retention) : null,
            network_density: formData.network_density ? parseInt(formData.network_density) : null,
            asset_grade: formData.asset_grade,
            risk_profile: formData.risk_profile,
            supply_chain: formData.supply_chain,
            staffing_model: formData.staffing_model,
            tech_stack: formData.tech_stack,
            marketing_support: formData.marketing_support,
            author_id: user.id,
            is_approved: false // Require moderation
        }]);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4">
            <SEO title="Deploy Franchise Opportunity" />
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <BackButton label="Abort Deployment" className="mb-8" />
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 mb-2 tracking-tighter">
                                List <span className="text-primary-600">Franchise</span>
                            </h1>
                            <p className="text-charcoal-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                                Phase {step} of 3 • {step === 1 ? 'Business Foundation' : step === 2 ? 'Operational Metrics' : 'Connectivity'}
                            </p>
                        </div>
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 w-10 rounded-full bg-charcoal-100 overflow-hidden relative`}>
                                    <div className={`absolute inset-0 bg-primary-600 transition-transform duration-500 ${step >= i ? 'translate-x-0' : '-translate-x-full'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="card border-none shadow-2xl p-10 bg-white relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 to-emerald-600" />

                    {error && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                            <span>⚠️ CORE ERROR:</span> {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="fstep1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Brand Identity</label>
                                            <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. Chai Point Express" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Sector Classification</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold appearance-none">
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <ImageUpload label="Brand Key Visual" onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))} currentUrl={formData.image_url} />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="fstep2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Min Cap (₹)</label>
                                                <input type="number" name="investment_min" value={formData.investment_min} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Max Cap (₹)</label>
                                                <input type="number" name="investment_max" value={formData.investment_max} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl font-bold" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Payback (Mo)</label>
                                                <input type="number" name="roi_months_min" value={formData.roi_months_min} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Space (Sqft)</label>
                                                <input type="number" name="space_required_sqft" value={formData.space_required_sqft} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                    <ImageUpload label="Verification Proof (Private)" bucket="proofs" onUpload={(url) => setFormData(prev => ({ ...prev, proof_url: url }))} currentUrl={formData.proof_url} />
                                </div>

                                {/* Enhanced Data Input Section */}
                                <div className="space-y-8 pt-8 border-t border-charcoal-100">
                                    {/* Business Intelligence */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest pl-1 border-l-4 border-primary-600 ml-1">Business Intelligence</h3>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Unit Model</label>
                                                <input name="unit_model" value={formData.unit_model} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. FOCO" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Market Maturity</label>
                                                <input name="market_maturity" value={formData.market_maturity} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. High" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Corporate Support</label>
                                                <input name="corporate_support" value={formData.corporate_support} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. Full Training" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Market Strength */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest pl-1 border-l-4 border-emerald-500 ml-1">Market Strength</h3>
                                        <div className="grid md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Retention (%)</label>
                                                <input type="number" name="operator_retention" value={formData.operator_retention} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" max="100" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Density (%)</label>
                                                <input type="number" name="network_density" value={formData.network_density} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" max="100" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Asset Grade</label>
                                                <select name="asset_grade" value={formData.asset_grade} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold">
                                                    <option value="AAA+">AAA+</option>
                                                    <option value="AA">AA</option>
                                                    <option value="A">A</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B">B</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Risk Profile</label>
                                                <select name="risk_profile" value={formData.risk_profile} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold">
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Operational Logistics */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest pl-1 border-l-4 border-amber-500 ml-1">Operational Logistics</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Supply Chain</label>
                                                <input name="supply_chain" value={formData.supply_chain} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. Centralized" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Staffing Model</label>
                                                <input name="staffing_model" value={formData.staffing_model} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. 4-6 Certified" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Tech Stack</label>
                                                <input name="tech_stack" value={formData.tech_stack} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. POS & CRM" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Marketing Support</label>
                                                <input name="marketing_support" value={formData.marketing_support} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold" placeholder="e.g. National Ads" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-1 pr-1">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Operational Analytics & Description</label>
                                            <div className="text-[8px] font-bold text-primary-600/60 uppercase tracking-widest">
                                                **bold** • - list • {">"} quote • # header
                                            </div>
                                        </div>
                                        <textarea name="description" rows={8} value={formData.description} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-medium min-h-[200px] research-editor resize-y" placeholder="Explain the business model, support, and track record..." />
                                    </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="fstep3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Official Digital Hub (URL)</label>
                                        <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl font-bold" placeholder="https://brand.com" />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Intelligence Relay (Email)</label>
                                            <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl font-bold" placeholder="inquiry@brand.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Operations Comm (Phone)</label>
                                            <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl font-bold" placeholder="+91 XXXXX XXXXX" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 pt-12 border-t border-charcoal-50 mt-12">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="px-8 py-5 border border-charcoal-100 text-charcoal-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-charcoal-50 transition-all">
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button type="button" onClick={nextStep} className="flex-1 py-5 bg-charcoal-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-600 transition-all shadow-xl shadow-charcoal-100">
                                Proceed to {step === 1 ? 'Operational Metrics' : 'Connectivity Protocol'}
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="flex-1 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-primary-200">
                                {loading ? 'Transmitting...' : '🚀 Finalize Brand Listing'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
