import { motion } from 'framer-motion';

export default function PageLoader() {
    return (
        <div className="fixed inset-0 min-h-screen bg-[#FBFBFD] z-50 flex flex-col items-center justify-center">
            <div className="relative">
                {/* Outer pulsing ring */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-primary-200 rounded-full blur-xl"
                />

                {/* Main Logo Container */}
                <div className="relative w-20 h-20 bg-white rounded-2xl shadow-premium flex items-center justify-center border border-charcoal-50 overflow-hidden">
                    {/* Animated gradient border/glow */}
                    <motion.div
                        animate={{
                            rotate: 360
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#2563eb_360deg)] opacity-20"
                    />

                    {/* Inner content */}
                    <div className="relative z-10 w-[76px] h-[76px] bg-white rounded-xl flex items-center justify-center">
                        <span className="text-2xl font-black text-charcoal-900 tracking-tighter">
                            SM
                            <span className="text-primary-600">.</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Loading Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] font-black text-charcoal-300 uppercase tracking-[0.3em]">
                    Silent Money
                </span>
                <div className="h-0.5 w-12 bg-charcoal-100 rounded-full overflow-hidden">
                    <motion.div
                        animate={{
                            x: ["-100%", "100%"]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="h-full w-1/2 bg-primary-600 rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
}
