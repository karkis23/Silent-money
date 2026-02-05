import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ROICalculator from '../components/ROICalculator';
import ReviewsSection from '../components/ReviewsSection';
import ExpertAuditModal from '../components/ExpertAuditModal';
import { useAuth } from '../context/AuthContext';
import AssetAuditTrail from '../components/AssetAuditTrail';
import ErrorBoundary from '../components/ErrorBoundary';

export default function FranchiseDetailPage() {
    const { user, profile } = useAuth();
    const { slug } = useParams();
    const [franchise, setFranchise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [activeInfoTab, setActiveInfoTab] = useState('requirements');

    useEffect(() => {
        const fetchFranchise = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('franchises')
                .select('*, profiles(full_name, avatar_url, id)')
                .eq('slug', slug)
                .single();

            if (error) {
                setError('Franchise opportunity not found.');
            } else {
                setFranchise(data);
            }
            setLoading(false);
        };

        const checkSavedStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Get the franchise ID first (or fetch in checkSavedStatus)
            const { data: franchiseData } = await supabase
                .from('franchises')
                .select('id')
                .eq('slug', slug)
                .single();

            if (franchiseData) {
                const { data } = await supabase
                    .from('user_saved_franchises')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('franchise_id', franchiseData.id)
                    .single();

                setIsSaved(!!data);
            }
        };

        fetchFranchise();
        checkSavedStatus();
    }, [slug]);

    const handleToggleSave = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Please sign in to save opportunities.');
            return;
        }

        if (isSaved) {
            await supabase
                .from('user_saved_franchises')
                .delete()
                .eq('user_id', session.user.id)
                .eq('franchise_id', franchise.id);
            setIsSaved(false);
        } else {
            await supabase
                .from('user_saved_franchises')
                .insert([{ user_id: session.user.id, franchise_id: franchise.id }]);
            setIsSaved(true);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)} K`;
        return `₹${amount}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !franchise) return (
        <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-4">
            <div className="text-6xl mb-6">🛰️</div>
            <h1 className="text-3xl font-black text-charcoal-950 mb-4">{error}</h1>
            <Link to="/franchise" className="btn-primary">Back to Empire</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-32 transition-all duration-300">
            <SEO
                title={`${franchise.name} Franchise Opportunity`}
                description={`Detailed ROI analysis, investment requirements, and growth blueprint for ${franchise.name} in the ${franchise.category} sector.`}
            />

            {/* Cinematic Hero Section */}
            <div className="relative overflow-hidden bg-white">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/30 to-transparent -z-0 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-4 mb-10">
                            <BackButton label="Back to Expansion Feed" />
                            <div className="h-px flex-1 bg-charcoal-100 hidden sm:block" />
                        </div>

                        <div className="grid lg:grid-cols-12 gap-12 items-start">
                            {/* Left Content Column */}
                            <div className="lg:col-span-12">
                                <div className="flex flex-wrap items-center gap-4 mb-8">
                                    <span className="bg-charcoal-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-charcoal-200/50">
                                        🏢 {franchise.category}
                                    </span>
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100/50">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Verified Business
                                    </div>
                                    <span className="bg-primary-50 text-primary-600 border border-primary-100 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                        Unit Model: {franchise.unit_model || 'Standard'}
                                    </span>
                                    {profile?.income_goal > 0 && franchise.expected_profit_min > 0 && (
                                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-xl border border-white/20">
                                            🚀 +{Math.round((franchise.expected_profit_min / profile.income_goal) * 100)}% To Goal
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-charcoal-950 mb-8 leading-[1.1] tracking-tighter">
                                    {franchise.name}
                                </h1>

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                    <div className="max-w-2xl">
                                        <p className="text-xl md:text-2xl text-charcoal-500 font-medium leading-relaxed mb-8">
                                            {franchise.description?.slice(0, 160)}...
                                        </p>

                                        {/* Meta Stats Row */}
                                        <div className="flex flex-wrap items-center gap-6">
                                            {franchise.profiles && (
                                                <Link
                                                    to={`/profile/${franchise.profiles.id}`}
                                                    className="inline-flex items-center gap-3 group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-charcoal-50 shadow-inner border border-charcoal-100/50">
                                                        {franchise.profiles.avatar_url ? (
                                                            <img src={franchise.profiles.avatar_url} className="w-full h-full object-cover" alt={franchise.profiles.full_name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-primary-600">
                                                                {franchise.profiles.full_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest leading-none mb-1">Listed By</div>
                                                        <div className="text-sm font-black text-charcoal-900 group-hover:text-primary-600 transition-colors uppercase leading-none">
                                                            {franchise.profiles.full_name}
                                                        </div>
                                                    </div>
                                                </Link>
                                            )}

                                            <div className="h-8 w-px bg-charcoal-100 hidden md:block" />

                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest leading-none mb-1">Rating</div>
                                                    <div className="text-sm font-black text-emerald-600 leading-none">{franchise.asset_grade || 'A+ Grade'}</div>
                                                </div>
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-charcoal-50 overflow-hidden">
                                                            <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">
                                                        +5k
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Institutional Command Bar - Precision Redesign */}
                                    <div className="flex items-center gap-2 p-2 bg-white border border-charcoal-100 rounded-[2.5rem] shadow-2xl shadow-charcoal-200/30 w-full sm:w-auto flex-nowrap shrink-0">
                                        <button
                                            onClick={handleToggleSave}
                                            className={`h-14 px-8 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 min-w-[160px] shrink-0 group ${isSaved
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-charcoal-950 text-white hover:bg-primary-600 shadow-xl shadow-charcoal-900/10'
                                                }`}
                                        >
                                            <span className="text-base group-hover:scale-110 transition-transform">
                                                {isSaved ? '🛡️' : '🔖'}
                                            </span>
                                            <span className="whitespace-nowrap">{isSaved ? 'VAULTED' : 'SAVE ASSET'}</span>
                                        </button>

                                        <div className="w-px h-8 bg-charcoal-100 shrink-0 hidden sm:block" />

                                        <button
                                            onClick={() => setIsAuditModalOpen(true)}
                                            className="h-14 px-8 bg-charcoal-50/50 border border-charcoal-100/50 text-charcoal-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-charcoal-100 hover:border-charcoal-200 transition-all flex items-center justify-center gap-3 min-w-[160px] shrink-0 group"
                                        >
                                            <span className="text-base group-hover:rotate-12 transition-transform">🚀</span>
                                            <span className="whitespace-nowrap">REQUEST AUDIT</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Hero Asset */}
                        <div className="max-w-5xl mx-auto mt-12 group relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-600/5 blur-[120px] rounded-full -z-10 group-hover:bg-primary-600/10 transition-colors duration-1000" />

                            <div className="aspect-[21/9] rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
                                <img
                                    src={franchise.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000'}
                                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                    alt={franchise.name}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000';
                                        e.target.onerror = null;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-1000" />

                                <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pointer-events-none">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20">
                                            🏢
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-1">Status</div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-black text-white uppercase tracking-wider">Open for Franchise</div>
                                                {franchise.is_featured && (
                                                    <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-lg shadow-amber-500/20 flex items-center gap-1">
                                                        ⭐ Featured
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Presence</div>
                                            <div className="text-sm font-black text-white">{franchise.network_density || '82'}% NATIONAL</div>
                                        </div>
                                        <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Market Risk</div>
                                            <div className="text-sm font-black text-emerald-400 capitalize">{franchise.risk_profile || 'Low'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Visuals */}
                    <div className="space-y-8">
                        {/* Projected Earnings Section */}
                        <div className="bg-white rounded-[3rem] p-8 border border-charcoal-100 shadow-xl shadow-charcoal-200/50 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h3 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-2">Projected Earnings</h3>
                                    <div className="text-2xl font-black text-charcoal-900 tracking-tight">3-Year Growth Model</div>
                                </div>
                                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    Live Simulation
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="relative h-64 w-full mt-4">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-bold text-charcoal-300">
                                    <div className="border-b border-charcoal-50 w-full h-0 relative"><span className="absolute -top-3 right-0">High Yield</span></div>
                                    <div className="border-b border-charcoal-50 w-full h-0 relative"><span className="absolute -top-3 right-0">Profitable</span></div>
                                    <div className="border-b border-charcoal-900/10 w-full h-0 relative"><span className="absolute -top-3 right-0 text-charcoal-900">Breakeven</span></div>
                                    <div className="border-b border-charcoal-50 w-full h-0 relative"><span className="absolute -top-3 right-0">Investment</span></div>
                                </div>

                                {/* Graph Area */}
                                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 256" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="gradientYield" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Path: Starts low (investment), goes up, crosses middle, goes high */}
                                    <motion.path
                                        d="M0,256 C50,256 100,200 150,128 C200,56 250,20 400,10 L400,256 L0,256 Z"
                                        fill="url(#gradientYield)"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 1.5 }}
                                    />
                                    <motion.path
                                        d="M0,256 C50,256 100,200 150,128 C200,56 250,20 400,10"
                                        fill="none"
                                        stroke="#10B981"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray="1000"
                                        strokeDashoffset="1000"
                                        initial={{ strokeDashoffset: 1000 }}
                                        whileInView={{ strokeDashoffset: 0 }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                    />

                                    {/* Data Points */}
                                    <g>
                                        <motion.circle cx="0" cy="256" r="6" fill="#374151" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.2 }} />
                                        <motion.circle cx="150" cy="128" r="6" fill="#10B981" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1 }} />
                                        <motion.circle cx="400" cy="10" r="6" fill="#10B981" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2 }} />
                                    </g>
                                </svg>

                                {/* Annotations */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                    className="absolute bottom-4 left-4 bg-charcoal-900 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl"
                                >
                                    Total Investment
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                                    className="absolute top-1/2 left-[35%] -translate-y-1/2 bg-white border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl"
                                >
                                    Breakeven Point
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}
                                    className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                                >
                                    Profit Zone
                                </motion.div>
                            </div>
                        </div>

                        {/* Key Details Section */}
                        <div className="mt-12 bg-white rounded-[3rem] p-10 border border-charcoal-100 shadow-2xl shadow-charcoal-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
                            <h3 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-10 border-b border-charcoal-50 pb-6">Key Business Details</h3>

                            <div className="grid gap-10">
                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 bg-charcoal-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-primary-50 group-hover:scale-110 transition-all">🏗️</div>
                                    <div>
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Unit Model</div>
                                        <div className="text-lg font-black text-charcoal-900 leading-tight">{franchise.unit_model || 'FOCO / FOFO Configuration'}</div>
                                        <div className="text-[10px] text-charcoal-400 mt-1 font-medium">Standard Retail Deployment</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 bg-charcoal-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-primary-50 group-hover:scale-110 transition-all">📈</div>
                                    <div>
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Market Maturity</div>
                                        <div className="text-lg font-black text-charcoal-900 leading-tight">{franchise.market_maturity || 'High - National Leader'}</div>
                                        <div className="text-[10px] text-charcoal-400 mt-1 font-medium">Proven Operational Model</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 bg-charcoal-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-primary-50 group-hover:scale-110 transition-all">🛡️</div>
                                    <div>
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Support</div>
                                        <div className="text-lg font-black text-emerald-600 leading-tight">{franchise.corporate_support || 'Full Training Included'}</div>
                                        <div className="text-[10px] text-charcoal-400 mt-1 font-medium">Marketing & Supply Chain</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-charcoal-950 rounded-[2rem] text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Intelligence Signal</span>
                                </div>
                                <p className="text-xs font-bold leading-relaxed opacity-90">
                                    Sector demand for <span className="text-primary-400">{franchise.category}</span> is projected to grow by 12% YoY. Historical ROI in Tier-1 cities remains consistent.
                                </p>
                            </div>
                        </div>

                        {/* Market Strength */}
                        <div className="mt-8 bg-charcoal-50 rounded-[3rem] p-10 border border-charcoal-100/50 shadow-sm transition-all hover:shadow-xl group">
                            <h3 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <span>🛡️</span> Market Strength
                            </h3>

                            <div className="space-y-8">
                                {/* Success Rate */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="text-[10px] font-black text-charcoal-600 uppercase tracking-widest">Operator Retention</div>
                                        <div className="text-sm font-black text-emerald-600">{franchise.operator_retention || 94}%</div>
                                    </div>
                                    <div className="h-1.5 bg-charcoal-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                                            style={{ width: `${franchise.operator_retention || 94}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Network Density */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="text-[10px] font-black text-charcoal-600 uppercase tracking-widest">Network Density</div>
                                        <div className="text-sm font-black text-primary-600">{franchise.network_density > 70 ? 'High' : franchise.network_density > 40 ? 'Medium' : 'Growth Phase'}</div>
                                    </div>
                                    <div className="h-1.5 bg-charcoal-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-1000"
                                            style={{ width: `${franchise.network_density || 82}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-2xl border border-charcoal-100">
                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Asset Grade</div>
                                    <div className="text-xl font-black text-charcoal-900 tracking-tighter">{franchise.asset_grade || 'AAA+'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-charcoal-100">
                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Risk Profile</div>
                                    <div className="text-xl font-black text-emerald-600 tracking-tighter">{franchise.risk_profile || 'Low'}</div>
                                </div>
                            </div>
                        </div>

                        {/* More Details Tab */}
                        <div className="bg-white rounded-[3rem] p-3 border border-charcoal-100 shadow-xl shadow-charcoal-200/40 transform transition-all hover:shadow-2xl">
                            <div className="bg-charcoal-50 rounded-[2.5rem] p-2 flex gap-2 mb-8 select-none">
                                {['requirements', 'support', 'terms'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveInfoTab(tab)}
                                        className={`flex-1 py-3.5 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeInfoTab === tab
                                            ? 'bg-white text-charcoal-900 shadow-lg shadow-charcoal-200/50 scale-100'
                                            : 'text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100/50 scale-95'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="px-6 pb-6 min-h-[240px]">
                                <AnimatePresence mode="wait">
                                    {activeInfoTab === 'requirements' && (
                                        <motion.div
                                            key="requirements"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl border border-cream-200/50">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl">📐</span>
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest">Floor Area</div>
                                                        <div className="text-sm font-bold text-charcoal-900">{franchise.space_required_sqft} Sq. Ft.</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Mandatory</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl border border-cream-200/50">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl">👥</span>
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest">Staffing</div>
                                                        <div className="text-sm font-bold text-charcoal-900">4-6 Certified Personnel</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-lg">Trained</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl border border-cream-200/50">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl">⚡</span>
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest">Infrastructure</div>
                                                        <div className="text-sm font-bold text-charcoal-900">3-Phase Power & Water</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest bg-charcoal-100 px-2 py-1 rounded-lg">Utility</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeInfoTab === 'support' && (
                                        <motion.div
                                            key="support"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            {[
                                                { icon: '🎓', label: 'Training Prgm', val: '14 Days On-Site + 7 Days HO' },
                                                { icon: '📢', label: 'Marketing', val: 'National TV & Digital Ads' },
                                                { icon: '🚚', label: 'Logistics', val: 'Centralized Supply Chain' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-charcoal-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-lg">{item.icon}</div>
                                                    <div>
                                                        <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-widest">{item.label}</div>
                                                        <div className="text-sm font-black text-charcoal-900">{item.val}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {activeInfoTab === 'terms' && (
                                        <motion.div
                                            key="terms"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-5"
                                        >
                                            <div className="p-5 bg-charcoal-900 text-white rounded-3xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10" />
                                                <div className="relative z-10 text-center">
                                                    <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest mb-1">Contract Duration</div>
                                                    <div className="text-3xl font-black tracking-tight mb-1">5 Years</div>
                                                    <div className="text-[9px] font-medium text-emerald-400">Renewable based on Performance</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-charcoal-50 rounded-2xl text-center">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Royalty</div>
                                                    <div className="text-xl font-black text-charcoal-900">6%</div>
                                                    <div className="text-[8px] text-charcoal-500">of Net Monthly</div>
                                                </div>
                                                <div className="p-4 bg-charcoal-50 rounded-2xl text-center">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Lock-in</div>
                                                    <div className="text-xl font-black text-charcoal-900">3 Yrs</div>
                                                    <div className="text-[8px] text-charcoal-500">Standard Clause</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Data & Actions */}
                    <div className="space-y-12">
                        <section>
                            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8">Business Overview</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px) font-black text-charcoal-400 uppercase tracking-widest">Initial Cost</div>
                                    <div className="text-3xl font-black text-charcoal-950">{formatCurrency(franchise.investment_min)}</div>
                                </div>
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Payback Period</div>
                                    <div className="text-3xl font-black text-emerald-600">{franchise.roi_months_min}-{franchise.roi_months_max}m</div>
                                </div>
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Space Needed</div>
                                    <div className="text-3xl font-black text-charcoal-950">{franchise.space_required_sqft}<span className="text-lg text-charcoal-400 ml-1">sq.ft</span></div>
                                </div>
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Monthly Profit</div>
                                    <div className="text-3xl font-black text-primary-600">{formatCurrency(franchise.expected_profit_min)}<span className="text-lg text-charcoal-400">/mo</span></div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-6">About Business</h2>
                            <div className="text-charcoal-600 leading-relaxed active-prose prose prose-charcoal max-w-none prose-headings:font-black prose-headings:text-charcoal-900 prose-p:text-lg prose-p:font-medium prose-li:text-charcoal-600 prose-strong:text-charcoal-900 prose-strong:font-black prose-a:text-primary-600 mb-10">
                                <ReactMarkdown>{franchise.description}</ReactMarkdown>
                            </div>

                            {/* Strategic Action Bar */}
                            <div className="flex flex-wrap gap-4 mb-12">
                                {franchise.website_url ? (
                                    <a
                                        href={franchise.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 h-16 bg-charcoal-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl shadow-charcoal-200 group"
                                    >
                                        <span className="text-lg">🌐</span> Official Site
                                    </a>
                                ) : (
                                    <div className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 h-16 bg-charcoal-50 border border-charcoal-100 text-charcoal-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-not-allowed">
                                        Offline
                                    </div>
                                )}

                                {franchise.contact_email ? (
                                    <a
                                        href={`mailto:${franchise.contact_email}?subject=Franchise Inquiry: ${franchise.name}`}
                                        className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 h-16 bg-white border border-charcoal-200 text-charcoal-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:border-primary-600 hover:text-primary-600 transition-all"
                                    >
                                        <span className="text-lg">✉️</span> Contact
                                    </a>
                                ) : franchise.contact_phone ? (
                                    <a
                                        href={`tel:${franchise.contact_phone}`}
                                        className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 h-16 bg-white border border-charcoal-200 text-charcoal-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:border-primary-600 hover:text-primary-600 transition-all"
                                    >
                                        <span className="text-lg">📞</span> Call
                                    </a>
                                ) : (
                                    <div className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 h-16 bg-charcoal-50 border border-charcoal-100 text-charcoal-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-not-allowed">
                                        Private
                                    </div>
                                )}
                            </div>

                            <div className="mb-12">
                                <ErrorBoundary compact>
                                    <ROICalculator
                                        assetId={franchise.id}
                                        assetType="franchise"
                                        initialDefaults={{
                                            investment: franchise.investment_min,
                                            income: franchise.expected_profit_min,
                                            expenses: Math.round(franchise.expected_profit_min * 0.4)
                                        }}
                                    />
                                </ErrorBoundary>
                            </div>
                        </section>

                        <section className="bg-white rounded-[3rem] p-10 border border-charcoal-100 shadow-xl">
                            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <span>📦</span> Operational Logistics
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Supply Chain</div>
                                    <p className="text-sm font-bold text-charcoal-900">Centralized Procurement & Weekly Stock Refills</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Staffing Model</div>
                                    <p className="text-sm font-bold text-charcoal-900">4-6 Certified Personnel (Training via HQ)</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Tech Stack</div>
                                    <p className="text-sm font-bold text-charcoal-900">Integrated POS, Inventory & CRM Systems</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Marketing</div>
                                    <p className="text-sm font-bold text-charcoal-900">National Brand Campaigns + Local SEO Support</p>
                                </div>
                            </div>
                        </section>

                        {/* Author Attribution */}
                        {franchise.profiles && (
                            <Link
                                to={`/profile/${franchise.profiles.id}`}
                                className="inline-flex items-center gap-3 p-2 pr-6 bg-charcoal-50 rounded-2xl hover:bg-charcoal-100 transition-all group border border-charcoal-100"
                            >
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm">
                                    {franchise.profiles.avatar_url ? (
                                        <img src={franchise.profiles.avatar_url} className="w-full h-full object-cover" alt={franchise.profiles.full_name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm font-black text-primary-600">
                                            {franchise.profiles.full_name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest">Listed By</div>
                                    <div className="text-sm font-black text-charcoal-900 group-hover:text-primary-600 transition-colors">
                                        {franchise.profiles.full_name}
                                    </div>
                                </div>
                            </Link>
                        )}

                        <div className="mt-16">
                            <ErrorBoundary compact>
                                <ReviewsSection
                                    assetId={franchise.id}
                                    assetType="franchise"
                                    authorId={franchise.author_id}
                                    user={user}
                                />
                            </ErrorBoundary>
                        </div>

                        {/* Institutional Audit Trail - Visible only to author or admin */}
                        {(user?.id === franchise.author_id || profile?.is_admin) && (
                            <AssetAuditTrail assetId={franchise.id} assetType="franchise" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expert Audit Modal */}
            <ExpertAuditModal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                prefillBrand={franchise.name}
                prefillSector={franchise.category}
            />
        </div>
    );
}
