import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import ROICalculator from '../components/ROICalculator';
import ReviewsSection from '../components/ReviewsSection';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';
import AssetAuditTrail from '../components/AssetAuditTrail';
import ErrorBoundary from '../components/ErrorBoundary';
import ExpertAuditModal from '../components/ExpertAuditModal';
import DetailHero from '../components/details/DetailHero';
import DetailMetrics from '../components/details/DetailMetrics';
import ContactModal from '../components/ContactModal';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

/**
 * FranchiseDetailPage: The technical "Asset Dossier" for a specific franchise partnership.
 * 
 * CORE COMPONENTS:
 * - Institutional Hero: Displays high-fidelity asset branding and validation states.
 * - Intelligence Signal HUB: Visualizes key performance indicators (ROI, Profit, Investment).
 * - ROI Forecasting: Integrated calculator for user-specific financial projections.
 * - Expert Audit Trail: Detailed vetting history and validation metrics.
 * - Institutional Trust: Community reviews and brand connectivity (website/contact).
 * 
 * @component
 */
export default function FranchiseDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [franchise, setFranchise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasPendingAudit, setHasPendingAudit] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    useEffect(() => {
        const fetchFranchise = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('franchises')
                .select(`
                    *,
                    profiles (id, full_name, avatar_url)
                `)
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Error fetching franchise:', error);
                setError('Franchise opportunity not found.');
            } else {
                setFranchise(data);
            }
            setLoading(false);
        };

        fetchFranchise();
    }, [slug]);

    useEffect(() => {
        const checkSaveStatus = async () => {
            if (!user || !franchise) return;
            const { data } = await supabase
                .from('user_saved_franchises')
                .select('*')
                .eq('user_id', user.id)
                .eq('franchise_id', franchise.id)
                .maybeSingle();

            if (data) setIsSaved(true);
        };
        checkSaveStatus();
    }, [user, franchise]);

    useEffect(() => {
        const checkAuditStatus = async () => {
            if (!user || !franchise) return;
            const { data } = await supabase
                .from('expert_audit_requests')
                .select('*')
                .eq('user_id', user.id)
                .eq('brand_name', franchise.name)
                .eq('status', 'pending')
                .maybeSingle();

            if (data) setHasPendingAudit(true);
        };
        checkAuditStatus();
    }, [user, franchise]);

    const handleToggleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isSaved) {
            const { error } = await supabase
                .from('user_saved_franchises')
                .delete()
                .eq('user_id', user.id)
                .eq('franchise_id', franchise.id);

            if (!error) {
                setIsSaved(false);
                toast.success('Asset removed from Vault');
            } else {
                toast.error('Failed to update Vault status');
            }
        } else {
            const { error } = await supabase
                .from('user_saved_franchises')
                .insert([{ user_id: user.id, franchise_id: franchise.id, status: 'Interested' }]);

            if (!error) {
                setIsSaved(true);
                toast.success('Asset secured in Vault');
            } else {
                toast.error('Failed to secure asset');
            }
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
        if (amount >= 100000) return `₹${Math.floor(amount / 100000)} Lakh`;
        if (amount >= 1000) return `₹${Math.floor(amount / 1000)}k`;
        return `₹${amount}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !franchise) return (
        <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="text-6xl mb-6">🏢</div>
            <h1 className="text-3xl font-black text-charcoal-950 mb-4">{error}</h1>
            <Link to="/franchise" className="btn-primary">Back to Expansion Feed</Link>
        </div>
    );

    const franchiseMetrics = [
        { label: 'Minimum Investment', value: formatCurrency(franchise.investment_min) },
        { label: 'Estimated Payback', value: `${franchise.roi_months_min}-${franchise.roi_months_max} Months`, variant: 'success' },
        { label: 'Space Required', value: franchise.space_required_sqft ? `${franchise.space_required_sqft} sq.ft` : 'Flexible', unit: 'MINIMUM' },
        { label: 'Projected Profit', value: formatCurrency(franchise.expected_profit_min), unit: '/mo', variant: 'primary', highlight: true }
    ];

    const heroStats = [
        { label: 'Tier Status', value: 'PREMIUM' },
        { label: 'Verification', value: franchise.is_verified ? 'OFFICIAL' : 'PENDING' },
        { label: 'Market Sync', value: franchise.last_verified_at ? new Date(franchise.last_verified_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Feb 2026' }
    ];

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": franchise.name,
        "description": franchise.description,
        "category": franchise.category,
        "brand": {
            "@type": "Brand",
            "name": "Silent Money"
        },
        "offers": {
            "@type": "Offer",
            "price": franchise.investment_min,
            "priceCurrency": "INR"
        }
    };

    const heroActions = (
        <>
            <button
                onClick={handleToggleSave}
                className={`h-14 px-8 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 w-full sm:w-auto min-w-[190px] shrink-0 group border shadow-2xl relative overflow-hidden ${isSaved
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                    : 'bg-charcoal-950 text-white border-charcoal-800 hover:bg-primary-600 shadow-charcoal-900/40'
                    }`}
            >
                <div className="relative z-10 flex items-center gap-3">
                    {isSaved ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l4.59-4.59L17 10.5 11 16.5z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                    )}
                    <span className="whitespace-nowrap font-black tracking-[0.25em]">{isSaved ? 'VAULT SECURED' : 'TRACK ASSET'}</span>
                </div>
            </button>

            <div className="w-px h-8 bg-charcoal-100 shrink-0 hidden sm:block" />

        </>
    );

    return (
        <div className="min-h-screen bg-cream-50 pb-6 md:pb-20 pt-20 transition-all duration-300">
            <SEO
                title={franchise.meta_title || `${franchise.name} Franchise Opportunity`}
                description={franchise.meta_description || franchise.description}
                schemaData={schemaData}
            />


            <DetailHero
                title={franchise.name}
                category="franchise"
                shortDescription={franchise.description.split('.')[0] + '.'}
                imageUrl={franchise.image_url}
                profiles={franchise.profiles}
                isVerified={franchise.is_verified}
                backLabel="Back to Discovery"
                actions={heroActions}
                stats={heroStats}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* 1. INSTITUTIONAL FINANCIAL HUB (Optimized Layout) */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16 items-start">
                    <div className="space-y-12">
                        <DetailMetrics metrics={franchiseMetrics} />

                        {/* Market Outlook - Moved up into Financial Hub column to balance layout */}
                        <div className="bg-charcoal-950 rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-charcoal-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[80px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                Market Outlook
                            </h3>
                            <p className="text-lg font-medium text-white/90 leading-relaxed mb-8 relative z-10 pr-4">
                                Sector demand for <span className="text-primary-400 font-bold">{franchise.category}</span> is projected to grow by <span className="text-emerald-400">12% YoY</span>. Historical ROI in Tier-1 cities remains consistent with <span className="text-white font-bold">standard growth models</span>.
                            </p>
                            <div className="grid grid-cols-2 gap-4 sm:gap-8 relative z-10 border-t border-white/5 pt-8">
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Market Strength</div>
                                    <div className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                        Tier 1 Elite <span className="text-xs">🏆</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Verification Status</div>
                                    <div className="text-xl font-black text-emerald-500 tracking-tight">Verified Brand</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:pt-[72px]"> {/* Align with metrics cards below the heading */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <ErrorBoundary compact>
                                <ROICalculator
                                    assetId={franchise.id}
                                    assetType="franchise"
                                    initialDefaults={{
                                        investment: franchise.investment_min,
                                        income: franchise.expected_profit_min,
                                        expenses: 0
                                    }}
                                />
                            </ErrorBoundary>
                        </motion.div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* 2. STRATEGIC SIGNALS & CONTENT */}
                    <div className="space-y-12">
                        {/* Core Identity */}
                        <div className={`bg-white rounded-[3rem] p-6 md:p-12 border border-charcoal-100 shadow-xl relative transition-all duration-700 ${isExpanded ? '' : 'max-h-[600px] overflow-hidden'}`}>
                            <h3 className="text-[11px] font-black text-charcoal-300 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                🛸 Core Identity
                            </h3>

                            <div className="space-y-8 mb-12 border-b border-charcoal-50 pb-12">
                                <div className="text-2xl font-black text-charcoal-950 tracking-tighter uppercase italic">1. Core Identity</div>
                                <div className="grid gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest">Brand Name</span>
                                        <span className="text-xl font-black text-charcoal-900 uppercase tracking-tight">{franchise.name}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest">Industry Classification</span>
                                        <span className="text-xl font-black text-charcoal-900 uppercase tracking-tight">{franchise.category}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest">Expansion Protocol</span>
                                        <span className="text-xl font-black text-primary-600 uppercase tracking-tight">{franchise.unit_model || 'FOCO / FOFO Configuration'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest">Target Deployment</span>
                                        <span className="text-lg font-bold text-charcoal-600 italic">"Tier 1 & Tier 2 Hubs (PAN India)"</span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-charcoal max-w-none prose-headings:font-black prose-headings:text-charcoal-900 prose-p:text-charcoal-600 prose-strong:text-charcoal-900 whitespace-pre-wrap text-lg leading-relaxed">
                                <ReactMarkdown>{franchise.description}</ReactMarkdown>
                            </div>

                            {!isExpanded && (
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
                            )}
                        </div>

                        <div className="flex justify-center -mt-6 relative z-10">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="bg-charcoal-950 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-600 transition-all flex items-center gap-3 group"
                            >
                                {isExpanded ? 'Collapse Architecture' : 'Read Full Blueprint'}
                                <span className={`text-lg transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-1'}`}>↓</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {franchise.website_url ? (
                                <a
                                    href={franchise.website_url.startsWith('http') ? franchise.website_url : `https://${franchise.website_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-charcoal-50 p-6 md:p-8 rounded-[2rem] text-center border border-charcoal-100 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all group flex flex-col items-center justify-center gap-1"
                                >
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em] group-hover:text-primary-600 transition-colors">Website</div>
                                    <div className="text-[8px] font-bold text-charcoal-300 truncate max-w-full italic">{new URL(franchise.website_url.startsWith('http') ? franchise.website_url : `https://${franchise.website_url}`).hostname}</div>
                                </a>
                            ) : (
                                <div className="bg-charcoal-50/50 p-6 md:p-8 rounded-[2rem] text-center border border-charcoal-50 cursor-not-allowed opacity-50">
                                    <div className="text-[10px] font-black text-charcoal-300 uppercase tracking-[0.3em]">No Website</div>
                                </div>
                            )}

                            {franchise.contact_email || franchise.contact_phone ? (
                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="bg-charcoal-50 p-6 md:p-8 rounded-[2rem] text-center border border-charcoal-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all group flex flex-col items-center justify-center gap-1"
                                >
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em] group-hover:text-emerald-600 transition-colors">Contact</div>
                                    <div className="text-[8px] font-bold text-charcoal-300 truncate max-w-full italic">Reveal Details</div>
                                </button>
                            ) : (
                                <div className="bg-charcoal-50/50 p-6 md:p-8 rounded-[2rem] text-center border border-charcoal-50 cursor-not-allowed opacity-50">
                                    <div className="text-[10px] font-black text-charcoal-300 uppercase tracking-[0.3em]">No Contact</div>
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <ErrorBoundary compact>
                                <ReviewsSection assetId={franchise.id} assetType="franchise" authorId={franchise.author_id} user={user} />
                            </ErrorBoundary>
                        </motion.div>
                    </div>

                    {/* Content & Logistics */}
                    <div className="space-y-8">
                        {/* Business Analysis Card */}
                        <div className="bg-white rounded-[3rem] p-6 md:p-10 border border-charcoal-100 shadow-xl space-y-8">
                            <h3 className="text-[11px] font-black text-charcoal-300 uppercase tracking-[0.4em] flex items-center gap-3">
                                📊 Business Analysis
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Unit Model</span>
                                    <span className="text-sm font-bold text-charcoal-900">{franchise.unit_model || 'FOCO / FOFO'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Market Maturity</span>
                                    <span className="text-sm font-bold text-charcoal-900">{franchise.market_maturity || 'National Leader'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Network Density</span>
                                    <span className="text-sm font-bold text-emerald-600">{franchise.network_density || 'High Traffic'}%</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Risk Profile</span>
                                    <span className="text-sm font-bold text-blue-600">{franchise.risk_level || franchise.risk_profile || 'Low Risk'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Retention Rate</span>
                                    <span className="text-sm font-bold text-emerald-600">{franchise.operator_retention || '95'}%</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Asset Grade</span>
                                    <span className="text-sm font-bold text-primary-600">{franchise.asset_grade || 'AAA+'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Operational Logistics Card */}
                        <div className="bg-white rounded-[3rem] p-6 md:p-10 border border-charcoal-100 shadow-xl space-y-8">
                            <h3 className="text-[11px] font-black text-charcoal-300 uppercase tracking-[0.4em] flex items-center gap-3">
                                ⚙️ Operational Logistics
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Supply Chain</span>
                                    <span className="text-sm font-bold text-charcoal-800 leading-relaxed block">{franchise.supply_chain || 'Centralized Procurement Systems'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Staffing Model</span>
                                    <span className="text-sm font-bold text-charcoal-800 leading-relaxed block">{franchise.staffing_model || 'Certified Modular Teams'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Tech Stack</span>
                                    <span className="text-sm font-bold text-charcoal-800 leading-relaxed block">{franchise.tech_stack || 'Integrated CRM & Inventory ERP'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-charcoal-300 uppercase tracking-widest block">Support Ecosystem</span>
                                    <span className="text-sm font-bold text-charcoal-800 leading-relaxed block">{franchise.marketing_support || franchise.corporate_support || 'Full Marketing & Operational Guardrails'}</span>
                                </div>
                            </div>
                        </div>

                        <AssetAuditTrail assetId={franchise.id} assetType="franchise" />

                        {!user && (
                            <div className="bg-primary-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                                <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Login for Full Access</h3>
                                <p className="text-xs font-medium text-white/80 leading-relaxed mb-6">Create an account to track this brand, save financial projections, and contribute to official reviews.</p>
                                <Link to="/signup" className="inline-flex h-12 px-8 bg-white text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest items-center hover:bg-cream-50 transition-all">
                                    Secure Full Access
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                brandName={franchise.name}
                email={franchise.contact_email}
                phone={franchise.contact_phone}
            />

            <ExpertAuditModal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                prefillBrand={franchise.name}
                prefillSector={franchise.category}
            />
        </div>
    );
}
