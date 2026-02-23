import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import ConfirmModal from '../components/ConfirmModal';

export default function MyIdeasPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [savedIdeas, setSavedIdeas] = useState([]);
    const [savedFranchises, setSavedFranchises] = useState([]);
    const [activeTab, setActiveTab] = useState('ideas');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    useEffect(() => {
        const fetchSavedAssets = async () => {
            setLoading(true);
            try {
                const [ideasRes, franchisesRes] = await Promise.all([
                    supabase
                        .from('user_saved_ideas')
                        .select('*, income_ideas(*, categories(name))')
                        .eq('user_id', user.id),
                    supabase
                        .from('user_saved_franchises')
                        .select('*, franchises(*)')
                        .eq('user_id', user.id)
                ]);

                setSavedIdeas(ideasRes.data?.map(item => item.income_ideas).filter(Boolean) || []);
                setSavedFranchises(franchisesRes.data?.map(item => item.franchises).filter(Boolean) || []);
            } catch (err) {
                console.error('Error fetching saved assets:', err);
                setError('Failed to load your vault.');
            }
            setLoading(false);
        };

        const fetchAssets = async () => {
            setLoading(true);
            const table = activeTab === 'ideas' ? 'income_ideas' : 'franchises';

            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('author_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setAssets(data || []);
            } catch (err) {
                console.error('Error fetching assets:', err);
                setError(`Failed to load your ${activeTab}.`);
            }
            setLoading(false);
        };

        if (activeTab === 'saved') {
            fetchSavedAssets();
        } else {
            fetchAssets();
        }
    }, [user, activeTab]);

    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = (id) => {
        const typeLabel = activeTab === 'ideas' ? 'blueprint' : 'franchise opportunity';

        setConfirmConfig({
            isOpen: true,
            title: `Terminate ${activeTab === 'ideas' ? 'Blueprint' : 'Opportunity'}?`,
            message: `Are you sure you want to permanently delete this ${typeLabel}? This action cannot be reversed and all operational data will be purged.`,
            onConfirm: async () => {
                setDeletingId(id);
                try {
                    const table = activeTab === 'ideas' ? 'income_ideas' : 'franchises';
                    const { error } = await supabase
                        .from(table)
                        .delete()
                        .eq('id', id)
                        .eq('author_id', user.id);

                    if (error) throw error;
                    setAssets(assets.filter(a => a.id !== id));
                } catch (err) {
                    console.error('Error deleting asset:', err);
                    setError('Failed to delete asset: ' + err.message);
                } finally {
                    setDeletingId(null);
                }
            },
            type: 'danger'
        });
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-32">
            <SEO title="My Personal Wealth Vault" description="Manage your deployed income ideas, franchise opportunities, and saved assets in your private command center." />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <BackButton label="Command Center" className="mb-10" />
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-charcoal-950 mb-2 tracking-tighter">My <span className="text-primary-600">Assets</span></h1>
                        <p className="text-charcoal-500 font-medium">Manage and monitor the income streams you&apos;ve deployed.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/add-idea" className="btn-secondary text-[11px] font-black uppercase tracking-widest px-6">+ Idea</Link>
                        <Link to="/post-franchise" className="btn-primary text-[11px] font-black uppercase tracking-widest px-6 shadow-xl shadow-primary-200">+ Franchise</Link>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-charcoal-100 mb-12">
                    <button
                        onClick={() => setActiveTab('ideas')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'ideas' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        Income Streams
                        {activeTab === 'ideas' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('franchises')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'franchises' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        My Franchises
                        {activeTab === 'franchises' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'saved' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        Saved Vault
                        {activeTab === 'saved' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" />}
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                        ⚠️ {error}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white border border-charcoal-100 rounded-3xl animate-pulse" />)}
                    </div>
                ) : (activeTab === 'saved' ? (savedIdeas.length + savedFranchises.length) : assets.length) === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-charcoal-100 shadow-sm">
                        <div className="text-6xl mb-6">{activeTab === 'saved' ? '�' : '🏜️'}</div>
                        <h3 className="text-2xl font-black text-charcoal-900 mb-2 tracking-tight">
                            {activeTab === 'saved' ? 'Vault Empty' : 'Deployment Empty'}
                        </h3>
                        <p className="text-charcoal-500 font-medium mb-10 max-w-sm mx-auto">
                            {activeTab === 'saved'
                                ? "You haven't saved any assets to your vault yet. Browse the feeds to find your first opportunity."
                                : `You haven't deployed any ${activeTab === 'ideas' ? 'income ideas' : 'franchise opportunities'} yet.`}
                        </p>
                        <Link to={activeTab === 'saved' ? '/ideas' : (activeTab === 'ideas' ? '/add-idea' : '/post-franchise')} className="btn-primary">
                            {activeTab === 'saved' ? 'Explore Opportunities' : '+ Start New Deployment'}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {(activeTab === 'saved' ? [...savedIdeas.map(i => ({ ...i, type: 'idea' })), ...savedFranchises.map(f => ({ ...f, type: 'franchise' }))] : assets).map((asset) => (
                                <motion.div
                                    key={asset.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group bg-white rounded-2xl border border-charcoal-100/50 shadow-lg shadow-charcoal-200/10 hover:shadow-xl hover:shadow-primary-100/20 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="p-6 md:p-7 flex flex-col lg:flex-row justify-between gap-6">
                                        {/* Status & Identity */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                {activeTab === 'saved' ? (
                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-primary-900 text-white">
                                                        Institutional {asset.type}
                                                    </span>
                                                ) : asset.is_approved ? (
                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white">
                                                        ✓ Live Deployment
                                                    </span>
                                                ) : asset.status === 'revision' ? (
                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-blue-500 text-white flex items-center gap-1.5">
                                                        <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                                                        Action Required
                                                    </span>
                                                ) : asset.status === 'rejected' ? (
                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-red-600 text-white">
                                                        Audit Failed
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-amber-500 text-white flex items-center gap-1.5">
                                                        <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                                                        Awaiting Audit
                                                    </span>
                                                )}
                                                <span className="text-[8px] font-black text-charcoal-400 uppercase tracking-widest bg-charcoal-50 px-2.5 py-1 rounded-md">
                                                    ID: {asset.id.slice(0, 8)}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-black text-charcoal-950 group-hover:text-primary-600 transition-colors tracking-tightest leading-tight mb-2 truncate">
                                                {asset.name || asset.title || 'Untitled Asset'}
                                            </h2>

                                            {/* Admin Feedback HUD */}
                                            {asset.admin_feedback && (asset.status === 'revision' || asset.status === 'rejected') && (
                                                <div className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                                    <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1.5">Institutional Feedback</div>
                                                    <p className="text-xs text-orange-950 font-medium italic">"{asset.admin_feedback}"</p>
                                                </div>
                                            )}

                                            <p className="text-charcoal-500 text-sm font-medium mb-6 line-clamp-1 max-w-xl leading-relaxed">
                                                {asset.short_description || asset.description || 'No operational description provided.'}
                                            </p>

                                            {/* Deployment Metrics */}
                                            <div className="flex flex-wrap gap-4">
                                                <div className="bg-charcoal-50/50 rounded-xl p-4 border border-charcoal-100/50 min-w-[140px]">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                                                        <span className="text-primary-600">📈</span> Potential Yield
                                                    </div>
                                                    <div className="text-lg font-black text-charcoal-900 tracking-tighter">
                                                        ₹{(((asset.monthly_income_min || asset.monthly_revenue_potential || 0)) / 1000).toFixed(1)}k
                                                        <span className="text-[10px] text-charcoal-400 font-bold ml-1 uppercase tracking-widest">/mo</span>
                                                    </div>
                                                </div>
                                                <div className="bg-charcoal-50/50 rounded-xl p-4 border border-charcoal-100/50 min-w-[140px]">
                                                    <div className="text-[8px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                                                        <span className="text-emerald-600">💰</span> Deployment Cost
                                                    </div>
                                                    <div className="text-lg font-black text-charcoal-900 tracking-tighter">
                                                        ₹{((asset.initial_investment_min || asset.investment_min || 0) / 100000).toFixed(1)}
                                                        <span className="text-[10px] text-charcoal-400 font-bold ml-1 uppercase tracking-widest"> Lakhs</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Control Terminal */}
                                        <div className="flex lg:flex-col gap-2 justify-center">
                                            <Link
                                                to={(asset.type === 'idea' || activeTab === 'ideas') ? `/ideas/${asset.slug}` : `/franchise/${asset.slug}`}
                                                className="flex-1 lg:flex-none h-12 px-5 bg-charcoal-900 text-white rounded-xl flex items-center justify-center gap-2.5 hover:bg-primary-600 transition-all shadow-lg shadow-charcoal-200/50"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Inspect</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>

                                            {activeTab !== 'saved' && (
                                                <>
                                                    <Link
                                                        to={activeTab === 'ideas' ? `/edit-idea/${asset.id}` : `/edit-franchise/${asset.id}`}
                                                        className="flex-1 lg:flex-none h-12 px-5 bg-white text-charcoal-900 border-[1.5px] border-charcoal-100 rounded-xl flex items-center justify-center gap-2.5 hover:border-primary-600 hover:text-primary-600 transition-all"
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Config</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(asset.id)}
                                                        disabled={deletingId === asset.id}
                                                        className={`flex-1 lg:flex-none h-12 px-5 rounded-xl flex items-center justify-center gap-2.5 transition-all border-[1.5px] ${deletingId === asset.id ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-50/30 border-red-50/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Terminate</span>
                                                        {deletingId === asset.id ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Decorative Bar */}
                                    <div className="h-0.5 w-full bg-charcoal-50/30 flex">
                                        <div className={`h-full ${asset.is_approved ? 'bg-emerald-500' : activeTab === 'saved' ? 'bg-primary-600' : 'bg-amber-500'} w-16`} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />
        </div>
    );
}
