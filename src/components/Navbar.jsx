import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-charcoal-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-charcoal-900 text-white font-bold text-xl px-2.5 py-1 rounded-lg group-hover:bg-sage-600 transition-colors">
                            SM
                        </div>
                        <span className="text-xl font-bold text-charcoal-900 tracking-tight group-hover:text-sage-700 transition-colors">
                            Silent Money
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/ideas"
                            className="text-charcoal-700 hover:text-sage-600 font-medium transition-colors"
                        >
                            Income Ideas
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-charcoal-700 hover:text-sage-600 font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="text-charcoal-700 hover:text-sage-600 font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-charcoal-700 hover:text-sage-600 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="btn-primary"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-charcoal-50 text-charcoal-700"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation with Animation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden bg-white border-t border-charcoal-100"
                        >
                            <div className="py-4 space-y-3">
                                <Link
                                    to="/ideas"
                                    className="block px-4 py-2 text-charcoal-700 hover:bg-charcoal-50 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Income Ideas
                                </Link>

                                {user ? (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-charcoal-700 hover:bg-charcoal-50 rounded-lg"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleSignOut();
                                                setIsMenuOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-charcoal-700 hover:bg-charcoal-50 rounded-lg"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="block px-4 py-2 text-charcoal-700 hover:bg-charcoal-50 rounded-lg"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="block mx-4 text-center btn-primary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
