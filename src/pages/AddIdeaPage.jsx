import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ImageUpload from '../components/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddIdeaPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category_id: '',
        short_description: '',
        full_description: '',
        reality_check: '',
        initial_investment_min: '',
        initial_investment_max: '',
        monthly_income_min: '',
        monthly_income_max: '',
        time_to_first_income_days: 30,
        effort_level: 'semi-passive',
        risk_level: 'medium',
        success_rate_percentage: 50,
        skills_required: '',
        image_url: '',
        proof_url: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, title, slug }));
    };

    const nextStep = () => {
        if (step === 1 && (!formData.title || !formData.category_id || !formData.short_description)) {
            setError('Foundational intelligence required (Title, Category, Summary).');
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

        // Strategic Safeguard: Prevent submission if not on the final Intelligence step
        if (step < 2) {
            nextStep();
            return;
        }

        // Final Validation Check
        if (!formData.full_description || !formData.initial_investment_min || !formData.monthly_income_min) {
            setError('Incomplete Blueprint: Investment metrics and Operational Guide are required.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const skillsArray = formData.skills_required.split(',').map(s => s.trim()).filter(Boolean);
            const userRes = await supabase.auth.getUser();
            const userId = userRes.data.user.id;

            const uniqueSlug = `${formData.slug}-${Math.random().toString(36).substring(2, 6)}`;

            const payload = {
                ...formData,
                slug: uniqueSlug,
                author_id: userId,
                initial_investment_min: Number(formData.initial_investment_min),
                initial_investment_max: Number(formData.initial_investment_max),
                monthly_income_min: Number(formData.monthly_income_min),
                monthly_income_max: Number(formData.monthly_income_max),
                time_to_first_income_days: Number(formData.time_to_first_income_days),
                success_rate_percentage: Number(formData.success_rate_percentage),
                skills_required: skillsArray,
                is_premium: false,
                is_india_specific: true
            };

            const { error: insertError } = await supabase
                .from('income_ideas')
                .insert([{
                    ...payload,
                    is_approved: false // Require moderation
                }]);

            if (insertError) throw insertError;

            navigate('/dashboard');
        } catch (err) {
            console.error('Error adding idea:', err);
            setError(err.message || 'Failed to add idea');
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <SEO title="Forge New Income Blueprint" />
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <BackButton label="Abort Mission" className="mb-8" />
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 mb-2 tracking-tighter">
                                Deploy <span className="text-primary-600">Blueprint</span>
                            </h1>
                            <p className="text-charcoal-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                                Step {step} of 2 • {step === 1 ? 'Foundation' : 'Full Intelligence'}
                            </p>
                        </div>
                        <div className="flex gap-1 mb-2">
                            {[1, 2].map(i => (
                                <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-600' : 'bg-charcoal-100'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card border-none shadow-2xl p-10 bg-white relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 to-indigo-600" />

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            <span>🚫 SYSTEM ERROR:</span> {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Strategic Title</label>
                                            <input type="text" value={formData.title} onChange={handleTitleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all" placeholder="e.g. Semi-Auto Kiosk Brand" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Sector Classification</label>
                                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 transition-all appearance-none">
                                                <option value="">Select Category Matrix</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <ImageUpload label="Hero Visualization" onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))} currentUrl={formData.image_url} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Intelligence Summary</label>
                                    <textarea name="short_description" rows={2} value={formData.short_description} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-medium text-charcoal-700 transition-all" placeholder="2-line executive summary..." />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                                {/* Financial Matrix Segment */}
                                <div className="space-y-8 pb-8 border-b border-charcoal-50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">💰</span>
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-charcoal-950">Financial matrix</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Min Capital (₹)</label>
                                                    <input required type="number" name="initial_investment_min" value={formData.initial_investment_min} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-black text-charcoal-950" placeholder="0" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Max Capital (₹)</label>
                                                    <input type="number" name="initial_investment_max" value={formData.initial_investment_max} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-black text-charcoal-950" placeholder="0" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Min Monthly (₹)</label>
                                                    <input required type="number" name="monthly_income_min" value={formData.monthly_income_min} onChange={handleChange} className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none font-black text-emerald-700" placeholder="0" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Max Monthly (₹)</label>
                                                    <input type="number" name="monthly_income_max" value={formData.monthly_income_max} onChange={handleChange} className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none font-black text-emerald-700" placeholder="0" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Risk Exposure</label>
                                                <select name="risk_level" value={formData.risk_level} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 appearance-none">
                                                    <option value="low">Low Risk</option>
                                                    <option value="medium">Medium Risk</option>
                                                    <option value="high">High Risk</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Deployment Effort</label>
                                                <select name="effort_level" value={formData.effort_level} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 appearance-none">
                                                    <option value="passive">Autonomous (Passive)</option>
                                                    <option value="semi-passive">Monitoring (Semi-Passive)</option>
                                                    <option value="active">Operational (Active)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Intelligence Segment */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">📖</span>
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-charcoal-950">Operational Guide</h2>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Execution Workflow (Deep Intel)</label>
                                        <textarea required name="full_description" rows={10} value={formData.full_description} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-medium text-charcoal-700 transition-all min-h-[250px]" placeholder="Explain the mechanics of this wealth engine step-by-step..." />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Reality Protocol (Boundaries & Risks)</label>
                                            <textarea required name="reality_check" rows={6} value={formData.reality_check} onChange={handleChange} className="w-full px-5 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl outline-none font-medium text-amber-900 transition-all" placeholder="Be brutally honest about the market risks..." />
                                        </div>
                                        <ImageUpload label="Verification Proof (Confidential)" bucket="proofs" onUpload={(url) => setFormData(prev => ({ ...prev, proof_url: url }))} currentUrl={formData.proof_url} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Required Expertise (Comma Separated)</label>
                                        <input type="text" name="skills_required" value={formData.skills_required} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 transition-all" placeholder="e.g. Digital Marketing, Basic Spreadsheet Skills" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 pt-12 border-t border-charcoal-50 mt-12">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="px-8 py-5 border border-charcoal-100 text-charcoal-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-charcoal-50 transition-all">
                                Previous
                            </button>
                        )}
                        {step < 2 ? (
                            <button type="button" onClick={nextStep} className="flex-1 py-5 bg-charcoal-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-600 transition-all shadow-xl shadow-charcoal-100">
                                Proceed to Full Intelligence
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="flex-1 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-primary-200">
                                {loading ? 'Transmitting...' : '🚀 Finalize Deployment'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
