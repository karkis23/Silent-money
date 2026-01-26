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
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-charcoal-400 hover:text-primary-600 transition-colors mb-8"
                    >
                        <span className="w-8 h-8 rounded-full bg-white border border-charcoal-100 flex items-center justify-center group-hover:border-primary-100 group-hover:bg-primary-50 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </span>
                        Back to Command Center
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 mb-4 tracking-tighter">
                        Forge New <span className="text-primary-600">Income Blueprint</span>
                    </h1>
                    <p className="text-lg text-charcoal-600 font-medium max-w-2xl">
                        Deploy your unique wealth-generation strategy to the community grid. High-quality intel fuels the matrix.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card border-none shadow-2xl p-10 space-y-12 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 to-primary-400" />

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                            <span>🚫</span> {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 text-primary-600">
                            <span className="text-xl">📁</span>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Foundation</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Strategic Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all"
                                    placeholder="e.g. Dividend Investing"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Blueprint Slug (Internal)</label>
                                <input
                                    type="text"
                                    name="slug"
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
                                placeholder="A 2-line summary that commands attention..."
                            />
                        </div>
                    </div>

                    {/* Details */}
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
                                placeholder="Explain the mechanics of this wealth engine..."
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
                                placeholder="Be brutally honest about the risks..."
                            />
                        </div>
                    </div>

                    {/* Numbers */}
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

                        <div className="grid md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Days to First Yield</label>
                                <input
                                    type="number"
                                    name="time_to_first_income_days"
                                    value={formData.time_to_first_income_days}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-black text-charcoal-950 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Success Probability (%)</label>
                                <input
                                    type="number"
                                    name="success_rate_percentage"
                                    value={formData.success_rate_percentage}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-black text-charcoal-950 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 text-primary-600">
                            <span className="text-xl">🛡️</span>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Vitals</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Risk Profile</label>
                                <select
                                    name="risk_level"
                                    value={formData.risk_level}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all appearance-none"
                                >
                                    <option value="low">Low Risk</option>
                                    <option value="medium">Medium Risk</option>
                                    <option value="high">High Risk</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Engagement Scale</label>
                                <select
                                    name="effort_level"
                                    value={formData.effort_level}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all appearance-none"
                                >
                                    <option value="passive">Autonomous (Passive)</option>
                                    <option value="semi-passive">Maintenance (Semi-Passive)</option>
                                    <option value="active">Active Deployment (Hustle)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Required Expertise (Comma Separated)</label>
                            <input
                                type="text"
                                name="skills_required"
                                value={formData.skills_required}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all"
                                placeholder="e.g. Sales, Technical Writing, Cloud Ops"
                            />
                        </div>
                    </div>

                    <div className="pt-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-charcoal-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-primary-600 transition-all shadow-2xl shadow-charcoal-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10">{loading ? 'Transmitting Data...' : '🚀 Deploy Blueprint'}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
