import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/';
        } catch (error) {
            window.location.href = '/';
        }
    };

    const navLinks = [
        { name: 'Home', path: '/', protected: false },
        { name: 'Browse Ideas', path: '/ideas', protected: true },
        { name: 'Franchises', path: '/franchise', protected: true },
        { name: 'About', path: '/about', protected: false },
        { name: 'My Dashboard', path: '/dashboard', protected: true },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg border-b border-charcoal-100 py-3 shadow-sm' : 'bg-transparent py-3 md:py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="bg-primary-600 text-white font-bold text-xl px-2.5 py-1 rounded-xl shadow-lg shadow-primary-200"
                        >
                            SM
                        </motion.div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-charcoal-950 tracking-tight">
                                Silent Money
                            </span>
                            <span className="bg-charcoal-100 text-charcoal-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-charcoal-200/50">
                                Beta 2.1
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Search Center */}
                    <div className="hidden lg:block flex-1 max-w-md mx-8">
                        <GlobalSearch />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            (!link.protected || user) && (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative text-sm font-semibold transition-colors ${location.pathname === link.path ? 'text-primary-600' : 'text-charcoal-600 hover:text-primary-500'
                                        }`}
                                >
                                    {link.name}
                                    {location.pathname === link.path && (
                                        <motion.div
                                            layoutId="nav-underline"
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                                        />
                                    )}
                                </Link>
                            )
                        ))}

                        {user && profile?.is_admin && (
                            <Link
                                to="/admin"
                                className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border-2 border-primary-600/20 text-primary-600 hover:bg-primary-600 hover:text-white transition-all`}
                            >
                                MODERATE
                            </Link>
                        )}

                        <div className="flex items-center gap-4 ml-6 font-semibold">
                            {user ? (
                                <div className="flex items-center gap-6">
                                    <NotificationBell />
                                    <div className="flex items-center gap-4">
                                        <Link
                                            to="/edit-profile"
                                            className="w-10 h-10 rounded-full border-2 border-transparent hover:border-primary-600 transition-all overflow-hidden bg-charcoal-100 flex items-center justify-center group"
                                        >
                                            {profile?.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    className="w-full h-full object-cover"
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <span className="text-primary-600 font-bold text-sm">{profile?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}</span>
                                            )}
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-sm font-semibold text-charcoal-600 hover:text-primary-500">Login</Link>
                                    <Link to="/signup" className="btn-primary py-2 px-5 text-sm">Get Started</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-xl hover:bg-charcoal-50 text-charcoal-950 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-charcoal-100 shadow-xl"
                        >
                            <div className="p-4 space-y-4">
                                <div className="mb-4">
                                    <GlobalSearch />
                                </div>
                                {navLinks.map((link) => (
                                    (!link.protected || user) && (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className="block text-base font-semibold text-charcoal-900"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    )
                                ))}
                                <hr className="border-charcoal-100" />
                                {user ? (
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left text-base font-semibold text-charcoal-900"
                                    >
                                        Sign Out
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link
                                            to="/login"
                                            className="btn-secondary text-center py-2"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="btn-primary text-center py-2"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Join Now
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
