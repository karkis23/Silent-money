import BackButton from '../components/BackButton';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20 pt-32">
            <BackButton label="Back" className="mb-8" />
            <h1 className="text-3xl font-bold text-charcoal-900 mb-8">Privacy Policy</h1>

            <div className="card space-y-6 text-charcoal-700">
                <p className="text-sm text-charcoal-500">Last updated: January 2026</p>

                <section>
                    <h2 className="text-lg font-bold text-charcoal-900 mb-2">1. Information We Collect</h2>
                    <p>
                        When you create an account on Silent Money, we collect your email address and any name you provide. We also store data related to your usage of the platform, such as:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Saved income ideas and their status (e.g., &quot;Started&quot;, &quot;Researching&quot;).</li>
                        <li>Notes you add to ideas.</li>
                        <li>Calculations performed using our tools (e.g., ROI calculator inputs).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-charcoal-900 mb-2">2. How We Use Your Information</h2>
                    <p>
                        We use your information solely to provide and improve the Silent Money service. Specifically:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>To authenticate your access to the platform.</li>
                        <li>To save your progress and preferences.</li>
                        <li>To send important updates regarding your account (e.g., password resets).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-charcoal-900 mb-2">3. Data Storage</h2>
                    <p>
                        Your data is stored securely using Supabase, a leading database provider. We do not sell your personal data to third parties.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-charcoal-900 mb-2">4. Your Rights</h2>
                    <p>
                        You have the right to request a copy of your data or request deletion of your account at any time. Please contact us if you wish to exercise these rights.
                    </p>
                </section>
            </div>
        </div>
    );
}
