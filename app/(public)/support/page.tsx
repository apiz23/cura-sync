export default function SupportPage() {
    return (
        <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">
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
    );
}
