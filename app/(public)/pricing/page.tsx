"use client";

import {
    Check,
    X,
    ArrowRight,
    Calendar,
    Building2,
    Shield,
    Users,
    Brain,
    ClipboardList,
    Stethoscope,
    ChevronDown,
    Bell,
    BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import PageTitle from "@/components/page-title";

const plans = [
    {
        name: "Clinic",
        description: "Complete clinic operations for a single branch",
        price: { monthly: 299, annual: 249 },
        annualTotal: "RM2,990/year per branch",
        popular: true,
        features: [
            "Patient and staff access management",
            "Appointment booking and schedule management",
            "Consultation queue and admin dashboard",
            "Patient records and medication logging",
            "AI symptom analysis",
            "Health sync support",
            "Audit trail and admin logs",
            "Push notifications for appointment confirmations",
            "Usage analytics dashboard",
            "Self-service clinic onboarding portal",
            "Standard onboarding and support",
        ],
        cta: "Get Started",
        ctaHref: "/partner/register",
    },
    {
        name: "Enterprise",
        description: "For multi-branch clinics and custom operational needs",
        price: null,
        priceLabel: "Custom",
        popular: false,
        features: [
            "Everything in Clinic",
            "Multi-branch deployment",
            "Priority onboarding and staff training",
            "Data migration assistance",
            "Custom reporting support",
            "Integration planning support",
            "Priority support",
        ],
        cta: "Contact Sales",
        ctaHref: "/contact",
    },
];

const comparisonData = [
    {
        category: "Clinic Operations",
        icon: ClipboardList,
        features: [
            { name: "Appointment booking", clinic: true, enterprise: true },
            { name: "Facility schedule management", clinic: true, enterprise: true },
            { name: "Consultation queue workflow", clinic: true, enterprise: true },
            { name: "Multi-branch rollout", clinic: false, enterprise: true },
        ],
    },
    {
        category: "Patient Care Tools",
        icon: Stethoscope,
        features: [
            { name: "AI symptom analysis", clinic: true, enterprise: true },
            { name: "Medication tracking and dose logs", clinic: true, enterprise: true },
            { name: "Health records access", clinic: true, enterprise: true },
            { name: "Health sync support", clinic: true, enterprise: true },
            { name: "Push notifications (appointment updates)", clinic: true, enterprise: true },
        ],
    },
    {
        category: "Security and Admin",
        icon: Shield,
        features: [
            { name: "Role-based access control", clinic: true, enterprise: true },
            { name: "Audit trail", clinic: true, enterprise: true },
            { name: "Admin audit log viewer", clinic: true, enterprise: true },
            { name: "Usage analytics dashboard", clinic: true, enterprise: true },
            { name: "Custom reporting support", clinic: false, enterprise: true },
        ],
    },
    {
        category: "SaaS Platform",
        icon: Building2,
        features: [
            { name: "Cloud-hosted centralised backend", clinic: true, enterprise: true },
            { name: "Web + mobile cross-platform access", clinic: true, enterprise: true },
            { name: "Self-service clinic onboarding portal", clinic: true, enterprise: true },
            { name: "Subscription plan management", clinic: true, enterprise: true },
            { name: "Automatic updates and deployments", clinic: true, enterprise: true },
        ],
    },
    {
        category: "Services",
        icon: Users,
        features: [
            { name: "Standard onboarding", clinic: true, enterprise: true },
            { name: "Data migration assistance", clinic: false, enterprise: true },
            { name: "Staff training support", clinic: false, enterprise: true },
            { name: "Priority support", clinic: false, enterprise: true },
        ],
    },
];

const faqs = [
    {
        question: "Who is CuraSync for?",
        answer: "CuraSync is designed for private clinics that need a single system for appointments, patient records, medication workflows, AI-assisted symptom intake, and admin oversight.",
    },
    {
        question: "Is pricing charged per user?",
        answer: "No. Pricing is based on clinic branch deployment, not individual user accounts. One subscription covers the entire team at a branch.",
    },
    {
        question: "What is included in the Clinic plan?",
        answer: "The Clinic plan includes all core modules for daily operations: user access control, appointments, patient records, medication tracking, AI symptom analysis, health sync support, audit logging, push notifications for appointment updates, a usage analytics dashboard, and self-service clinic onboarding.",
    },
    {
        question: "Does CuraSync support multi-branch clinics?",
        answer: "Yes. Multi-branch rollouts are handled under the Enterprise plan, which includes deployment planning, staff training, and migration support.",
    },
    {
        question: "How does CuraSync handle wearable and IoT health data?",
        answer: "CuraSync integrates wearable health data through the mobile app's Health Connect interface, capturing synced metrics such as steps, sleep sessions, and heart rate. This data feeds the patient and clinical dashboards for longitudinal tracking and care coordination.",
    },
    {
        question: "Is the platform suitable for audit and access tracking?",
        answer: "Yes. CuraSync includes role-based access control and audit trail support for key administrative and clinical workflows.",
    },
    {
        question: "Can you help migrate existing clinic data?",
        answer: "Yes. Data migration assistance is available under the Enterprise plan. Contact our team to discuss your specific requirements.",
    },
    {
        question: "Do patients receive notifications for their appointments?",
        answer: "Yes. When a clinic confirms an appointment, the patient receives a push notification on their mobile device and an email confirmation. Notifications are delivered automatically — no manual follow-up needed.",
    },
    {
        question: "Does CuraSync provide analytics for clinic admins?",
        answer: "Yes. The admin dashboard includes a usage analytics section showing appointment trends over the past six months, total patients seen, and staff breakdown by role.",
    },
    {
        question: "How do clinics get started on CuraSync?",
        answer: "Clinics can register directly through the self-service onboarding portal at curasync.com/partner/register. The process takes a few minutes — enter your clinic details and admin account information and you are ready to go.",
    },
    {
        question: "Can clinics request a custom deployment?",
        answer: "Yes. Clinics with custom reporting, rollout, or integration requirements should reach out via the Enterprise plan to discuss what is possible.",
    },
];

function FeatureCell({ value }: { value: boolean }) {
    return value ? (
        <Check className="mx-auto h-4 w-4 text-primary" />
    ) : (
        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
    );
}

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-background px-4 pb-16 pt-20">
            {/* Square grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px), linear-gradient(to right, color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                }}
            />
            {/* Diagonal stripes */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(-45deg, transparent, transparent 40px, color-mix(in oklch, var(--primary) 3%, transparent) 40px, color-mix(in oklch, var(--primary) 3%, transparent) 41px)",
                }}
            />
            {/* Top-left radial glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full opacity-25"
                style={{
                    background: "radial-gradient(circle, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)",
                }}
            />
            {/* Top fade */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
            {/* Watermark */}
            <div aria-hidden="true" className="pointer-events-none absolute right-4 top-10 hidden select-none text-[10rem] font-black leading-none tracking-[-0.06em] text-primary/[0.04] xl:block">
                PLANS
            </div>
            <PageTitle title="Pricing" />
            <div className="mx-auto max-w-5xl space-y-20 pt-10">

                {/* Header — left-aligned, asymmetric */}
                <div
                    className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationFillMode: "both" }}
                >
                    <div className="space-y-5 max-w-xl">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Clinic pricing
                        </Badge>
                        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
                            Pricing built for real clinic workflows
                        </h1>
                        <p className="text-base leading-relaxed text-muted-foreground">
                            Appointments, patient records, medications, AI symptom analysis,
                            and audit-ready admin controls — one platform, priced per branch.
                        </p>
                    </div>

                    {/* Billing toggle — right-aligned on lg */}
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
                            Monthly
                        </span>
                        <Switch
                            checked={isAnnual}
                            onCheckedChange={setIsAnnual}
                            className="data-[state=checked]:bg-primary"
                        />
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                                Annual
                            </span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                Save ~17%
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards — asymmetric: Clinic gets more visual weight */}
                <div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-[3fr_2fr] animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: "100ms", animationFillMode: "both" }}
                >
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={cn(
                                "relative border transition-shadow duration-200",
                                plan.popular
                                    ? "border-primary/40 bg-primary/[0.03] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                                    : "border-border"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-6">
                                    <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs">
                                        Recommended
                                    </Badge>
                                </div>
                            )}
                            <CardContent className={cn("space-y-8", plan.popular ? "p-8" : "p-6")}>
                                <div className="space-y-1">
                                    <h2 className={cn("font-bold text-foreground", plan.popular ? "text-2xl" : "text-xl")}>
                                        {plan.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                                </div>

                                <div className="space-y-1">
                                    {plan.price ? (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-medium text-muted-foreground">RM</span>
                                                <span className="text-5xl font-bold tracking-tighter text-foreground tabular-nums">
                                                    {isAnnual ? plan.price.annual : plan.price.monthly}
                                                </span>
                                                <span className="text-sm text-muted-foreground">/mo per branch</span>
                                            </div>
                                            {isAnnual && (
                                                <p className="text-xs text-muted-foreground">{plan.annualTotal}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-foreground">{plan.priceLabel}</span>
                                            <span className="text-sm text-muted-foreground">pricing</span>
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-2.5">
                                    {plan.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-3"
                                            style={{ animationDelay: `${i * 30}ms` }}
                                        >
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            <span className="text-sm text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    asChild
                                    className={cn(
                                        "w-full transition-all duration-200 active:scale-[0.99]",
                                        plan.popular
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                            : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                                    )}
                                >
                                    <Link href={plan.ctaHref}>
                                        {plan.cta}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Feature Comparison */}
                <div
                    className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: "150ms", animationFillMode: "both" }}
                >
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Compare features</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Full breakdown by plan</p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border">
                        <div className="grid grid-cols-[1fr_100px_100px] border-b border-border bg-muted/50 px-6 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Feature
                            </span>
                            <span className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Clinic
                            </span>
                            <span className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Enterprise
                            </span>
                        </div>

                        {comparisonData.map((section, si) => (
                            <div key={si}>
                                <div className="grid grid-cols-[1fr_100px_100px] border-b border-border bg-muted/20 px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <section.icon className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-semibold text-foreground">
                                            {section.category}
                                        </span>
                                    </div>
                                </div>
                                {section.features.map((feature, fi) => (
                                    <div
                                        key={fi}
                                        className={cn(
                                            "grid grid-cols-[1fr_100px_100px] items-center border-b border-border px-6 py-3 last:border-b-0",
                                            fi % 2 === 0 ? "bg-background" : "bg-muted/10"
                                        )}
                                    >
                                        <span className="text-sm text-foreground">{feature.name}</span>
                                        <FeatureCell value={feature.clinic} />
                                        <FeatureCell value={feature.enterprise} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div
                    className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: "200ms", animationFillMode: "both" }}
                >
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Common questions about CuraSync pricing and scope
                        </p>
                    </div>

                    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-background">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:bg-muted/30"
                                >
                                    <span className="pr-4 text-sm font-medium text-foreground">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                            openFaq === i && "rotate-180"
                                        )}
                                    />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-4">
                                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enterprise CTA — left-aligned block */}
                <div
                    className="rounded-xl border border-border bg-muted/20 p-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: "250ms", animationFillMode: "both" }}
                >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 rounded-lg bg-primary/10 p-3">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-foreground">
                                    Need a multi-branch rollout or custom deployment?
                                </h2>
                                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                                    Talk to us about onboarding, migration, reporting requirements,
                                    and operational support for larger clinic teams.
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-3">
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.99]"
                            >
                                <Link href="/contact">
                                    Contact Sales
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" className="transition-all duration-200 active:scale-[0.99]">
                                Schedule Demo
                                <Calendar className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Trust strip */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t pt-8 text-muted-foreground">
                    {[
                        { icon: Shield, label: "Role-based access control" },
                        { icon: Brain, label: "AI symptom analysis" },
                        { icon: ClipboardList, label: "Audit-ready admin logs" },
                        { icon: Bell, label: "Push notifications" },
                        { icon: BarChart3, label: "Usage analytics" },
                        { icon: Building2, label: "Cloud SaaS platform" },
                    ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
