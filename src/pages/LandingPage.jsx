import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="bg-cream-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-block mb-6">
                            <span className="bg-sage-100 text-sage-800 px-4 py-2 rounded-full text-sm font-medium">
                                🇮🇳 Built for India
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-charcoal-900 mb-6 leading-tight">
                            Earn quietly.
                            <br />
                            <span className="text-sage-700">Build steadily.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-charcoal-600 mb-8 max-w-2xl mx-auto">
                            Discover <span className="font-semibold text-charcoal-900">realistic</span> passive income ideas for India.
                            No hype. No fake promises. Just honest assessments and real numbers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/ideas"
                                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
                            >
                                Explore Income Ideas
                            </Link>
                            {!user && (
                                <Link
                                    to="/signup"
                                    className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
                                >
                                    Start Free
                                </Link>
                            )}
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-charcoal-600">
                            <div className="flex items-center gap-2">
                                <span className="text-sage-600">✓</span>
                                <span>No guaranteed income claims</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sage-600">✓</span>
                                <span>Real ROI calculations</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sage-600">✓</span>
                                <span>Risk disclosures</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative background */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-sage-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-sage-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                            Tired of "Get Rich Quick" Scams?
                        </h2>
                        <p className="text-lg text-charcoal-600">
                            We were too. That's why we built Silent Money - a platform that tells you the truth about passive income in India.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card text-center">
                            <div className="text-4xl mb-4">🚫</div>
                            <h3 className="text-xl font-semibold text-charcoal-900 mb-3">
                                No Fake Screenshots
                            </h3>
                            <p className="text-charcoal-600">
                                No "I made ₹1 lakh in 7 days" nonsense. Only verified, realistic income ranges.
                            </p>
                        </div>

                        <div className="card text-center">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-charcoal-900 mb-3">
                                Real Numbers
                            </h3>
                            <p className="text-charcoal-600">
                                Actual investment needed, time to first income, and honest success rates.
                            </p>
                        </div>

                        <div className="card text-center">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-charcoal-900 mb-3">
                                Risk Warnings
                            </h3>
                            <p className="text-charcoal-600">
                                Every idea comes with a reality check. We tell you what can go wrong.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-cream-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                            How Silent Money Works
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-sage-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="font-semibold text-charcoal-900 mb-2">
                                Browse Ideas
                            </h3>
                            <p className="text-sm text-charcoal-600">
                                Explore 50+ vetted passive income ideas for India
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-sage-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="font-semibold text-charcoal-900 mb-2">
                                Check Reality
                            </h3>
                            <p className="text-sm text-charcoal-600">
                                See real investment, income range, and risk level
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-sage-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="font-semibold text-charcoal-900 mb-2">
                                Calculate ROI
                            </h3>
                            <p className="text-sm text-charcoal-600">
                                Use our calculator to see if it makes sense for you
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-sage-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                4
                            </div>
                            <h3 className="font-semibold text-charcoal-900 mb-2">
                                Track Progress
                            </h3>
                            <p className="text-sm text-charcoal-600">
                                Save ideas and monitor your journey
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-sage-700 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Build Real Passive Income?
                    </h2>
                    <p className="text-xl mb-8 text-sage-100">
                        Join hundreds of Indians discovering honest income opportunities.
                    </p>
                    <Link
                        to={user ? '/ideas' : '/signup'}
                        className="inline-block bg-white text-sage-700 font-semibold px-8 py-4 rounded-lg hover:bg-cream-50 transition-colors text-lg"
                    >
                        {user ? 'Explore Ideas' : 'Get Started Free'}
                    </Link>
                    <p className="mt-4 text-sm text-sage-200">
                        No credit card required. No spam. Ever.
                    </p>
                </div>
            </section>
        </div>
    );
}
