import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

export default function PublicProfilePage() {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [authoredIdeas, setAuthoredIdeas] = useState([]);
    const [authoredFranchises, setAuthoredFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // Fetch profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

                // Fetch authored ideas
                const { data: ideasData } = await supabase
                    .from('income_ideas')
                    .select('*, categories(icon, name)')
                    .eq('author_id', userId)
                    .order('created_at', { ascending: false });

                setAuthoredIdeas(ideasData || []);

                // Fetch authored franchises
                const { data: franchisesData } = await supabase
                    .from('franchises')
                    .select('*')
                    .eq('author_id', userId)
                    .order('created_at', { ascending: false });

                setAuthoredFranchises(franchisesData || []);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Commander not found in the matrix.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfileData();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4 flex flex-col items-center justify-center">
                <div className="text-6xl mb-6">🛰️</div>
                <h1 className="text-3xl font-black text-charcoal-950 mb-4">{error || 'Profile not found'}</h1>
                <Link to="/ideas" className="btn-primary">Return to Discovery</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20">
            <SEO title={`${profile.full_name || 'Commander'} | Silent Money Profile`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BackButton label="Return to Intelligence Feed" className="mb-10" />
                {/* Profile Header */}
                <div className="bg-white rounded-[3rem] shadow-premium border border-charcoal-100 p-8 md:p-12 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-charcoal-50 flex-shrink-0">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-primary-600">
                                    {profile.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <span className={`bg-primary-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                                    Verified Member
                                </span>
                                {profile.is_premium && (
                                    <span className="bg-amber-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        ⭐ Elite
                                    </span>
                                )}
                                {(authoredIdeas.length > 0 || authoredFranchises.length > 0) && (
                                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        🚀 Asset Author
                                    </span>
                                )}
                                {(() => {
                                    const totalAuthored = (authoredIdeas?.length || 0) + (authoredFranchises?.length || 0);
                                    let rank = { title: 'Market Explorer', color: 'bg-charcoal-100 text-charcoal-600', icon: '🛰️' };
                                    if (totalAuthored >= 1) rank = { title: 'Wealth Contributor', color: 'bg-blue-100 text-blue-700', icon: '⚔️' };
                                    if (totalAuthored >= 3) rank = { title: 'Master Strategist', color: 'bg-primary-100 text-primary-700', icon: '🎖️' };
                                    if (totalAuthored >= 5) rank = { title: 'Elite Wealth Commander', color: 'bg-amber-100 text-amber-700', icon: '💎' };

                                    return (
                                        <span className={`${rank.color} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-80`}>
                                            {rank.icon} {rank.title}
                                        </span>
                                    );
                                })()}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-charcoal-950 tracking-tighter mb-4">
                                {profile.full_name || 'Anonymous Commander'}
                            </h1>

                            <p className="text-lg text-charcoal-600 font-medium leading-relaxed max-w-2xl mb-8">
                                {profile.bio || 'This commander is building their financial dynasty quietly. No operational bio provided yet.'}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-6 border-t border-charcoal-50">
                                <div>
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Assets Published</div>
                                    <div className="text-2xl font-black text-charcoal-950">{authoredIdeas.length + authoredFranchises.length}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest mb-1">Member Since</div>
                                    <div className="text-2xl font-black text-charcoal-950">
                                        {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Authored Content */}
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Ideas */}
                    <section>
                        <h2 className="text-sm font-black text-charcoal-950 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <span>🚀</span> Authored Blueprints
                        </h2>

                        {authoredIdeas.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-charcoal-100 p-12 text-center">
                                <div className="text-4xl mb-4">🧊</div>
                                <p className="text-charcoal-500 font-bold uppercase tracking-widest text-[10px]">No blueprints published yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {authoredIdeas.map((idea) => (
                                    <Link
                                        key={idea.id}
                                        to={`/ideas/${idea.slug}`}
                                        className="block p-6 bg-white rounded-3xl border border-charcoal-100 hover:border-primary-300 hover:shadow-premium transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">
                                                {idea.categories?.icon} {idea.categories?.name}
                                            </span>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                ₹{(idea.monthly_income_min / 1000).toFixed(0)}k/mo Yield
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-charcoal-950 group-hover:text-primary-600 transition-colors mb-2">
                                            {idea.title}
                                        </h3>
                                        <p className="text-sm text-charcoal-500 line-clamp-2 font-medium">
                                            {idea.short_description}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Franchises */}
                    <section>
                        <h2 className="text-sm font-black text-charcoal-950 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <span>🏢</span> Strategic Franchises
                        </h2>

                        {authoredFranchises.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-charcoal-100 p-12 text-center">
                                <div className="text-4xl mb-4">🔒</div>
                                <p className="text-charcoal-500 font-bold uppercase tracking-widest text-[10px]">No franchises listed yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {authoredFranchises.map((franchise) => (
                                    <Link
                                        key={franchise.id}
                                        to={`/franchise/${franchise.slug}`}
                                        className="block p-6 bg-white rounded-3xl border border-charcoal-100 hover:border-primary-300 hover:shadow-premium transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">
                                                {franchise.category}
                                            </span>
                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                                                {franchise.roi_months_min}-{franchise.roi_months_max}m ROI
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-charcoal-950 group-hover:text-primary-600 transition-colors mb-2">
                                            {franchise.name}
                                        </h3>
                                        <p className="text-sm text-charcoal-500 line-clamp-2 font-medium">
                                            {franchise.description}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
