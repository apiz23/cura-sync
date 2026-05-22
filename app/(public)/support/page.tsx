export default function SupportPage() {
    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-background">
            {/* Horizontal lines */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px)",
                    backgroundSize: "100% 56px",
                }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[15vw] bg-gradient-to-r from-background to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[15vw] bg-gradient-to-l from-background to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        <main className="relative max-w-3xl mx-auto px-6 py-16 space-y-8">
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">
                Need help with CuraSync? We&apos;re here for you.
            </p>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Contact Us</h2>
                <ul className="space-y-2 text-muted-foreground">
                    <li>
                        Email:{" "}
                        <a href="mailto:support@curasync.com" className="underline">
                            support@curasync.com
                        </a>
                    </li>
                    <li>Response time: within 1 business day</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Common Issues</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                        <strong>Can&apos;t log in?</strong> Use the password reset link on the
                        login page, or email support.
                    </li>
                    <li>
                        <strong>Appointment not showing?</strong> Refresh the page or contact
                        your clinic directly.
                    </li>
                    <li>
                        <strong>Symptom analyzer not responding?</strong> Check your internet
                        connection and try again.
                    </li>
                </ul>
            </section>
        </main>
        </div>
    );
}
