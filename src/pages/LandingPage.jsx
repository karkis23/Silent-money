import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const { user } = useAuth();

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const [passiveGoal, setPassiveGoal] = useState(145000);
    const sourcesFound = Math.floor(passiveGoal / 12000) + 2;

    return (
        <div className="bg-cream-50 overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary-100/40 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            variants={stagger}
                            initial="initial"
                            animate="animate"
                            className="text-left"
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-charcoal-100 mb-6">
                                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                                <span className="text-sm font-bold text-charcoal-900 tracking-tight">🇮🇳 Trusted by 10,000+ Indians</span>
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-charcoal-950 mb-6 leading-[1.1]">
                                Build Your <br />
                                <span className="text-gradient">Financial Dynasty</span> <br />
                                <span className="text-primary-600">Quietly.</span>
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="text-xl text-charcoal-600 mb-10 max-w-xl leading-relaxed">
                                Beyond the noise of 'get-rich-quick' schemes, discover vetted,
                                <span className="font-bold text-charcoal-900"> data-backed passive income streams</span> tailored for the Indian landscape.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to={user ? "/ideas" : "/signup"}
                                    className="btn-primary text-center group"
                                >
                                    {user ? "Explore Ideas" : "Get Started Now"}
                                    <motion.span
                                        className="inline-block ml-2"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        →
                                    </motion.span>
                                </Link>
                                {!user && (
                                    <Link
                                        to="/about"
                                        className="btn-secondary text-center"
                                    >
                                        See How it Works
                                    </Link>
                                )}
                            </motion.div>

                            {/* Trust Badge */}
                            <motion.div variants={fadeInUp} className="mt-12 pt-8 border-t border-charcoal-100 flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-charcoal-${i * 100 + 100}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-charcoal-500 font-medium">
                                    <span className="text-charcoal-900 font-bold">4.9/5</span> rating from our community
                                </p>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 glass-card p-6 rotate-2 shadow-2xl overflow-visible">
                                <div className="mb-6 bg-charcoal-950/5 p-8 rounded-3xl border border-white/50 backdrop-blur-md">
                                    <div className="flex justify-between items-end mb-4 px-1">
                                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest">Target Monthly Yield</div>
                                        <div className="text-2xl font-black text-primary-600">₹{passiveGoal.toLocaleString('en-IN')}</div>
                                    </div>
                                    <input
                                        type="range"
                                        min="10000"
                                        max="500000"
                                        step="5000"
                                        value={passiveGoal}
                                        onChange={(e) => setPassiveGoal(Number(e.target.value))}
                                        className="w-full accent-primary-600 h-1.5 bg-charcoal-200 rounded-full cursor-pointer appearance-none"
                                    />
                                </div>

                                <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426"
                                    className="rounded-xl shadow-inner object-cover h-64 w-full brightness-90 grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                                    alt="Dashboard Preview"
                                />

                                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-charcoal-100 max-w-[220px] animate-float">
                                    <div className="text-accent font-black text-3xl">₹{passiveGoal.toLocaleString('en-IN')}</div>
                                    <div className="text-charcoal-400 text-[10px] font-black uppercase tracking-widest mt-1">Passive Goal Reached</div>
                                </div>

                                <div className="absolute -top-8 -right-8 bg-primary-600 text-white p-7 rounded-3xl shadow-2xl shadow-primary-200/50 max-w-[200px] animate-pulse-slow border-4 border-white">
                                    <div className="font-black text-2xl leading-none mb-1 text-white">{sourcesFound}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-primary-100">Verified Blueprints Found</div>
                                </div>
                            </div>
                            {/* Glow effect behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-200/20 blur-[100px] -z-10 rounded-full" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Restriction Notice (if not logged in) */}
            {!user && (
                <section className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-charcoal-950 mb-6">
                                Exclusive Insights <span className="text-primary-600">Unlocked</span> After Sign Up
                            </h2>
                            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
                                To protect the quality of our community and the integrity of our data,
                                detailed income ideas and market analysis are reserved for registered members.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Vetted Ideas", desc: "Detailed breakdown of 50+ real passive income sources.", icon: "💎" },
                                { title: "Franchise Deep Dives", desc: "ROI, investment, and risk analysis for top Indian franchises.", icon: "🏢" },
                                { title: "Profit Predictors", desc: "Custom calculators for each income category.", icon: "📈" }
                            ].map((item, i) => (
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    key={i}
                                    className="p-8 rounded-3xl bg-cream-50 border border-charcoal-100 hover:border-primary-200 transition-all shadow-sm"
                                >
                                    <div className="text-4xl mb-6">{item.icon}</div>
                                    <h3 className="text-xl font-bold text-charcoal-900 mb-3">{item.title}</h3>
                                    <p className="text-charcoal-600 leading-relaxed font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works with Premium Steps */}
            <section className="py-24 bg-charcoal-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-600 via-transparent to-transparent" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">The Journey to <span className="text-accent">Silent Wealth</span></h2>
                        <p className="text-charcoal-400 text-xl font-medium">Four simple steps to start your secondary income engine.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-12">
                        {[
                            { step: "01", title: "Join Community", desc: "Create your free account to access the motherboard of ideas." },
                            { step: "02", title: "Select Strategy", desc: "Filter by investment size, risk, and category." },
                            { step: "03", title: "Analyze Math", desc: "Use our tools to verify the profit potential." },
                            { step: "04", title: "Start Building", desc: "Get actionable next steps to launch your income stream." }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="text-7xl font-black text-white/5 absolute -top-10 left-0 group-hover:text-primary-500/10 transition-colors">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 relative z-10 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                                <p className="text-charcoal-400 font-medium relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-24"
            >
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-[100px]" />
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">
                            Stop Trading Time <br />For Money.
                        </h2>
                        <p className="text-xl mb-12 text-primary-100 max-w-2xl mx-auto font-medium">
                            Join 10,000+ smart Indians building their passive portfolios today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                            <Link
                                to={user ? '/ideas' : '/signup'}
                                className="bg-white text-primary-900 font-bold px-10 py-5 rounded-2xl hover:bg-cream-50 transition-all text-xl shadow-xl hover:scale-105"
                            >
                                {user ? 'View Dashboard' : 'Join Silent Money'}
                            </Link>
                        </div>
                        <p className="mt-8 text-primary-200 text-sm font-semibold opacity-80">
                            No credit card required • Verified data • Weekly updates
                        </p>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
