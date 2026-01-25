import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function PostFranchisePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

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
            author_id: user.id
        }]);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/franchise');
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 py-12 pt-32">
            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-charcoal-950 mb-4 tracking-tighter">
                        List Your <span className="text-primary-600">Franchise</span>
                    </h1>
                    <p className="text-charcoal-500 font-medium">
                        Share a proven business model with the community and find partners.
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
                                    placeholder="e.g. Burger King India"
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
                                    placeholder="e.g. 500000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Max Investment (₹)</label>
                                <input
                                    required
                                    type="number"
                                    name="investment_max"
                                    value={formData.investment_max}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                    placeholder="e.g. 1500000"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">ROI (Min Months)</label>
                                <input
                                    required
                                    type="number"
                                    name="roi_months_min"
                                    value={formData.roi_months_min}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                    placeholder="e.g. 12"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Expected Profit / Mo (₹)</label>
                                <input
                                    required
                                    type="number"
                                    name="expected_profit_min"
                                    value={formData.expected_profit_min}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                    placeholder="e.g. 100000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Space Required (sq.ft)</label>
                            <input
                                required
                                type="number"
                                name="space_required_sqft"
                                value={formData.space_required_sqft}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                placeholder="e.g. 500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">High Resolution Image URL</label>
                            <input
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                                placeholder="https://unsplash.com/..."
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
                                placeholder="Include information about brand support, historical performance, and setup process..."
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
                                    placeholder="https://brand-franchise.com"
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
                                        placeholder="franchise@brand.com"
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
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-5 text-lg shadow-2xl shadow-primary-200"
                        >
                            {loading ? 'Processing deployment...' : 'Deploy Franchise Opportunity'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
