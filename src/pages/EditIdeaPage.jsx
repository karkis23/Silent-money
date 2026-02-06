import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ImageUpload from '../components/ImageUpload';

/**
 * EditIdeaPage: The authoritative terminal for modifying existing income blueprints.
 * 
 * CORE OPERATIONS:
 * - Authorized Modification: Enforces ownership or administrative role gates for asset updates.
 * - Intelligence Synchronization: Real-time validation of cross-linked categories and slugs.
 * - High-Fidelity Data Entry: Comprehensive forms for financial, strategic, and operational metrics.
 * - Meta-Generation: Integrated 'Signal Summary' generation for platform SEO.
 * 
 * @component
 */
export default function EditIdeaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category_id: '',
        short_description: '',
        full_description: '',
        reality_check: '',
        initial_investment_min: 0,
        initial_investment_max: 0,
        monthly_income_min: 0,
        monthly_income_max: 0,
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
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch categories
            const { data: catData } = await supabase.from('categories').select('*');
            if (catData) setCategories(catData);

            // Fetch idea
            const { data: idea, error: fetchError } = await supabase
                .from('income_ideas')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) {
                setError('Failed to load idea data');
            } else if (!profile?.is_admin && idea.author_id !== user.id) {
                setError('You do not have permission to edit this idea');
            } else {
                setFormData({
                    ...idea,
                    skills_required: idea.skills_required?.join(', ') || ''
                });
            }
            setLoading(false);
        };

        if (user && id) fetchData();
    }, [user, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        setFormData(prev => {
            const updates = { title, slug };
            // Auto-generate meta title if currently empty
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

            // Clean formatting for SEO snippet
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const skillsArray = formData.skills_required.split(',').map(s => s.trim()).filter(Boolean);

            const query = supabase
                .from('income_ideas')
                .update({
                    title: formData.title,
                    slug: formData.slug,
                    category_id: formData.category_id,
                    short_description: formData.short_description,
                    full_description: formData.full_description,
                    reality_check: formData.reality_check,
                    initial_investment_min: Number(formData.initial_investment_min),
                    initial_investment_max: Number(formData.initial_investment_max),
                    monthly_income_min: Number(formData.monthly_income_min),
                    monthly_income_max: Number(formData.monthly_income_max),
                    time_to_first_income_days: Number(formData.time_to_first_income_days),
                    effort_level: formData.effort_level,
                    risk_level: formData.risk_level,
                    success_rate_percentage: Number(formData.success_rate_percentage),
                    time_commitment_hours_per_week: Number(formData.time_commitment_hours_per_week),
                    skills_required: skillsArray,
                    is_premium: formData.is_premium,
                    is_featured: formData.is_featured,
                    is_india_specific: formData.is_india_specific,
                    meta_title: formData.meta_title,
                    meta_description: formData.meta_description,
                    image_url: formData.image_url,
                    updated_at: new Date()
                })
                .eq('id', id);

            if (!profile?.is_admin) {
                query.eq('author_id', user.id);
            }

            const { error: updateError } = await query;

            if (updateError) throw updateError;
            navigate('/my-ideas');
        } catch (err) {
            console.error('Error updating idea:', err);
            setError(err.message || 'Failed to update idea');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-sage-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <SEO title={`Modify ${formData.title || 'Blueprint'}`} />
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <BackButton label="Return to Command Base" className="mb-4" />
                        <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 tracking-tighter">
                            Modify <span className="text-primary-600">Asset Parameters</span>
                        </h1>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake mb-8">
                        <span>🚫</span> {error}
                    </div>
                )}

                {!error && (
                    <form onSubmit={handleSubmit} className="card border-none shadow-2xl p-10 space-y-12 bg-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 to-indigo-600" />

                        {/* Basic Info */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-primary-600">
                                <span className="text-xl">📁</span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Core Logic</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Strategic Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Blueprint Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        readOnly
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl text-sm font-mono text-charcoal-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Sector Classification</label>
                                <select
                                    name="category_id"
                                    required
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all appearance-none"
                                >
                                    <option value="">Select Category Matrix</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Brief Intelligence Summary</label>
                                <textarea
                                    name="short_description"
                                    required
                                    rows={2}
                                    value={formData.short_description}
                                    onChange={handleShortDescChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-medium text-charcoal-700 transition-all"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Brand Visual (Image URL)</label>
                                    <div className="space-y-4">
                                        <input
                                            type="url"
                                            name="image_url"
                                            placeholder="https://images.unsplash.com/..."
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-medium text-charcoal-700 transition-all"
                                        />
                                        <div className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest text-center px-4">
                                            — OR —
                                        </div>
                                        <ImageUpload
                                            label="Institutional Upload"
                                            onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                            currentUrl={formData.image_url}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Operational Preview</label>
                                    <div className="aspect-video bg-charcoal-50 rounded-3xl border border-charcoal-100 overflow-hidden relative group shadow-inner">
                                        {formData.image_url ? (
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-charcoal-400 text-[8px] font-black uppercase tracking-widest text-center px-4">
                                                <span>🖼️ System Ready</span>
                                                <span className="mt-1 opacity-50">Visual Asset Required</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-primary-600">
                                <span className="text-xl">🌋</span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Deep Intelligence</h2>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1 pr-1">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Operational Guide (Markdown)</label>
                                    <div className="text-[8px] font-bold text-primary-600/60 uppercase tracking-widest">
                                        **bold** • - list • {">"} quote • # header
                                    </div>
                                </div>
                                <textarea
                                    name="full_description"
                                    required
                                    rows={10}
                                    value={formData.full_description}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-medium text-charcoal-700 transition-all min-h-[250px] research-editor resize-y"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Reality Protocol</label>
                                <textarea
                                    name="reality_check"
                                    required
                                    rows={3}
                                    value={formData.reality_check}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none font-medium text-amber-900 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-primary-600">
                                <span className="text-xl">📈</span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Profitability Matrix</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Capital Floor (₹)</label>
                                            <input
                                                type="number"
                                                name="initial_investment_min"
                                                value={formData.initial_investment_min}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-black text-charcoal-950 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Capital Ceiling (₹)</label>
                                            <input
                                                type="number"
                                                name="initial_investment_max"
                                                value={formData.initial_investment_max}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-black text-charcoal-950 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Monthly Yield Floor (₹)</label>
                                            <input
                                                type="number"
                                                name="monthly_income_min"
                                                value={formData.monthly_income_min}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-black text-emerald-700 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Monthly Yield Ceiling (₹)</label>
                                            <input
                                                type="number"
                                                name="monthly_income_max"
                                                value={formData.monthly_income_max}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-black text-emerald-700 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Risk Profile</label>
                                            <select
                                                name="risk_level"
                                                value={formData.risk_level}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold text-charcoal-900 transition-all appearance-none"
                                            >
                                                <option value="low">Low Risk</option>
                                                <option value="medium">Medium Risk</option>
                                                <option value="high">High Risk</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Deployment Effort</label>
                                            <select
                                                name="effort_level"
                                                value={formData.effort_level}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold text-charcoal-900 transition-all appearance-none"
                                            >
                                                <option value="passive">Autonomous (Passive)</option>
                                                <option value="semi-passive">Monitoring (Semi-Passive)</option>
                                                <option value="active">Operational (Active)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Success Rate (%)</label>
                                        <input
                                            type="number"
                                            name="success_rate_percentage"
                                            value={formData.success_rate_percentage}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-black text-charcoal-950 transition-all"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Days to First Income</label>
                                    <input
                                        type="number"
                                        name="time_to_first_income_days"
                                        value={formData.time_to_first_income_days}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-black text-charcoal-950 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Time Commitment (Hrs/Week)</label>
                                    <input
                                        type="number"
                                        name="time_commitment_hours_per_week"
                                        value={formData.time_commitment_hours_per_week}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-black text-charcoal-950 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Required Expertise (Comma Separated)</label>
                                <input
                                    type="text"
                                    name="skills_required"
                                    value={formData.skills_required}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none font-bold text-charcoal-900 transition-all"
                                    placeholder="e.g. Digital Marketing, Basic Spreadsheet Skills"
                                />
                            </div>
                        </div>

                        {/* Flags and Targeting */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-primary-600">
                                <span className="text-xl">🌐</span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Deployment Controls</h2>
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

                                {profile?.is_admin && (
                                    <>
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
                                        <label className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 cursor-pointer hover:bg-white hover:shadow-lg transition-all">
                                            <input
                                                type="checkbox"
                                                name="is_featured"
                                                checked={formData.is_featured}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                                className="w-5 h-5 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-500 bg-white"
                                            />
                                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Featured Asset</span>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SEO Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-primary-600">
                                <span className="text-xl">🔍</span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Signal Presence (SEO)</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Meta Title (Signal Header)</label>
                                    <input
                                        type="text"
                                        name="meta_title"
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all"
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
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-medium text-charcoal-700 transition-all"
                                        placeholder="Executive summary for search engine snippet..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-10">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-6 bg-charcoal-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-emerald-600 transition-all shadow-2xl shadow-charcoal-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className="relative z-10">{saving ? 'Syncing Matrix...' : '💾 Update Asset Blueprint'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
