import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-cream-50 transition-colors duration-300">
            <ErrorBoundary compact>
                <Navbar />
            </ErrorBoundary>
            <Toaster position="bottom-right" reverseOrder={false} />
            <main className="flex-1 w-full max-w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </motion.div>
                </AnimatePresence>
            </main>
            <ErrorBoundary compact>
                <Footer />
            </ErrorBoundary>
        </div>
    );
}
