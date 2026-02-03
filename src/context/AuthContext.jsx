import { createContext, useContext, useEffect, useState } from 'react';
import { authService, supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            setProfile(data || null);
        } catch (err) {
            console.error('Profile sync error:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Get initial session
        authService.getSession().then(({ session }) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchProfile(currentUser.id);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = authService.onAuthStateChange((_event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchProfile(currentUser.id);
            else setProfile(null);
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        try {
            // 1. Sign out from Supabase
            await authService.signOut();

            // 2. Clear local state IMMEDIATELY
            setUser(null);
            setProfile(null);
            setSession(null);

            // 3. Clear storage keys starting with 'sb-'
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (err) {
            console.error('Sign out error in AuthContext:', err);
            // Safety fallback
            localStorage.clear();
            window.location.href = '/';
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        refreshProfile: () => user && fetchProfile(user.id),
        signUp: authService.signUp,
        signIn: authService.signIn,
        signOut: handleSignOut,
        resetPassword: authService.resetPassword,
        updatePassword: authService.updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
