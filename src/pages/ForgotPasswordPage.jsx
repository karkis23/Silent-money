import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setMessage('');
            setLoading(true);

            const { error } = await resetPassword(email);

            if (error) throw error;

            setMessage('Check your email for the password reset link.');
        } catch (err) {
            setError('Failed to reset password. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-charcoal-100">
                <div className="text-center">
                    <span className="text-4xl">🔐</span>
                    <h2 className="mt-4 text-3xl font-bold text-charcoal-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-charcoal-600">
                        Enter your email to receive a reset link.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-charcoal-200 placeholder-charcoal-400 text-charcoal-900 focus:outline-none focus:ring-sage-500 focus:border-sage-500 focus:z-10 sm:text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-charcoal-900 hover:bg-charcoal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <Link to="/login" className="font-medium text-sage-600 hover:text-sage-500 text-sm">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
