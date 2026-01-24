import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function AddIdeaPage() {
    const navigate = useNavigate();
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
        initial_investment_min: 0,
        initial_investment_max: 0,
        monthly_income_min: 0,
        monthly_income_max: 0,
        time_to_first_income_days: 30,
        effort_level: 'semi-passive',
        risk_level: 'medium',
        success_rate_percentage: 50,
        skills_required: '', // comma separated string for input
    });

    useEffect(() => {
        // Fetch categories for dropdown
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Auto-generate slug from title
    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData(prev => ({
            ...prev,
            title,
            slug
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Process skills from string to array
            const skillsArray = formData.skills_required.split(',').map(s => s.trim()).filter(Boolean);

            const payload = {
                ...formData,
                author_id: (await supabase.auth.getUser()).data.user.id,
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
                .insert([payload]);

            if (insertError) throw insertError;

            navigate('/ideas');
        } catch (err) {
            console.error('Error adding idea:', err);
            setError(err.message || 'Failed to add idea');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-charcoal-900 mb-8">Add New Incame Idea</h1>

                <form onSubmit={handleSubmit} className="card space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-charcoal-800 border-b border-charcoal-100 pb-2">
                            Basic Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                    placeholder="e.g. Dividend Investing"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Slug (Auto)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    readOnly
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg bg-charcoal-50 text-charcoal-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1">Category</label>
                            <select
                                name="category_id"
                                required
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none bg-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1">Short Description</label>
                            <textarea
                                name="short_description"
                                required
                                rows={2}
                                value={formData.short_description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                placeholder="Brief summary for the card view..."
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-charcoal-800 border-b border-charcoal-100 pb-2">
                            Deep Dive
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1">Full Guide (Markdown supported)</label>
                            <textarea
                                name="full_description"
                                required
                                rows={6}
                                value={formData.full_description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none font-mono text-sm"
                                placeholder="Detailed explanation of how it works..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1">⚠️ Reality Check</label>
                            <textarea
                                name="reality_check"
                                required
                                rows={3}
                                value={formData.reality_check}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-yellow-200 bg-yellow-50 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                placeholder="What are the risks? Be honest."
                            />
                        </div>
                    </div>

                    {/* Numbers */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-charcoal-800 border-b border-charcoal-100 pb-2">
                            The Numbers (INR)
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Min Investment (₹)</label>
                                <input
                                    type="number"
                                    name="initial_investment_min"
                                    value={formData.initial_investment_min}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Max Investment (₹)</label>
                                <input
                                    type="number"
                                    name="initial_investment_max"
                                    value={formData.initial_investment_max}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Min Monthly Income (₹)</label>
                                <input
                                    type="number"
                                    name="monthly_income_min"
                                    value={formData.monthly_income_min}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Max Monthly Income (₹)</label>
                                <input
                                    type="number"
                                    name="monthly_income_max"
                                    value={formData.monthly_income_max}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Time to First ₹ (Days)</label>
                                <input
                                    type="number"
                                    name="time_to_first_income_days"
                                    value={formData.time_to_first_income_days}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Success Rate (%)</label>
                                <input
                                    type="number"
                                    name="success_rate_percentage"
                                    value={formData.success_rate_percentage}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-charcoal-800 border-b border-charcoal-100 pb-2">
                            Classification
                        </h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Risk Level</label>
                                <select
                                    name="risk_level"
                                    value={formData.risk_level}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg bg-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Effort Level</label>
                                <select
                                    name="effort_level"
                                    value={formData.effort_level}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg bg-white"
                                >
                                    <option value="passive">Passive (Zero touch)</option>
                                    <option value="semi-passive">Semi-Passive (Maintenance)</option>
                                    <option value="active">Active (Side Hustle)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1">Skills Required (comma separated)</label>
                            <input
                                type="text"
                                name="skills_required"
                                value={formData.skills_required}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none"
                                placeholder="Sales, Writing, Coding..."
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex justify-center items-center gap-2"
                        >
                            {loading ? 'Publishing...' : '🚀 Publish Idea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
