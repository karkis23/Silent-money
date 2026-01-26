import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import ReactMarkdown from 'react-markdown';

export default function FranchiseDetailPage() {
    const { slug } = useParams();
    const [franchise, setFranchise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);

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
        <div className="min-h-screen bg-cream-50 pb-20 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/franchise" className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-8 inline-flex items-center gap-2 hover:text-primary-600 transition-colors">
                    ← Back to Discovery Feed
                </Link>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Visuals */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
                            <img
                                src={franchise.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000'}
                                className="w-full h-full object-cover"
                                alt={franchise.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
                            <div className="absolute bottom-12 left-12 right-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                                        {franchise.category}
                                    </span>
                                    {franchise.is_verified && (
                                        <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                                            ✓ Verified ROI
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tighter">{franchise.name}</h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 rounded-[2rem] bg-white border border-charcoal-100 flex items-center justify-center text-3xl opacity-30">
                                    🖼️
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Data & Actions */}
                    <div className="space-y-12">
                        <section>
                            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-8">Asset Analysis</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Initial Capital</div>
                                    <div className="text-3xl font-black text-charcoal-950">{formatCurrency(franchise.investment_min)}</div>
                                </div>
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">ROI Matrix</div>
                                    <div className="text-3xl font-black text-emerald-600">{franchise.roi_months_min}-{franchise.roi_months_max}m</div>
                                </div>
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Space Deployment</div>
                                    <div className="text-3xl font-black text-charcoal-950">{franchise.space_required_sqft}<span className="text-lg text-charcoal-400 ml-1">sq.ft</span></div>
                                </div>
                                <div className="card border-none shadow-xl shadow-charcoal-100/50 p-8 flex flex-col justify-between h-40">
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Net Profit Target</div>
                                    <div className="text-3xl font-black text-primary-600">{formatCurrency(franchise.expected_profit_min)}<span className="text-lg text-charcoal-400">/mo</span></div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-6">Blueprint Strategy</h2>
                            <div className="text-charcoal-600 leading-relaxed active-prose prose prose-charcoal max-w-none prose-headings:font-black prose-headings:text-charcoal-900 prose-p:text-lg prose-p:font-medium prose-li:text-charcoal-600 prose-strong:text-charcoal-900 prose-strong:font-black prose-a:text-primary-600 mb-8">
                                <ReactMarkdown>{franchise.description}</ReactMarkdown>
                            </div>

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
                        </section>

                        {franchise.requirements && franchise.requirements.length > 0 && (
                            <section>
                                <h2 className="text-[11px] font-black text-charcoal-400 uppercase tracking-[0.3em] mb-6">Operator Requirements</h2>
                                <div className="flex flex-wrap gap-3">
                                    {franchise.requirements.map((req, i) => (
                                        <div key={i} className="px-5 py-3 bg-white border border-charcoal-100 rounded-2xl text-sm font-black text-charcoal-900 shadow-sm">
                                            ✓ {req}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {franchise.website_url ? (
                                <a
                                    href={franchise.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-8 h-18 bg-primary-600 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-1 transition-all group"
                                >
                                    <span>🌐</span> Official Site
                                </a>
                            ) : (
                                <div className="flex items-center justify-center gap-3 px-8 h-18 bg-charcoal-50 border border-charcoal-100 text-charcoal-300 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] cursor-not-allowed">
                                    Website Offline
                                </div>
                            )}

                            {franchise.contact_email ? (
                                <a
                                    href={`mailto:${franchise.contact_email}?subject=Franchise Inquiry: ${franchise.name}`}
                                    className="flex items-center justify-center gap-3 px-8 h-18 bg-white border-2 border-charcoal-900 text-charcoal-900 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-charcoal-950 hover:text-white hover:-translate-y-1 transition-all"
                                >
                                    <span>✉️</span> Email Brand
                                </a>
                            ) : franchise.contact_phone ? (
                                <a
                                    href={`tel:${franchise.contact_phone}`}
                                    className="flex items-center justify-center gap-3 px-8 h-18 bg-white border-2 border-charcoal-900 text-charcoal-900 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-charcoal-950 hover:text-white hover:-translate-y-1 transition-all"
                                >
                                    <span>📞</span> Call Support
                                </a>
                            ) : (
                                <div className="flex items-center justify-center gap-3 px-8 h-18 bg-charcoal-50 border border-charcoal-100 text-charcoal-300 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] cursor-not-allowed">
                                    Locked Data
                                </div>
                            )}

                            <button
                                onClick={handleToggleSave}
                                className={`flex items-center justify-center gap-3 px-8 h-18 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all border-2 ${isSaved
                                    ? 'bg-primary-50 border-primary-600 text-primary-600'
                                    : 'bg-white border-charcoal-200 text-charcoal-400 hover:border-primary-600 hover:text-primary-600'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isSaved ? 'animate-pulse' : ''}`} fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                {isSaved ? 'Blueprint Vaulted' : 'Save Blueprint'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
