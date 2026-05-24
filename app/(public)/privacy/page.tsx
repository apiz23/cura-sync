export default function PrivacyPage() {
    return (
        <div className="public-grid-page public-dot-page">
        <main className="public-page-content public-text-panel mx-auto my-16 max-w-3xl space-y-8 px-6 py-16">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm">Last updated: May 2026</p>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                    CuraSync collects personal health information you provide directly, including
                    your name, contact details, appointment history, medications, and symptom data.
                    Health data is collected solely to provide and improve our services.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                    Your data is used to facilitate appointments, medication tracking, and
                    AI-powered symptom analysis. We do not sell personal data to third parties.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. Data Security</h2>
                <p className="text-muted-foreground">
                    All data is encrypted in transit (TLS) and at rest. Access is restricted
                    to authorized clinic staff for your registered facility only.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Contact</h2>
                <p className="text-muted-foreground">
                    For privacy inquiries, contact us at{" "}
                    <a href="mailto:support@curasync.com" className="underline">
                        support@curasync.com
                    </a>
                    .
                </p>
            </section>
        </main>
        </div>
    );
}
