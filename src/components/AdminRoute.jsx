import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute: A high-clearance security wrapper.
 * 
 * Ensures that only users with the 'is_admin' certificate can access
 * administrative sectors of the platform.
 */
export default function AdminRoute({ children }) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-charcoal-500 font-bold uppercase tracking-widest text-xs">Authenticating Authority...</p>
                </div>
            </div>
        );
    }

    if (!user || !profile?.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
