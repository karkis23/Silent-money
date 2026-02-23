import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ImageUpload from '../components/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AddIdeaPage: The main page for adding new business ideas.
 * 
 * DESIGN SPECIFICATIONS:
 * - Step-by-step guide: Guides through Basic Info, Details, Financials, and SEO phases.
 * - Automatic SEO: Automatically generates optimized metadata.
 * - Real-Time Validation: Checks for missing info in each step.
 * - Image upload: Integrated handling for idea images.
 * @component
 */
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
        time_to_first_income_days: 0,
        effort_level: 'semi-passive',
        risk_level: 'medium',
        success_rate_percentage: 0,
        skills_required: '',
        time_commitment_hours_per_week: 0,
        is_premium: false,
        is_featured: false,
        is_india_specific: true,
        meta_title: '',
        meta_description: '',
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

        setFormData(prev => {
            const updates = { title, slug };
            // Auto-generate meta title
            if (!prev.meta_title || prev.meta_title === `${prev.title} | Silent Money`) {
                updates.meta_title = `${title} | Silent Money`;
            }
            return { ...prev, ...updates };
        });
    };

    const handleShortDescChange = (e) => {
        const { value } = e.target;
        setFormData(prev => {
            const updates = { short_description: value };

            // Intelligence-Led SEO Generation: Strip Markdown & consolidate formatting
            const cleanText = value
                .replace(/[#*`~_]/g, '')
                .replace(/\n+/g, ' ')
                .trim();

            // Auto-generate meta description if currently empty or matches truncated short_desc
            if (!prev.meta_description || prev.meta_description.length < 5 || prev.meta_description === prev.short_description.substring(0, 160)) {
                updates.meta_description = cleanText.substring(0, 160);
            }
            return { ...prev, ...updates };
        });
    };

    const handleFullDescChange = (e) => {
        const { value } = e.target;
        setFormData(prev => {
            const updates = { full_description: value };

            // SECURE SKILL EXTRACTION:
            // Auto-detect expertise nodes from operational documentation.
            if (!prev.skills_required || prev.skills_required.length < 5) {
                const prioritizedSkills = [
                    'Digital Marketing', 'Market Research', 'Basic Sales', 'Social Media',
                    'Content Creation', 'Consistency', 'Customer Support', 'AI Tools',
                    'SEO', 'Email Marketing', 'Financial Planning', 'Logistics',
                    'Technical Setup', 'Networking', 'Project Management', 'Branding',
                    'Writing', 'Graphic Design', 'Video Editing', 'Product Sourcing',
                    'Strategic Planning', 'Problem Solving', 'Data Analysis'
                ];

                const discovered = prioritizedSkills
                    .filter(skill => value.toLowerCase().includes(skill.toLowerCase()));

                // Ensure at least 3 are selected by taking discovered ones first, 
                // then filling with the top general skills if needed.
                const finalMatches = [...new Set([...discovered, 'Market Research', 'Strategic Planning', 'Consistency'])]
                    .slice(0, 3);

                updates.skills_required = finalMatches.join(', ');
            }
            return { ...prev, ...updates };
        });
    };

    const nextStep = () => {
        if (step === 1 && (!formData.title || !formData.category_id || !formData.short_description)) {
            setError('Basic information required (Title, Category, Summary).');
            return;
        }
        if (step === 2 && (!formData.full_description || !formData.initial_investment_min || !formData.monthly_income_min)) {
            setError('Detailed information required (Guide, Investment, Income).');
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
        if (step < 3) {
            nextStep();
            return;
        }

        // Final Validation Check
        if (!formData.full_description || !formData.initial_investment_min || !formData.monthly_income_min) {
            setError('Incomplete info: Investment metrics and Guide are required.');
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
                effort_level: formData.effort_level,
                risk_level: formData.risk_level,
                time_commitment_hours_per_week: Number(formData.time_commitment_hours_per_week),
                skills_required: skillsArray,
                is_premium: formData.is_premium,
                is_featured: formData.is_featured,
                is_india_specific: formData.is_india_specific,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
            };

            const { error: insertError } = await supabase
                .from('income_ideas')
                .insert([{
                    ...payload,
                    is_approved: false // Require moderation
                }]);

            if (insertError) throw insertError;

            navigate(`/ideas/${uniqueSlug}`);
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
        <div className="min-h-screen bg-cream-50 pt-20 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <SEO title="Add New Idea" />
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <BackButton label="Back" className="mb-8" />
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 mb-2 tracking-tighter">
                                Add <span className="text-primary-600">Idea</span>
                            </h1>
                            <p className="text-charcoal-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                                Step {step} of 3 • {step === 1 ? 'Basic Info' : step === 2 ? 'Detailed Info' : 'SEO & Settings'}
                            </p>
                        </div>
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-600' : 'bg-charcoal-100'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card border-none shadow-2xl p-6 md:p-10 bg-white relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 to-indigo-600" />

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            <span>🚫 ERROR:</span> {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Title</label>
                                            <input type="text" value={formData.title} onChange={handleTitleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all" placeholder="e.g. Semi-Auto Kiosk Brand" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Category</label>
                                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 transition-all appearance-none">
                                                <option value="">Select Category</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <ImageUpload label="Hero Visualization" onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))} currentUrl={formData.image_url} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Short Description</label>
                                    <textarea name="short_description" rows={2} value={formData.short_description} onChange={handleShortDescChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-medium text-charcoal-700 transition-all" placeholder="2-line summary..." />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                                {/* Financial Matrix Segment */}
                                <div className="space-y-8 pb-8 border-b border-charcoal-50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">💰</span>
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-charcoal-950">Financials</h2>
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
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Risk Level</label>
                                                <select name="risk_level" value={formData.risk_level} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 appearance-none">
                                                    <option value="low">Low Risk</option>
                                                    <option value="medium">Medium Risk</option>
                                                    <option value="high">High Risk</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Effort Level</label>
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
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-charcoal-950">Details</h2>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-1 pr-1">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">How it Works (Full Description)</label>
                                            <div className="text-[8px] font-bold text-primary-600/60 uppercase tracking-widest">
                                                **bold** • - list • {">"} quote • # header
                                            </div>
                                        </div>
                                        <textarea required name="full_description" rows={10} value={formData.full_description} onChange={handleFullDescChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-medium text-charcoal-700 transition-all min-h-[250px] research-editor resize-y" placeholder="Explain how this works step-by-step..." />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Expert Review</label>
                                            <textarea required name="reality_check" rows={6} value={formData.reality_check} onChange={handleChange} className="w-full px-5 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl outline-none font-medium text-amber-900 transition-all research-editor resize-y" placeholder="Be honest about the risks..." />
                                        </div>
                                        <ImageUpload label="Verification Proof" bucket="proofs" onUpload={(url) => setFormData(prev => ({ ...prev, proof_url: url }))} currentUrl={formData.proof_url} />
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Days to First Income</label>
                                            <input type="number" name="time_to_first_income_days" value={formData.time_to_first_income_days} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Commitment (Hrs/Wk)</label>
                                            <input type="number" name="time_commitment_hours_per_week" value={formData.time_commitment_hours_per_week} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Success Rate (%)</label>
                                            <input type="number" name="success_rate_percentage" value={formData.success_rate_percentage} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900" min="0" max="100" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Required Expertise</label>
                                        <input type="text" name="skills_required" value={formData.skills_required} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 transition-all" placeholder="e.g. Marketing, Basic Computer Skills" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                                {/* Deployment Controls */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">🌐</span>
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-charcoal-950">Settings</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <label className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-2xl border border-charcoal-100 cursor-pointer hover:bg-white hover:shadow-lg transition-all">
                                            <input
                                                type="checkbox"
                                                name="is_india_specific"
                                                checked={formData.is_india_specific}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_india_specific: e.target.checked }))}
                                                className="w-5 h-5 rounded border-charcoal-200 text-primary-600 focus:ring-primary-600 bg-white"
                                            />
                                            <span className="text-[10px] font-black text-charcoal-700 uppercase tracking-widest">India Specific</span>
                                        </label>

                                        {/* Premium/Featured only for admins or based on platform rules, here showing for all in add? 
                                            Actually, AddIdeaPage is for everyone. We should probably only show these if is_admin.
                                        */}
                                        <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer hover:bg-white hover:shadow-lg transition-all">
                                            <input
                                                type="checkbox"
                                                name="is_premium"
                                                checked={formData.is_premium}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_premium: e.target.checked }))}
                                                className="w-5 h-5 rounded border-amber-200 text-amber-600 focus:ring-amber-500 bg-white"
                                            />
                                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Premium Content</span>
                                        </label>
                                    </div>
                                </div>

                                {/* SEO Section */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">🔍</span>
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-charcoal-950">Search Engine Info (SEO)</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Meta Title (Signal Header)</label>
                                            <input
                                                type="text"
                                                name="meta_title"
                                                value={formData.meta_title}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-bold text-charcoal-900 transition-all"
                                                placeholder="Strategic title for search engines..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Meta Description (Signal Summary)</label>
                                            <textarea
                                                name="meta_description"
                                                rows={2}
                                                value={formData.meta_description}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl outline-none font-medium text-charcoal-700 transition-all"
                                                placeholder="Executive summary for search engines..."
                                            />
                                        </div>
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
                        {step < 3 ? (
                            <button type="button" onClick={nextStep} className="flex-1 py-5 bg-charcoal-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-600 transition-all shadow-xl shadow-charcoal-100">
                                Proceed to {step === 1 ? 'Detailed Info' : 'SEO & Settings'}
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="flex-1 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-primary-200">
                                {loading ? 'Saving...' : '🚀 Save Idea'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div >
    );
}
