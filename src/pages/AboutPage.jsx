import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';

export default function AboutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const coreProcesses = [
        {
            stage: "01",
            title: "Expert Review",
            desc: "Every idea submission is reviewed by our team to verify legality and market viability within the Indian regulatory framework.",
            icon: "🔭"
        },
        {
            stage: "02",
            title: "Risk Analysis",
            desc: "We use detailed calculations that factor in operational costs, taxes, and inflation to provide a realistic success probability.",
            icon: "📊"
        },
        {
            stage: "03",
            title: "Expert Audit",
            desc: "High-value opportunities are audited by verified experts to provide detailed reports for our members.",
            icon: "🛡️"
        },
        {
            stage: "04",
            title: "Platform Access",
            desc: "Once verified, the idea is added to our database and made available for you to explore.",
            icon: "🔄"
        }
    ];

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4">
            <SEO
                title="About Us | Silent Money"
                description="Silent Money is the trusted platform for vetted, data-backed passive income plans in India."
            />

            <div className="max-w-6xl mx-auto">
                <motion.div {...fadeIn} className="mb-12">
                    <BackButton label="Home" to="/" />
                </motion.div>

                {/* About Hero */}
                <header className="mb-24 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Our Mission</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black text-charcoal-950 tracking-tightest leading-tight mb-8"
                    >
                        About <span className="text-primary-600">Silent Money.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-charcoal-500 font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed"
                    >
                        Helping 1.4 billion people build wealth through honest data and zero hype.
                    </motion.p>
                </header>

                {/* The Conflict: Hype vs Reality */}
                <section className="grid lg:grid-cols-2 gap-12 mb-32">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card bg-white border-none shadow-premium p-12 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                        <div className="text-4xl mb-8">🚫</div>
                        <h2 className="text-3xl font-black text-charcoal-900 mb-6 tracking-tight">The Industry Noise</h2>
                        <ul className="space-y-6">
                            {[
                                "Inflated ROI percentages designed to harvest clicks.",
                                "Lack of geographical context (US methods in Indian markets).",
                                "Omission of operational costs and tax liabilities.",
                                "Gatekept secrets sold as 'masterclasses' at premium prices."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4 text-charcoal-500 font-medium">
                                    <span className="text-red-500 mt-1">✕</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card bg-charcoal-950 text-white border-none shadow-2xl p-12 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                        <div className="text-4xl mb-8">🛡️</div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">The Silent Standard</h2>
                        <ul className="space-y-6">
                            {[
                                "Detailed ROI calculations with 98% data accuracy.",
                                "India-specific ideas (GST, local demand, logistics).",
                                "Transparent operational tracking for every saved idea.",
                                "Zero-gatekeeping policy: Professional insights for the masses."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4 text-primary-400 font-medium">
                                    <span className="text-primary-500 mt-1">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </section>

                {/* Process Timeline */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <div className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4">How It Works</div>
                        <h2 className="text-4xl font-black text-charcoal-950 tracking-tighter">Verification Process</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreProcesses.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="card bg-white border-charcoal-50 p-8 hover:border-primary-200 transition-all flex flex-col h-full"
                            >
                                <div className="text-[40px] mb-6">{p.icon}</div>
                                <div className="text-[10px] font-black text-charcoal-300 uppercase tracking-widest mb-2">Step {p.stage}</div>
                                <h3 className="text-lg font-black text-charcoal-900 mb-4 tracking-tight leading-tight">{p.title}</h3>
                                <p className="text-sm text-charcoal-500 font-medium leading-relaxed mb-auto">
                                    {p.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Platform Statistics */}
                <section className="mb-32">
                    <div className="card bg-charcoal-900 border-none p-12 overflow-hidden relative">
                        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

                        <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center">
                            <div>
                                <div className="text-5xl font-black text-white mb-2 tracking-tighter">1.4B+</div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Target Reach</div>
                            </div>
                            <div>
                                <div className="text-5xl font-black text-primary-400 mb-2 tracking-tighter">100%</div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Hype-Free Guarantee</div>
                            </div>
                            <div>
                                <div className="text-5xl font-black text-white mb-2 tracking-tighter">∞</div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Wealth Potential</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center max-w-3xl mx-auto">
                    <motion.div
                        whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                        className="space-y-10"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-charcoal-950 tracking-tightest leading-tight">
                            Ready to join the <span className="text-primary-600">silent revolution?</span>
                        </h2>
                        <p className="text-lg text-charcoal-500 font-medium leading-relaxed">
                            Stop chasing flashy screenshots. Start exploring proven ideas. Silent Money is more than a directory; it&apos;s your partner for financial freedom.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                                className="btn-primary w-full sm:w-auto px-12 py-5 text-sm"
                            >
                                Get Started
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/ideas')}
                                className="btn-secondary w-full sm:w-auto px-12 py-5 text-sm"
                            >
                                Browse Ideas
                            </motion.button>
                        </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}
