import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';

export default function MyIdeasPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [savedIdeas, setSavedIdeas] = useState([]);
    const [savedFranchises, setSavedFranchises] = useState([]);
    const [activeTab, setActiveTab] = useState('ideas');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleDelete = async (id) => {
        const typeLabel = activeTab === 'ideas' ? 'idea' : 'franchise opportunity';
        if (!window.confirm(`Are you sure you want to delete this ${typeLabel}? This action is permanent.`)) {
            return;
        }

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
            alert('Failed to delete: ' + err.message);
        } finally {
            setDeletingId(null);
        }
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
                        <div className="text-6xl mb-6">{activeTab === 'saved' ? '📑' : '🏜️'}</div>
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
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group card border-none shadow-xl shadow-charcoal-100/50 hover:shadow-2xl transition-all p-8 flex flex-col md:flex-row justify-between gap-8 items-center"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <h2 className="text-2xl font-black text-charcoal-950 group-hover:text-primary-600 transition-colors tracking-tight">
                                                {asset.name || asset.title}
                                            </h2>
                                            {activeTab === 'saved' ? (
                                                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-600">
                                                    Saved {asset.type}
                                                </span>
                                            ) : asset.is_approved ? (
                                                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                                                    ✓ Live & Verified
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                                    Pending Moderation
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-charcoal-500 text-base font-medium mb-4 line-clamp-1">
                                            {asset.short_description || asset.description}
                                        </p>
                                        <div className="flex gap-4">
                                            <div className="px-4 py-2 bg-charcoal-50 rounded-xl border border-charcoal-100">
                                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-1">Yield</span>
                                                <span className="text-sm font-black text-charcoal-900">₹{((asset.monthly_income_min || asset.expected_profit_min) / 1000).toFixed(1)}k/mo</span>
                                            </div>
                                            <div className="px-4 py-2 bg-charcoal-50 rounded-xl border border-charcoal-100">
                                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-1">Investment</span>
                                                <span className="text-sm font-black text-charcoal-900">₹{((asset.initial_investment_min || asset.investment_min) / 100000).toFixed(1)} L</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link
                                            to={(asset.type === 'idea' || activeTab === 'ideas') ? `/ideas/${asset.slug}` : `/franchise/${asset.slug}`}
                                            className="w-14 h-14 bg-charcoal-50 rounded-2xl flex items-center justify-center text-charcoal-400 hover:bg-primary-50 hover:text-primary-600 transition-all border border-charcoal-100"
                                            title="View Deployment"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </Link>
                                        {activeTab !== 'saved' && (
                                            <>
                                                <Link
                                                    to={activeTab === 'ideas' ? `/edit-idea/${asset.id}` : `/edit-franchise/${asset.id}`}
                                                    className="w-14 h-14 bg-charcoal-50 rounded-2xl flex items-center justify-center text-charcoal-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-charcoal-100"
                                                    title="Edit Config"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(asset.id)}
                                                    disabled={deletingId === asset.id}
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${deletingId === asset.id ? 'bg-red-100 text-red-600' : 'bg-charcoal-50 text-charcoal-400 hover:bg-red-50 hover:text-red-500 border-charcoal-100'}`}
                                                    title="Terminate Deployment"
                                                >
                                                    {deletingId === asset.id ? (
                                                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
