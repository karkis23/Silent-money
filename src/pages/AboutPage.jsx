export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-charcoal-900 mb-4">About Silent Money</h1>
                <p className="text-xl text-charcoal-600">
                    Democratizing honest passive income knowledge for India.
                </p>
            </div>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-charcoal-800 mb-4">Our Mission</h2>
                    <div className="card text-charcoal-700 leading-relaxed bg-white">
                        <p className="mb-4">
                            Internet is flooded with "Get Rich Quick" schemes, flashy screenshots, and fake gurus promising overnight millions. Especially in India, thousands of people lose their hard-earned savings to these scams every year.
                        </p>
                        <p>
                            <strong>Silent Money</strong> exists to stand against this noise.
                        </p>
                        <p className="mt-4">
                            We believe in <strong>building wealth quietly and steadily</strong>. Our mission is to provide an honest, data-backed directory of passive income ideas that actually work in the Indian context. We don't sell dreams; we provide roadmaps.
                        </p>
                    </div>
                </section>

                <section className="grid md:grid-cols-3 gap-6">
                    <div className="card bg-sage-50 border-sage-100">
                        <div className="text-3xl mb-3">🔍</div>
                        <h3 className="font-bold text-charcoal-900 mb-2">Vetted Ideas</h3>
                        <p className="text-sm text-charcoal-600">
                            Every idea on this platform is researched for legality, viability, and scalability in India.
                        </p>
                    </div>
                    <div className="card bg-sage-50 border-sage-100">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-bold text-charcoal-900 mb-2">Real ROI</h3>
                        <p className="text-sm text-charcoal-600">
                            We provide realistic calculators, not inflated numbers. We include expenses and taxes.
                        </p>
                    </div>
                    <div className="card bg-sage-50 border-sage-100">
                        <div className="text-3xl mb-3">🇮🇳</div>
                        <h3 className="font-bold text-charcoal-900 mb-2">India First</h3>
                        <p className="text-sm text-charcoal-600">
                            Content tailored for Indian markets, payment gateways, and regulations.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-charcoal-800 mb-4">The Team</h2>
                    <div className="card text-charcoal-700 leading-relaxed bg-white">
                        <p>
                            Silent Money is built by a small team of developers and finance enthusiasts who got tired of the hype. We are building this platform for ourselves as much as for you - a place to track real progress towards financial freedom.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
