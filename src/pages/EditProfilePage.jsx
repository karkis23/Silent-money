import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function EditProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setName(data.full_name || '');
                setBio(data.bio || '');
                setAvatarUrl(data.avatar_url || '');
            }
        };

        if (user) fetchProfile();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: name,
                    bio,
                    avatar_url: avatarUrl,
                    updated_at: new Date()
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage('Profile updated successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-charcoal-400 hover:text-charcoal-900"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold text-charcoal-900">Edit Profile</h1>
                </div>

                <form onSubmit={handleUpdate} className="card space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-charcoal-100 border border-charcoal-200 overflow-hidden flex items-center justify-center text-3xl mb-4">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Avatar Image URL"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="text-xs text-charcoal-500 bg-transparent border-b border-charcoal-200 outline-none focus:border-sage-500 w-full text-center"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none transition-all"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Short Bio</label>
                        <textarea
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-500 outline-none transition-all"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex justify-center py-3"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
