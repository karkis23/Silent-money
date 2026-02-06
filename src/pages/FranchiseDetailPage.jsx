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
import { toast } from 'react-hot-toast';

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
        { label: 'Verification', value: franchise.is_verified ? 'OFFICIAL' : 'PENDING' }
    ];

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

            <button
                onClick={() => setIsAuditModalOpen(true)}
                className="h-14 px-8 bg-white border border-charcoal-100 text-charcoal-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-charcoal-50 hover:border-charcoal-300 transition-all flex items-center justify-center gap-3 w-full sm:w-auto min-w-[180px] shrink-0 group shadow-lg shadow-charcoal-900/5"
            >
                <svg className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="whitespace-nowrap font-black tracking-[0.25em]">REQUEST AUDIT</span>
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-cream-50 pb-6 md:pb-20 pt-20 transition-all duration-300">
            <SEO
                title={franchise.meta_title || `${franchise.name} Franchise Opportunity`}
                description={franchise.meta_description || franchise.description}
            />

            <DetailHero
                title={franchise.name}
                category="franchise"
                shortDescription={franchise.description.split('.')[0] + '.'}
                imageUrl={franchise.image_url}
                profiles={franchise.profiles}
                isVerified={franchise.is_verified}
                backLabel="Back to Expansion Feed"
                actions={heroActions}
                stats={heroStats}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Visuals & Data */}
                    <div className="space-y-8">
                        <DetailMetrics metrics={franchiseMetrics} />

                        {/* Intelligence Signal */}
                        <div className="bg-charcoal-950 rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-charcoal-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[80px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                Intelligence Signal
                            </h3>
                            <p className="text-lg font-medium text-white/90 leading-relaxed mb-8 relative z-10 pr-4">
                                Sector demand for <span className="text-primary-400 font-bold">{franchise.category}</span> is projected to grow by <span className="text-emerald-400">12% YoY</span>. Historical ROI in Tier-1 cities remains consistent with <span className="text-white font-bold">institutional growth models</span>.
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
                                    <div className="text-xl font-black text-emerald-500 tracking-tight">Official HQ</div>
                                </div>
                            </div>
                        </div>

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

                        {/* Reviews */}
                        <ErrorBoundary compact>
                            <ReviewsSection assetId={franchise.id} assetType="franchise" authorId={franchise.author_id} user={user} />
                        </ErrorBoundary>
                    </div>

                    {/* Content & Logistics */}
                    <div className="space-y-8">
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
                            <a
                                href={franchise.website_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-charcoal-50 p-6 md:p-8 rounded-[2rem] text-center border border-charcoal-100 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all group"
                            >
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em] group-hover:text-primary-600 transition-colors">Website</div>
                            </a>
                            <a
                                href={`mailto:${franchise.contact_email}`}
                                className="bg-charcoal-50 p-6 md:p-8 rounded-[2rem] text-center border border-charcoal-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all group"
                            >
                                <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em] group-hover:text-emerald-600 transition-colors">Contact</div>
                            </a>
                        </div>

                        <AssetAuditTrail assetId={franchise.id} assetType="franchise" />
                    </div>
                </div>
            </div>

            <ExpertAuditModal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                prefillBrand={franchise.name}
                prefillSector={franchise.category}
            />
        </div>
    );
}
