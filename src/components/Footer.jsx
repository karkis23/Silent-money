import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-charcoal-900 text-charcoal-300 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white text-charcoal-900 font-bold text-xl px-2.5 py-1 rounded-lg">
                                SM
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white">Silent Money</div>
                                <div className="text-sm text-charcoal-400">
                                    Earn quietly. Build steadily.
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-charcoal-400 max-w-md">
                            Discover realistic passive income ideas for India. No hype. No fake promises. Just honest assessments and real numbers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/ideas" className="hover:text-sage-400 transition-colors">
                                    Income Ideas
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-sage-400 transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-sage-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/privacy" className="hover:text-sage-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-sage-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="hover:text-sage-400 transition-colors">
                                    Disclaimer
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-charcoal-800 mt-8 pt-8 text-sm text-center text-charcoal-500">
                    <p>© {currentYear} Silent Money. All rights reserved.</p>
                    <p className="mt-2 text-xs">
                        ⚠️ Disclaimer: Income results vary. Past performance doesn't guarantee future results. Do your own research before investing.
                    </p>
                </div>
            </div>
        </footer>
    );
}
