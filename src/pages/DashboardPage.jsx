import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [savedIdeas, setSavedIdeas] = useState([]);
    const [savedFranchises, setSavedFranchises] = useState([]);
    const [myIdeaCount, setMyIdeaCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [myFranchiseCount, setMyFranchiseCount] = useState(0);
    const [activeTab, setActiveTab] = useState('ideas');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);

            // Fetch saved ideas
            const { data: saved, error: savedError } = await supabase
                .from('user_saved_ideas')
                .select(`
                    *,
                    income_ideas (
                        id,
                        title,
                        slug,
                        short_description,
                        monthly_income_min,
                        monthly_income_max,
                        effort_level,
                        author_id
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Fetch saved franchises
            const { data: savedFran, error: franSavedError } = await supabase
                .from('user_saved_franchises')
                .select(`
                    *,
                    franchises (
                        *
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Fetch count of ideas posted by user
            const { count, error: countError } = await supabase
                .from('income_ideas')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', user.id);

            // Fetch count of franchises posted by user
            const { count: fCount, error: fError } = await supabase
                .from('franchises')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', user.id);

            if (savedError) console.error('Error fetching saved ideas:', savedError);
            if (franSavedError) console.error('Error fetching saved franchises:', franSavedError);
            if (countError) console.error('Error fetching idea count:', countError);
            if (fError) console.error('Error fetching franchise count:', fError);

            setSavedIdeas(saved || []);
            setSavedFranchises(savedFran || []);
            setMyIdeaCount(count || 0);
            setMyFranchiseCount(fCount || 0);
            setLoading(false);
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const calculatePotentialIncome = () => {
        if (!savedIdeas.length) return 0;
        return savedIdeas.reduce((total, item) => {
            return total + (item.income_ideas?.monthly_income_min || 0);
        }, 0);
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-20 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center text-4xl shadow-2xl border border-charcoal-100 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <span className="text-primary-600 font-black tracking-tighter">{profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Operational Commander</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 tracking-tighter leading-none">
                                Welcome, <span className="text-primary-600">{profile?.full_name?.split(' ')[0] || 'Commander'}</span>
                            </h1>
                            <p className="text-charcoal-500 font-medium mt-2">
                                Monitoring {savedIdeas.length + savedFranchises.length} active wealth engines.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/edit-profile"
                        className="btn-secondary flex items-center gap-3 px-8 text-xs h-14"
                    >
                        <span>⚙️</span> COMMAND CONFIG
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="card group">
                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-2 font-mono">Vault Assets</div>
                        <div className="text-4xl font-black text-charcoal-950 tracking-tighter">
                            {savedIdeas.length + savedFranchises.length}
                        </div>
                    </div>

                    <div className="card group">
                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-2 font-mono">My Deployments</div>
                        <div className="text-4xl font-black text-charcoal-950 tracking-tighter">
                            {myIdeaCount + myFranchiseCount}
                        </div>
                        <Link to="/my-ideas" className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-4 inline-block hover:underline">Manage Fleet →</Link>
                    </div>

                    <div className="card bg-money border-none group shadow-2xl shadow-money/20">
                        <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-mono">Projected Yield</div>
                        <div className="text-4xl font-black text-white tracking-tighter">
                            ₹{(calculatePotentialIncome() / 1000).toFixed(1)}k<span className="text-lg text-white/50 ml-1">/mo</span>
                        </div>
                    </div>

                    <div className="bg-primary-600 p-8 rounded-[2.5rem] shadow-2xl shadow-primary-600/20 flex flex-col justify-between">
                        <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4 font-mono">New Deployment</div>
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/add-idea"
                                className="w-full bg-white text-primary-700 font-black text-[10px] py-4 rounded-2xl text-center uppercase tracking-widest hover:bg-cream-50 transition-all shadow-xl shadow-primary-700/20"
                            >
                                + Forge Idea
                            </Link>
                            <Link
                                to="/post-franchise"
                                className="w-full bg-primary-800 text-white font-black text-[10px] py-4 rounded-2xl text-center uppercase tracking-widest hover:bg-primary-900 transition-all"
                            >
                                + Deploy Brand
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex gap-8 border-b border-charcoal-100 mb-8">
                    <button
                        onClick={() => setActiveTab('ideas')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'ideas' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        Saved Blueprints ({savedIdeas.length})
                        {activeTab === 'ideas' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('franchises')}
                        className={`pb-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'franchises' ? 'text-primary-600' : 'text-charcoal-400 hover:text-charcoal-600'}`}
                    >
                        Saved Franchises ({savedFranchises.length})
                        {activeTab === 'franchises' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" />}
                    </button>
                </div>

                {/* Section Content */}
                <div className="bg-white rounded-xl shadow-premium border border-charcoal-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-charcoal-500 font-bold">Syncing Vault...</p>
                        </div>
                    ) : activeTab === 'ideas' ? (
                        <>
                            <div className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/30 flex justify-between items-center">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Saved Income Blueprints</h2>
                                <Link to="/ideas" className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Browse More →</Link>
                            </div>
                            {savedIdeas.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="text-4xl mb-4">🔖</div>
                                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Saved Blueprints</h3>
                                    <p className="text-charcoal-500 mb-6 text-sm font-medium">Explore the discovery hub to track high-yield income streams.</p>
                                    <Link to="/ideas" className="btn-primary py-2 px-6 text-xs">Explore Hub</Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-charcoal-100">
                                    {savedIdeas.map((saved) => (
                                        <div key={saved.id} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                            <div className="flex-1">
                                                <Link to={`/ideas/${saved.income_ideas.slug}`} className="text-lg font-black text-charcoal-900 group-hover:text-primary-600 transition-colors">
                                                    {saved.income_ideas.title}
                                                </Link>
                                                <p className="text-sm text-charcoal-500 mb-2 font-medium line-clamp-1">{saved.income_ideas.short_description}</p>
                                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                                                    <span className="text-emerald-600">₹{(saved.income_ideas.monthly_income_min / 1000).toFixed(0)}k/mo Yield</span>
                                                    <span>• {saved.income_ideas.effort_level} Effort</span>
                                                </div>
                                            </div>
                                            <Link to={`/ideas/${saved.income_ideas.slug}`} className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest">View Asset</Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/30 flex justify-between items-center">
                                <h2 className="text-sm font-black text-charcoal-900 uppercase tracking-widest">Saved Franchise Opportunities</h2>
                                <Link to="/franchise" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Explore Brands →</Link>
                            </div>
                            {savedFranchises.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="text-4xl mb-4">🏢</div>
                                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Saved Franchises</h3>
                                    <p className="text-charcoal-500 mb-6 text-sm font-medium">Bookmark established brands with high ROI potential.</p>
                                    <Link to="/franchise" className="btn-primary py-2 px-6 text-xs bg-emerald-600 hover:bg-emerald-700">View Franchises</Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-charcoal-100">
                                    {savedFranchises.map((saved) => (
                                        <div key={saved.id} className="p-6 hover:bg-cream-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                            <div className="flex-1">
                                                <Link to={`/franchise/${saved.franchises.slug}`} className="text-lg font-black text-charcoal-900 group-hover:text-emerald-600 transition-colors">
                                                    {saved.franchises.name}
                                                </Link>
                                                <p className="text-sm text-charcoal-500 mb-2 font-medium line-clamp-1">{saved.franchises.description}</p>
                                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                                                    <span className="text-emerald-600">{saved.franchises.roi_months_min}-{saved.franchises.roi_months_max}m ROI</span>
                                                    <span>• ₹{(saved.franchises.investment_min / 100000).toFixed(1)}L Capital</span>
                                                </div>
                                            </div>
                                            <Link to={`/franchise/${saved.franchises.slug}`} className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest">Open Portal</Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
