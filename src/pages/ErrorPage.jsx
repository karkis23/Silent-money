import { useRouteError, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    const isOffline = !navigator.onLine ||
        (error?.message && error.message.includes('Failed to fetch dynamically imported module'));

    return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-charcoal-200/50 border border-charcoal-100/50"
            >
                <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-100">
                        {isOffline ? (
                            <span className="text-4xl text-primary-600">🌐</span>
                        ) : (
                            <span className="text-4xl text-primary-600">🏛️</span>
                        )}
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full border-4 border-white flex items-center justify-center"
                    >
                        <span className="text-white text-xs font-black">!</span>
                    </motion.div>
                </div>

                <h1 className="text-3xl font-black text-charcoal-950 uppercase tracking-tighter mb-4 leading-none">
                    {isOffline ? 'Connection Severed' : 'System Disruption'}
                </h1>

                <p className="text-charcoal-600 text-sm leading-relaxed mb-10 font-medium">
                    {isOffline
                        ? 'The neural link to Silent Money has been interrupted. Please verify your data uplink and attempt reconnection.'
                        : 'An unexpected deviation has occurred in the platform core. Our engineers have been alerted.'}
                </p>

                <div className="grid gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-charcoal-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-100 transition-all duration-300"
                    >
                        Re-Establish Uplink
                    </button>

                    <Link
                        to="/"
                        className="w-full py-4 bg-white text-charcoal-950 border border-charcoal-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-charcoal-50 transition-all duration-300"
                    >
                        Return to Sanctuary
                    </Link>
                </div>

                <div className="mt-12 flex items-center justify-center gap-2 opacity-30 grayscale pointer-events-none">
                    <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest leading-none">Silent Money</span>
                    <div className="w-1 h-1 rounded-full bg-charcoal-400" />
                    <span className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest leading-none">v2.0 Terminal</span>
                </div>
            </motion.div>
        </div>
    );
}
