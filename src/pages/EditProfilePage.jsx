import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';

const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe'
];

export default function EditProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [budget, setBudget] = useState('5-25L');
    const [risk, setRisk] = useState('Medium');
    const [sectors, setSectors] = useState('');
    const [incomeGoal, setIncomeGoal] = useState(100000);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile) {
            setName(profile.full_name || '');
            setBio(profile.bio || '');
            setAvatarUrl(profile.avatar_url || '');
            setBudget(profile.investment_budget || '5-25L');
            setRisk(profile.risk_tolerance || 'Medium');
            setSectors(profile.preferred_sectors?.join(', ') || '');
            setIncomeGoal(profile.income_goal || 100000);
        }
    }, [profile]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: name,
                    bio,
                    avatar_url: avatarUrl,
                    investment_budget: budget,
                    risk_tolerance: risk,
                    preferred_sectors: sectors.split(',').map(s => s.trim()).filter(s => s),
                    income_goal: incomeGoal,
                    updated_at: new Date()
                });

            if (error) throw error;

            await refreshProfile();
            setMessage('Commander credentials updated.');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage('Encryption failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4">
            <SEO title="Commander Configuration | Identity Matrix" />
            <div className="max-w-xl mx-auto">
                <div className="mb-10 flex flex-col items-start gap-4">
                    <BackButton label="Back" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                            <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.3em]">Profile Center</span>
                        </div>
                        <h1 className="text-4xl font-black text-charcoal-950 tracking-tighter">Command <span className="text-primary-600">Config.</span></h1>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8">
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center shadow-inner ${message.includes('updated') ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                        >
                            {message}
                        </motion.div>
                    )}

                    <div className="card border-none shadow-2xl p-10 space-y-10">
                        {/* Avatar Picker */}
                        <section>
                            <h2 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-6">Choose Identity</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {PRESET_AVATARS.map((url, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setAvatarUrl(url)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all bg-charcoal-50 ${avatarUrl === url ? 'border-primary-600 scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={url} className="w-full h-full object-cover" alt={`Avatar ${i}`} />
                                        {avatarUrl === url && (
                                            <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center">
                                                <div className="bg-primary-600 text-white rounded-full p-1 shadow-lg">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <hr className="border-charcoal-50" />

                        {/* Investor Identity Matrix */}
                        <section className="space-y-6">
                            <h2 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-4">Investor Identity Matrix</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Investment Budget</label>
                                    <select
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl outline-none text-sm font-black text-charcoal-900 cursor-pointer"
                                    >
                                        <option value="Under 5L">Under ₹5L</option>
                                        <option value="5-25L">₹5L - ₹25L</option>
                                        <option value="25-50L">₹25L - ₹50L</option>
                                        <option value="50L+">₹50L+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Risk Tolerance</label>
                                    <select
                                        value={risk}
                                        onChange={(e) => setRisk(e.target.value)}
                                        className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-xl outline-none text-sm font-black text-charcoal-900 cursor-pointer"
                                    >
                                        <option value="Low">Low - Safety First</option>
                                        <option value="Medium">Medium - Balanced</option>
                                        <option value="High">High - Aggressive Yield</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Monthly Passive Income Goal (₹)</label>
                                <input
                                    type="number"
                                    value={incomeGoal}
                                    onChange={(e) => setIncomeGoal(e.target.value)}
                                    className="w-full px-6 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold text-charcoal-900"
                                    placeholder="e.g. 100000"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Preferred Sectors (Comma separated)</label>
                                <input
                                    type="text"
                                    value={sectors}
                                    onChange={(e) => setSectors(e.target.value)}
                                    className="w-full px-6 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold text-charcoal-900"
                                    placeholder="e.g. EdTech, Real Estate, E-commerce"
                                />
                            </div>
                        </section>

                        <hr className="border-charcoal-50" />

                        {/* Personal Info */}
                        <section className="space-y-6">
                            <h2 className="text-[10px] font-black text-charcoal-400 uppercase tracking-[0.2em] mb-4">Operational Summary</h2>
                            <div>
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-6 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none text-lg font-black text-charcoal-900"
                                    placeholder="Enter commander name"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest block mb-2 pl-1">Operational Bio</label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full px-6 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium"
                                    placeholder="Tell the community about your investment strategy..."
                                />
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-16 text-sm tracking-[0.2em]"
                        >
                            {loading ? 'SYNCING...' : 'SAVE COMMANDER CONFIG'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
