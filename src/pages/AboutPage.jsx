import BackButton from '../components/BackButton';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20 pt-32">
            <BackButton label="Home" to="/" className="mb-12" />
            <div className="text-center mb-16">
                <h1 className="text-5xl font-black text-charcoal-950 mb-6 tracking-tight">
                    The <span className="text-primary-600">Silent</span> Manifesto
                </h1>
                <p className="text-xl text-charcoal-500 font-bold uppercase tracking-widest text-xs">
                    Democratizing honest wealth for 1.4 billion people.
                </p>
            </div>

            <div className="space-y-12">
                <section>
                    <div className="card text-charcoal-700 leading-relaxed bg-white border-none shadow-premium p-10">
                        <h2 className="text-2xl font-black text-charcoal-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm">01</span>
                            Our Mission
                        </h2>
                        <p className="mb-6 text-lg font-medium">
                            The internet is flooded with &quot;Get Rich Quick&quot; schemes, flashy screenshots, and fake gurus promising overnight millions. Especially in India, thousands of people lose their hard-earned savings to these scams every year.
                        </p>
                        <p className="text-lg font-black text-primary-600">
                            Silent Money exists to stand against this noise.
                        </p>
                        <p className="mt-6 text-charcoal-500 font-medium">
                            We believe in building wealth quietly and steadily. Our mission is to provide an honest, data-backed directory of passive income ideas that actually work in the Indian context. We don&apos;t sell dreams; we provide roadmaps.
                        </p>
                    </div>
                </section>

                <section className="grid md:grid-cols-3 gap-8">
                    <div className="card bg-white border-none shadow-sm hover:shadow-xl transition-all p-8">
                        <div className="text-4xl mb-6">🔍</div>
                        <h3 className="font-black text-charcoal-950 mb-3 tracking-tight">Vetted Ideas</h3>
                        <p className="text-sm text-charcoal-500 font-medium leading-relaxed">
                            Every idea on this platform is researched for legality, viability, and scalability in India.
                        </p>
                    </div>
                    <div className="card bg-white border-none shadow-sm hover:shadow-xl transition-all p-8">
                        <div className="text-4xl mb-6">📊</div>
                        <h3 className="font-black text-charcoal-950 mb-3 tracking-tight">Real ROI</h3>
                        <p className="text-sm text-charcoal-500 font-medium leading-relaxed">
                            We provide realistic calculators, not inflated numbers. We include expenses and taxes.
                        </p>
                    </div>
                    <div className="card bg-white border-none shadow-sm hover:shadow-xl transition-all p-8">
                        <div className="text-4xl mb-6">🇮🇳</div>
                        <h3 className="font-black text-charcoal-950 mb-3 tracking-tight">India First</h3>
                        <p className="text-sm text-charcoal-500 font-medium leading-relaxed">
                            Content tailored for Indian markets, payment gateways, and regulations.
                        </p>
                    </div>
                </section>

                <section>
                    <div className="card bg-charcoal-950 text-white border-none p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full" />
                        <h2 className="text-2xl font-black mb-6 relative z-10">The Architects</h2>
                        <p className="text-charcoal-400 font-medium text-lg leading-relaxed relative z-10">
                            Silent Money is built by a small team of developers and finance enthusiasts who got tired of the hype. We are building this platform for ourselves as much as for you - a place to track real progress towards financial freedom.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
