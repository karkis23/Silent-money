import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';

export default function EditFranchisePage() {
    const { id } = useParams();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
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
    });

    const categories = [
        'Food & Beverage',
        'Retail',
        'Healthcare',
        'Logistics',
        'Education',
        'Automotive',
        'Service'
    ];

    useEffect(() => {
        const fetchFranchise = async () => {
            const { data, error } = await supabase
                .from('franchises')
                .select('*')
                .eq('id', id)
                .single();

            if (error || (!profile?.is_admin && data.author_id !== user.id)) {
                setError('Could not find franchise or permission denied.');
                setLoading(false);
            } else {
                setFormData({
                    name: data.name,
                    category: data.category,
                    investment_min: data.investment_min.toString(),
                    investment_max: data.investment_max?.toString() || '',
                    roi_months_min: data.roi_months_min?.toString() || '',
                    roi_months_max: data.roi_months_max?.toString() || '',
                    space_required_sqft: data.space_required_sqft?.toString() || '',
                    expected_profit_min: data.expected_profit_min?.toString() || '',
                    expected_profit_max: data.expected_profit_max?.toString() || '',
                    description: data.description,
                    image_url: data.image_url || '',
                    website_url: data.website_url || '',
                    contact_email: data.contact_email || '',
                    contact_phone: data.contact_phone || '',
                });
                setLoading(false);
            }
        };

        if (user && id) fetchFranchise();
    }, [user, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setError('');

        const query = supabase
            .from('franchises')
            .update({
                ...formData,
                investment_min: parseInt(formData.investment_min),
                investment_max: formData.investment_max ? parseInt(formData.investment_max) : null,
                roi_months_min: formData.roi_months_min ? parseInt(formData.roi_months_min) : null,
                roi_months_max: formData.roi_months_max ? parseInt(formData.roi_months_max) : null,
                space_required_sqft: formData.space_required_sqft ? parseInt(formData.space_required_sqft) : null,
                expected_profit_min: formData.expected_profit_min ? parseInt(formData.expected_profit_min) : null,
                expected_profit_max: formData.expected_profit_max ? parseInt(formData.expected_profit_max) : null,
                updated_at: new Date()
            })
            .eq('id', id);

        // Filter by author_id only if not admin
        if (!profile?.is_admin) {
            query.eq('author_id', user.id);
        }

        const { error } = await query;

        if (error) {
            setError(error.message);
            setUpdateLoading(false);
        } else {
            navigate('/my-ideas'); // Go back to assets
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center pt-32">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-cream-50 py-12 pt-32">
            <SEO title={`Configure ${formData.name || 'Franchise'}`} />
            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-12">
                    <BackButton label="Back to Asset Vault" className="mb-8" />
                    <h1 className="text-4xl font-black text-charcoal-950 mb-4 tracking-tighter">
                        Edit <span className="text-primary-600">Configuration</span>
                    </h1>
                    <p className="text-charcoal-500 font-medium">
                        Update your franchise details and market positioning.
                    </p>
                </header>

                <div className="card shadow-2xl border-none">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Brand Name</label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Min Investment (₹)</label>
                                <input
                                    required
                                    type="number"
                                    name="investment_min"
                                    value={formData.investment_min}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Max Investment (₹)</label>
                                <input
                                    type="number"
                                    name="investment_max"
                                    value={formData.investment_max}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">ROI (Min Months)</label>
                                <input
                                    type="number"
                                    name="roi_months_min"
                                    value={formData.roi_months_min}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Expected Profit / Mo (₹)</label>
                                <input
                                    type="number"
                                    name="expected_profit_min"
                                    value={formData.expected_profit_min}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Space Required (sq.ft)</label>
                            <input
                                type="number"
                                name="space_required_sqft"
                                value={formData.space_required_sqft}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Image URL</label>
                            <input
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Detailed Analysis & Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold resize-none"
                            />
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest pl-1 border-l-4 border-primary-600 ml-1">Brand Connectivity</h3>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Official Website URL</label>
                                <input
                                    type="url"
                                    name="website_url"
                                    value={formData.website_url}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Franchise Inquiry Email</label>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={formData.contact_email}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Support Phone Number</label>
                                    <input
                                        type="tel"
                                        name="contact_phone"
                                        value={formData.contact_phone}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/my-ideas')}
                                className="flex-1 btn-secondary py-5 text-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateLoading}
                                className="flex-[2] btn-primary py-5 text-lg shadow-2xl shadow-primary-200"
                            >
                                {updateLoading ? 'Updating System...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
