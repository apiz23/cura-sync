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
        answer: "CuraSync integrates wearable health data through the mobile app's Health Connect interface, capturing synced metrics such as steps, sleep sessions, and heart rate. This data feeds the patient and clinical dashboards for longitudinal tracking and care coordination. Continuous real-time alert streaming is on the product roadmap for future releases.",
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
        answer: "Yes. The admin dashboard includes a usage analytics section showing appointment trends over the past six months, total patients seen, and staff breakdown by role. This gives clinic managers an at-a-glance view of operational activity.",
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
        <Check className="h-4 w-4 text-primary mx-auto" />
    ) : (
        <X className="h-4 w-4 text-muted-foreground mx-auto" />
    );
}

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-background pt-20 pb-16 px-4">
            <PageTitle title="Pricing" />
            <div className="max-w-5xl mx-auto space-y-20 pt-10">

                {/* Header */}
                <div className="space-y-6 max-w-2xl">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Clinic pricing
                    </Badge>
                    <h1 className="text-4xl font-bold text-foreground leading-tight">
                        Pricing built for real clinic workflows
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Appointments, patient records, medications, AI symptom
                        analysis, and audit-ready admin controls in one platform.
                        Priced per branch, not per user.
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                        <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
                            Monthly
                        </span>
                        <Switch
                            checked={isAnnual}
                            onCheckedChange={setIsAnnual}
                            className="data-[state=checked]:bg-primary"
                        />
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                                Annual
                            </span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                Save ~17%
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={cn(
                                "relative border transition-shadow duration-200",
                                plan.popular
                                    ? "ring-2 ring-primary border-primary/30"
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
                            <CardContent className="p-8 space-y-8">
                                {/* Plan header */}
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {plan.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="space-y-1">
                                    {plan.price ? (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-medium text-muted-foreground">RM</span>
                                                <span className="text-5xl font-bold text-foreground tabular-nums">
                                                    {isAnnual ? plan.price.annual : plan.price.monthly}
                                                </span>
                                                <span className="text-sm text-muted-foreground">/mo per branch</span>
                                            </div>
                                            {isAnnual && (
                                                <p className="text-xs text-muted-foreground">
                                                    {plan.annualTotal}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-foreground">
                                                {plan.priceLabel}
                                            </span>
                                            <span className="text-sm text-muted-foreground">pricing</span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <span className="text-sm text-foreground">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Button
                                    asChild
                                    className={cn(
                                        "w-full",
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
                <div className="space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-foreground">
                            Compare features
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Full breakdown by plan
                        </p>
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_100px_100px] bg-muted/50 px-6 py-3 border-b border-border">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Feature
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
                                Clinic
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
                                Enterprise
                            </span>
                        </div>

                        {comparisonData.map((section, si) => (
                            <div key={si}>
                                {/* Category row */}
                                <div className="grid grid-cols-[1fr_100px_100px] px-6 py-3 bg-muted/20 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <section.icon className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-semibold text-foreground">
                                            {section.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Feature rows */}
                                {section.features.map((feature, fi) => (
                                    <div
                                        key={fi}
                                        className={cn(
                                            "grid grid-cols-[1fr_100px_100px] px-6 py-3 border-b border-border last:border-b-0 items-center",
                                            fi % 2 === 0 ? "bg-background" : "bg-muted/10"
                                        )}
                                    >
                                        <span className="text-sm text-foreground">
                                            {feature.name}
                                        </span>
                                        <FeatureCell value={feature.clinic} />
                                        <FeatureCell value={feature.enterprise} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-foreground">
                            Frequently asked questions
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Common questions about CuraSync pricing and scope
                        </p>
                    </div>

                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-background">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors duration-150"
                                >
                                    <span className="text-sm font-medium text-foreground pr-4">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                                            openFaq === i && "rotate-180"
                                        )}
                                    />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enterprise CTA */}
                <div className="rounded-xl border border-border bg-muted/20 p-10 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground">
                                Need a multi-branch rollout or custom deployment?
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                                Talk to us about onboarding, migration, reporting
                                requirements, and operational support for larger
                                clinic teams.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pl-16">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Contact Sales
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline">
                            Schedule Demo
                            <Calendar className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Trust footer */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground pb-4">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Role-based access control</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span className="text-sm">AI symptom analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        <span className="text-sm">Audit-ready admin logs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="text-sm">Push notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm">Usage analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">Cloud SaaS platform</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
