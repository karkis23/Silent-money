import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/supabase';

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
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        authService.getSession().then(({ session }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = authService.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const value = {
        user,
        session,
        loading,
        signUp: authService.signUp,
        signIn: authService.signIn,
        signOut: authService.signOut,
        resetPassword: authService.resetPassword,
        updatePassword: authService.updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
