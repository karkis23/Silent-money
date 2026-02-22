import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ImageUpload from '../components/ImageUpload';
import { motion } from 'framer-motion';

/**
 * EditFranchisePage: A refined editor for managing franchise profiles.
 * 
 * DESIGN SPECIFICATIONS:
 * - Secure Lifecycle Management: Prevents unauthorized modification via strict profile and ownership gates.
 * - Enhanced Data Fidelity: Manages operational metrics (Investment, ROI, Scale).
 * - Multi-Channel SEO: Integrated system for updating brand presence and search visibility.
 * - Media Synchronization: Handles updates to brand imagery and logos.
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
                // SECURE SEO SYNCHRONIZATION:
                // Auto-detect and pre-fill meta tags if missing in the database to ensure search parity.
                const cleanDesc = (data.description || '')
                    .replace(/[#*`~_]/g, '')
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                    .replace(/\n+/g, ' ')
                    .trim();

                setFormData({
                    ...data,
                    investment_min: data.investment_min.toString(),
                    investment_max: data.investment_max?.toString() || '',
                    roi_months_min: data.roi_months_min?.toString() || '',
                    roi_months_max: data.roi_months_max?.toString() || '',
                    space_required_sqft: data.space_required_sqft?.toString() || '',
                    expected_profit_min: data.expected_profit_min?.toString() || '',
                    expected_profit_max: data.expected_profit_max?.toString() || '',
                    meta_title: data.meta_title || (data.name ? `${data.name} | Silent Money` : ''),
                    meta_description: data.meta_description || cleanDesc.substring(0, 160),
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FDFCF9] py-12 pt-32"
        >
            <SEO title={`Edit ${formData.name || 'Franchise'}`} />
            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <BackButton label="Back to Dashboard" className="mb-8" />
                        <h1 className="text-5xl md:text-6xl font-black text-charcoal-950 mb-4 tracking-tightest leading-tight">
                            Edit <span className="text-primary-600">Details.</span>
                        </h1>
                        <p className="text-charcoal-500 font-medium text-lg">
                            Update your franchise details and market positioning.
                        </p>
                    </motion.div>
                </header>

                <div className="bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.05)] border border-charcoal-100/50 p-8 md:p-12 space-y-16 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 via-indigo-500 to-primary-600" />

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm flex items-center gap-3">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-16">
                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shadow-inner">
                                    🏢
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black text-charcoal-900 uppercase tracking-[0.3em]">Brand Identity</h2>
                                    <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">Core Business Information</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Brand Name</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900"
                                        placeholder="Enter franchise name..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900 appearance-none"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner">
                                    💰
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black text-charcoal-900 uppercase tracking-[0.3em]">Economics</h2>
                                    <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">Financial Requirements & Projections</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Min Investment (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        name="investment_min"
                                        value={formData.investment_min}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-charcoal-900"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Max Investment (₹)</label>
                                    <input
                                        type="number"
                                        name="investment_max"
                                        value={formData.investment_max}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-charcoal-900"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">ROI (Months)</label>
                                    <input
                                        type="number"
                                        name="roi_months_min"
                                        value={formData.roi_months_min}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-charcoal-900"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Expected Profit / Mo (₹)</label>
                                    <input
                                        type="number"
                                        name="expected_profit_min"
                                        value={formData.expected_profit_min}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-charcoal-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Space Required (sq.ft)</label>
                                <input
                                    type="number"
                                    name="space_required_sqft"
                                    value={formData.space_required_sqft}
                                    onChange={handleChange}
                                    className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-charcoal-900"
                                    placeholder="e.g. 500"
                                />
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner">
                                    📸
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black text-charcoal-900 uppercase tracking-[0.3em]">Visual Assets</h2>
                                    <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">Brand Imagery & Banner</p>
                                </div>
                            </div>
                            <div className="bg-charcoal-50/30 p-8 rounded-[2rem] border border-charcoal-100/50">
                                <ImageUpload
                                    label="Upload Banner Image"
                                    currentUrl={formData.image_url}
                                    onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                    bucket="franchises"
                                />
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
                                    📊
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black text-charcoal-900 uppercase tracking-[0.3em]">Business Analysis</h2>
                                    <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">Operational Metrics & Quality</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Unit Model</label>
                                    <input name="unit_model" value={formData.unit_model} onChange={handleChange} className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900" placeholder="e.g. FOCO / FOFO" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Market Maturity</label>
                                    <input name="market_maturity" value={formData.market_maturity} onChange={handleChange} className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900" placeholder="e.g. High - National" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Corporate Support</label>
                                    <input name="corporate_support" value={formData.corporate_support} onChange={handleChange} className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900" placeholder="e.g. Full Training" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Retention (%)</label>
                                    <input type="number" name="operator_retention" value={formData.operator_retention} onChange={handleChange} className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900" max="100" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Density (%)</label>
                                    <input type="number" name="network_density" value={formData.network_density} onChange={handleChange} className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900" max="100" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Asset Grade</label>
                                    <select name="asset_grade" value={formData.asset_grade} onChange={handleChange} className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900 appearance-none">
                                        <option value="AAA+">AAA+</option>
                                        <option value="AA">AA</option>
                                        <option value="A">A</option>
                                        <option value="B+">B+</option>
                                        <option value="B">B</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Risk Profile</label>
                                    <select name="risk_profile" value={formData.risk_profile} onChange={handleChange} className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none transition-all font-bold text-charcoal-900 appearance-none">
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

                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-inner">
                                    🔍
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black text-charcoal-900 uppercase tracking-[0.3em]">Search Optimization</h2>
                                    <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-widest mt-1">SEO Title & Meta Descriptions</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="meta_title"
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none font-bold text-charcoal-900 transition-all"
                                        placeholder="Strategic title for search engines..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">Meta Description</label>
                                    <textarea
                                        name="meta_description"
                                        rows={2}
                                        value={formData.meta_description}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-charcoal-50/50 border border-charcoal-100 rounded-[1.5rem] focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 focus:bg-white outline-none font-medium text-charcoal-700 transition-all resize-none"
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

                        <div className="flex gap-6">
                            <button
                                type="button"
                                onClick={() => navigate('/my-ideas')}
                                className="flex-1 px-8 py-5 rounded-[1.5rem] border border-charcoal-100 text-charcoal-600 font-bold hover:bg-charcoal-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateLoading}
                                className="flex-[2] py-5 bg-charcoal-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-primary-600 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] disabled:opacity-50 group relative overflow-hidden"
                            >
                                <span className="relative z-10">{updateLoading ? 'Saving...' : 'Save Changes'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
