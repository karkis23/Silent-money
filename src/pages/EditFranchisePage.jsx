import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ImageUpload from '../components/ImageUpload';

/**
 * EditFranchisePage: The authoritative terminal for managing institutional franchise profiles.
 * 
 * DESIGN SPECIFICATIONS:
 * - Secure Lifecycle Management: Prevents unauthorized modification via strict profile and ownership gates.
 * - Enhanced Data Fidelity: Manages secondary operational metrics (Network Density, Asset Grade, Risk Profile).
 * - Multi-Channel SEO: Integrated system for updating brand Connectivity and Intelligence Signals.
 * - Media Synchronization: Handles real-time updates to brand imagery and institutional logos.
 * 
 * @component
 */
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
        meta_title: '',
        meta_description: '',
        slug: '',
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
                    // Enhanced Data Population
                    unit_model: data.unit_model || '',
                    market_maturity: data.market_maturity || '',
                    corporate_support: data.corporate_support || '',
                    operator_retention: data.operator_retention?.toString() || '',
                    network_density: data.network_density?.toString() || '',
                    asset_grade: data.asset_grade || 'A',
                    risk_profile: data.risk_profile || 'Low',
                    supply_chain: data.supply_chain || '',
                    staffing_model: data.staffing_model || '',
                    tech_stack: data.tech_stack || '',
                    marketing_support: data.marketing_support || '',
                    meta_title: data.meta_title || '',
                    meta_description: data.meta_description || '',
                    slug: data.slug,
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

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => {
            const updates = { name };
            // Auto-generate meta title
            if (!prev.meta_title || prev.meta_title === `${prev.name} | Silent Money`) {
                updates.meta_title = `${name} | Silent Money`;
            }
            return { ...prev, ...updates };
        });
    };

    const handleDescriptionChange = (e) => {
        const { value } = e.target;
        setFormData(prev => {
            const updates = { description: value };

            // Intelligence-Led SEO Generation: Strip Markdown & Formatting
            const cleanText = value
                .replace(/[#*`~_]/g, '')              // Strip headers, bold, italics
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip link syntax but keep text
                .replace(/\n+/g, ' ')                 // Replace multiple newlines with single space
                .trim();

            // Auto-generate meta description if currently empty or matches truncated description
            if (!prev.meta_description || prev.meta_description.length < 5 || prev.meta_description === prev.description.substring(0, 160)) {
                updates.meta_description = cleanText.substring(0, 160);
            }
            return { ...prev, ...updates };
        });
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
                // Parse Numbers for Enhanced Fields
                operator_retention: formData.operator_retention ? parseInt(formData.operator_retention) : null,
                network_density: formData.network_density ? parseInt(formData.network_density) : null,
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
            navigate(`/franchise/${formData.slug}`); // Go back to detail page
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
                                    onChange={handleNameChange}
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

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Brand Visual (Banner)</label>
                            <div className="bg-charcoal-50 p-6 rounded-2xl border border-charcoal-100">
                                <ImageUpload
                                    label="Upload Banner Image"
                                    currentUrl={formData.image_url}
                                    onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                    bucket="franchises"
                                />
                            </div>
                        </div>

                        {/* Enhanced Business Intelligence Section */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest pl-1 border-l-4 border-primary-600 ml-1">Business Intelligence</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Unit Model</label>
                                    <input name="unit_model" value={formData.unit_model} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" placeholder="e.g. FOCO / FOFO" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Market Maturity</label>
                                    <input name="market_maturity" value={formData.market_maturity} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" placeholder="e.g. High - National" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Corporate Support</label>
                                    <input name="corporate_support" value={formData.corporate_support} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" placeholder="e.g. Full Training" />
                                </div>
                            </div>
                        </div>

                        {/* Market Strength & Risk Section */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest pl-1 border-l-4 border-emerald-500 ml-1">Market Strength</h3>
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Retention (%)</label>
                                    <input type="number" name="operator_retention" value={formData.operator_retention} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" max="100" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Density (%)</label>
                                    <input type="number" name="network_density" value={formData.network_density} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" max="100" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Asset Grade</label>
                                    <select name="asset_grade" value={formData.asset_grade} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold">
                                        <option value="AAA+">AAA+</option>
                                        <option value="AA">AA</option>
                                        <option value="A">A</option>
                                        <option value="B+">B+</option>
                                        <option value="B">B</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Risk Profile</label>
                                    <select name="risk_profile" value={formData.risk_profile} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Operational Logistics Section */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-charcoal-900 uppercase tracking-widest pl-1 border-l-4 border-amber-500 ml-1">Operational Logistics</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Supply Chain</label>
                                    <input name="supply_chain" value={formData.supply_chain} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" placeholder="e.g. Centralized Procurement" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Staffing Model</label>
                                    <input name="staffing_model" value={formData.staffing_model} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" placeholder="e.g. 4-6 Certified Personnel" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Tech Stack</label>
                                    <input name="tech_stack" value={formData.tech_stack} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" placeholder="e.g. Integrated POS & CRM" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Marketing Support</label>
                                    <input name="marketing_support" value={formData.marketing_support} onChange={handleChange} className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold" placeholder="e.g. National Brand Campaigns" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1 pr-1">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Detailed Analysis & Description</label>
                                <div className="text-[8px] font-bold text-primary-600/60 uppercase tracking-widest">
                                    **bold** • - list • {">"} quote • # header
                                </div>
                            </div>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                rows={10}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all research-editor resize-y"
                                placeholder="Paste your research here..."
                            />
                        </div>

                        {/* SEO Section */}
                        <div className="space-y-6 pt-8 border-t border-charcoal-100">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">🔍</span>
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-charcoal-950">Signal Presence (SEO)</h2>
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
                                        placeholder="Executive summary for search engine snippet..."
                                    />
                                </div>
                            </div>
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
