export default function TermsPage() {
    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-background">
            {/* Square grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(color-mix(in oklch, var(--primary) 4%, transparent) 1px, transparent 1px), linear-gradient(to right, color-mix(in oklch, var(--primary) 4%, transparent) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[15vw] bg-gradient-to-r from-background to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[15vw] bg-gradient-to-l from-background to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        <main className="relative max-w-3xl mx-auto px-6 py-16 space-y-8">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground text-sm">Last updated: May 2026</p>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Acceptance</h2>
                <p className="text-muted-foreground">
                    By using CuraSync, you agree to these terms. If you do not agree, do not
                    use the platform.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. Medical Disclaimer</h2>
                <p className="text-muted-foreground">
                    CuraSync is a healthcare management platform. AI-powered symptom analysis
                    is for informational purposes only and does not constitute medical advice.
                    Always consult a qualified healthcare professional for diagnosis and treatment.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. Accounts</h2>
                <p className="text-muted-foreground">
                    You are responsible for maintaining the security of your account credentials.
                    Report any unauthorized access immediately.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Contact</h2>
                <p className="text-muted-foreground">
                    Questions about these terms? Contact{" "}
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
