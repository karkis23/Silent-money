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
        <div className="min-h-screen flex items-center justify-center px-4 py-20 pt-32">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-charcoal-950 mb-3 tracking-tight">
                        Start Your <span className="text-primary-600">Journey</span>
                    </h1>
                    <p className="text-charcoal-500 font-medium">
                        Discover realistic passive income ideas
                    </p>
                </div>

                <div className="card shadow-2xl border-none">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-xs font-black text-charcoal-400 uppercase tracking-widest mb-2"
                            >
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-black text-charcoal-400 uppercase tracking-widest mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-black text-charcoal-400 uppercase tracking-widest mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                placeholder="At least 6 characters"
                            />
                            <p className="mt-2 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                                🔒 Minimum 6 characters required
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium">
                        <p className="text-charcoal-500">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-600 hover:text-primary-700 font-bold"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-charcoal-100">
                        <p className="text-[10px] text-charcoal-400 text-center font-bold uppercase tracking-tight leading-relaxed">
                            By signing up, you agree to our Terms and Privacy.
                            We respect your privacy like it's our own.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
