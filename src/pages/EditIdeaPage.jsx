import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

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
        <div className="min-h-screen bg-cream-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="text-charcoal-400 hover:text-charcoal-900">← Back</button>
                    <h1 className="text-3xl font-bold text-charcoal-900">Edit Income Idea</h1>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

                {!error && (
                    <form onSubmit={handleSubmit} className="card space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-charcoal-800 border-b border-charcoal-100 pb-2">Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Title</label>
                                    <input type="text" name="title" required value={formData.title} onChange={handleTitleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Slug (Auto)</label>
                                    <input type="text" value={formData.slug} readOnly className="w-full px-3 py-2 border border-charcoal-200 rounded-lg bg-charcoal-50 text-charcoal-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Category</label>
                                <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg bg-white">
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Short Description</label>
                                <textarea name="short_description" required rows={2} value={formData.short_description} onChange={handleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-charcoal-800 border-b border-charcoal-100 pb-2">Deep Dive</h2>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Full Guide (Markdown)</label>
                                <textarea name="full_description" required rows={8} value={formData.full_description} onChange={handleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg font-mono text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">⚠️ Reality Check</label>
                                <textarea name="reality_check" required rows={3} value={formData.reality_check} onChange={handleChange} className="w-full px-3 py-2 border border-yellow-200 bg-yellow-50 rounded-lg" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-charcoal-800 border-b border-charcoal-100 pb-2">Financials (INR)</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Min Investment (₹)</label>
                                    <input type="number" name="initial_investment_min" value={formData.initial_investment_min} onChange={handleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Max Investment (₹)</label>
                                    <input type="number" name="initial_investment_max" value={formData.initial_investment_max} onChange={handleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Min Monthly Income (₹)</label>
                                    <input type="number" name="monthly_income_min" value={formData.monthly_income_min} onChange={handleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Max Monthly Income (₹)</label>
                                    <input type="number" name="monthly_income_max" value={formData.monthly_income_max} onChange={handleChange} className="w-full px-3 py-2 border border-charcoal-200 rounded-lg" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" disabled={saving} className="w-full btn-primary flex justify-center items-center gap-2 py-3">
                                {saving ? 'Saving Changes...' : '💾 Update Idea'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
