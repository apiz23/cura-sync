export default function PrivacyPage() {
    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-background">
            {/* Dot grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(color-mix(in oklch, var(--primary) 10%, transparent) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[15vw] bg-gradient-to-r from-background to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[15vw] bg-gradient-to-l from-background to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        <main className="relative max-w-3xl mx-auto px-6 py-16 space-y-8">
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
