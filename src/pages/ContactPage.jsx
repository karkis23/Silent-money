import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 overflow-hidden relative">
            <SEO
                title="Contact the Command Center"
                description="Reach out to the Silent Money team for inquiries, support, or partnership opportunities."
            />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] bg-primary-100/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-charcoal-100 mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                        <span className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest">Command Center Support</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-charcoal-950 mb-6 tracking-tighter">
                        Establish <span className="text-primary-600">Contact.</span>
                    </h1>
                    <p className="text-xl text-charcoal-500 font-medium max-w-2xl mx-auto">
                        Inquiries, feedback, or technical support. We respond as quietly and efficiently as your income grows.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-12 gap-12 items-start">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-5 space-y-8"
                    >
                        <div className="card border-none shadow-xl p-8 bg-charcoal-950 text-white">
                            <h2 className="text-lg font-black uppercase tracking-widest mb-6 text-primary-400">Response Matrix</h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-charcoal-500 mb-1">Response Time</div>
                                    <div className="text-sm font-bold">Within 24-48 Working Hours</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-charcoal-500 mb-1">Operating Hours</div>
                                    <div className="text-sm font-bold">10:00 AM - 06:00 PM IST</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-charcoal-500 mb-1">Direct Channel</div>
                                    <div className="text-sm font-bold select-all">karkisenthilkumar@gmail.com</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary-50 rounded-[2rem] p-8 border border-primary-100">
                            <p className="text-primary-900 font-bold text-sm leading-relaxed">
                                "Financial freedom is a quiet journey. We ensure your path remains clear and your questions answered."
                            </p>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-7"
                    >
                        <div className="card border-none shadow-2xl p-10 bg-white/80 backdrop-blur-xl">
                            <form action="https://formsubmit.co/karkisenthilkumar@gmail.com" method="POST" className="space-y-6">
                                {/* Configuration for FormSubmit */}
                                <input type="hidden" name="_subject" value="New Contact from Silent Money Platform" />
                                <input type="hidden" name="_template" value="table" />
                                <input type="hidden" name="_next" value={window.location.origin + "/contact?success=true"} />
                                <input type="hidden" name="_captcha" value="false" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-charcoal-400 ml-1">Identity</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            placeholder="Your Name"
                                            className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-charcoal-400 ml-1">Channel</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            required
                                            placeholder="Your Email"
                                            className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-charcoal-400 ml-1">Sector</label>
                                    <select
                                        name="subject"
                                        id="subject"
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold text-sm appearance-none"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Technical Support">Technical Support</option>
                                        <option value="Franchise Audit">Franchise Audit Request</option>
                                        <option value="Partnership">Partnership Proposal</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-charcoal-400 ml-1">Transmission</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        required
                                        rows="4"
                                        placeholder="Enter your message here..."
                                        className="w-full px-5 py-4 bg-charcoal-50 border border-charcoal-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold text-sm resize-none"
                                    ></textarea>
                                </div>

                                {new URLSearchParams(window.location.search).get('success') && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold animate-float">
                                        ✓ Message transmitted successfully via the secure channel.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full btn-primary py-5 text-sm shadow-xl shadow-primary-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Transmit Message
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
