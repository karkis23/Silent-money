import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';

export default function EditIdeaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
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
        time_to_first_income_days: 30,
        effort_level: 'semi-passive',
        risk_level: 'medium',
        success_rate_percentage: 50,
        skills_required: '',
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
            } else if (idea.author_id !== user.id) {
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
        setFormData(prev => ({ ...prev, title, slug }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const skillsArray = formData.skills_required.split(',').map(s => s.trim()).filter(Boolean);

            const { error: updateError } = await supabase
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
                    success_rate_percentage: Number(formData.success_rate_percentage),
                    skills_required: skillsArray,
                    updated_at: new Date()
                })
                .eq('id', id)
                .eq('author_id', user.id);

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
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-medium text-charcoal-700 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-primary-600">
                                <span className="text-xl">🌋</span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Deep Intelligence</h2>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Operational Guide (Markdown)</label>
                                <textarea
                                    name="full_description"
                                    required
                                    rows={8}
                                    value={formData.full_description}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-medium text-charcoal-700 transition-all min-h-[200px]"
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

                                <div className="space-y-6">
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
