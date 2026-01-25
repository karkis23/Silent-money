import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-charcoal-950 text-charcoal-400 mt-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary-600 text-white font-bold text-xl px-2.5 py-1 rounded-xl shadow-lg shadow-primary-900/20">
                                SM
                            </div>
                            <div className="text-2xl font-black text-white tracking-tight">Silent Money</div>
                        </div>
                        <p className="text-base text-charcoal-400 max-w-sm mb-8 font-medium">
                            Join the ranks of thousands of Indians building their financial empires quietly, steadily, and with proven data.
                        </p>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-xl bg-charcoal-900 hover:bg-primary-900/30 border border-charcoal-800 transition-colors cursor-pointer" />
                            ))}
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Platform</h3>
                            <ul className="space-y-4 text-sm font-bold">
                                <li><Link to="/ideas" className="hover:text-primary-400 transition-colors">Income Motherboard</Link></li>
                                <li><Link to="/franchise" className="hover:text-primary-400 transition-colors">Franchise Data</Link></li>
                                <li><Link to="/dashboard" className="hover:text-primary-400 transition-colors">Commander Center</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Company</h3>
                            <ul className="space-y-4 text-sm font-bold">
                                <li><Link to="/about" className="hover:text-primary-400 transition-colors">Our Manifesto</Link></li>
                                <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Guard</Link></li>
                                <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Service Terms</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Reality Check</h3>
                            <p className="text-xs text-charcoal-500 font-bold leading-relaxed uppercase tracking-tight">
                                ⚠️ Past performance is not a guarantee of future success. Passive income requires dedication and vetting.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-charcoal-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-charcoal-600">© {currentYear} SILENT MONEY PLATFORM. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest border border-accent/20 px-3 py-1 rounded-full">System v1.4.2 Status: Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
