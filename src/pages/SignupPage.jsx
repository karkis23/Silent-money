import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const { error } = await signUp(email, password, { full_name: fullName });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                        Start Your Journey
                    </h1>
                    <p className="text-charcoal-600">
                        Discover realistic passive income ideas
                    </p>
                </div>

                <div className="card">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-sm font-medium text-charcoal-700 mb-2"
                            >
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-600 focus:border-transparent outline-none transition-all"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-charcoal-700 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-600 focus:border-transparent outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-charcoal-700 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-sage-600 focus:border-transparent outline-none transition-all"
                                placeholder="At least 6 characters"
                            />
                            <p className="mt-1 text-xs text-charcoal-500">
                                Minimum 6 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-charcoal-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-sage-600 hover:text-sage-700 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-charcoal-100">
                        <p className="text-xs text-charcoal-500 text-center">
                            By signing up, you agree to our Terms of Service and Privacy Policy.
                            We'll never sell your data or send spam.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
