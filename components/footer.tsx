import Link from "next/link";

const navLinks = [
    { label: "Home", href: "/home" },
    { label: "Pricing", href: "/pricing" },
    { label: "Facilities", href: "/facilities" },
    { label: "Symptom Analyzer", href: "/symptom-analyzer" },
    { label: "Contact", href: "/contact" },
];

const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
    return (
        <footer className="border-t border-border bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="space-y-2">
                        <p className="text-base font-semibold text-foreground">CuraSync</p>
                        <p className="text-sm text-muted-foreground">
                            AI-powered healthcare coordination
                        </p>
                    </div>
                    <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="mt-8 border-t border-border pt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} CuraSync · Built as a final year project
                    </p>
                </div>
            </div>
        </footer>
    );
}
