"use client";

import {
    Building2,
    CheckCircle2,
    Clock,
    HeartPulse,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    Shield,
    Stethoscope,
    Users,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import PageTitle from "@/components/page-title";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const INQUIRY_TYPES = [
    { value: "general", label: "General", icon: MessageCircle },
    { value: "sales", label: "Sales / Pricing", icon: Building2 },
    { value: "support", label: "Technical Support", icon: Zap },
    { value: "partnership", label: "Partnership", icon: Users },
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number]["value"];

const faqs = [
    {
        question: "How do I get started with CuraSync for my clinic?",
        answer: "Register your clinic at our partner onboarding page. Setup takes under 10 minutes — no hardware required. Our team will reach out within one business day to confirm your account.",
    },
    {
        question: "Which subscription plan is right for my clinic?",
        answer: "The Clinic plan covers most independent practices with up to 10 staff. For larger multi-branch networks or custom EHR integrations, choose Enterprise. Contact our sales team for a walkthrough.",
    },
    {
        question: "How do you handle patient health information?",
        answer: "All patient data is encrypted at rest and in transit. Health records are tied to your facility and never shared across clinics. Audit logs track every access event.",
    },
    {
        question: "Can I use this form for medical emergencies?",
        answer: "No. For urgent medical concerns, contact emergency services or a healthcare provider immediately. This form is for platform and product enquiries only.",
    },
    {
        question: "Do you offer technical support for staff?",
        answer: "Yes. Our support team handles platform questions, account access, appointment scheduling issues, and mobile app help. Clinic plan subscribers receive priority response.",
    },
    {
        question: "How do I reset my password?",
        answer: "Use the password reset flow on the login page. If you're a clinic staff member locked out of your account, ask your facility admin or contact our support team.",
    },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [inquiryType, setInquiryType] = useState<InquiryType>("general");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitted(false);

        const sendPromise = fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, inquiryType }),
        }).then(async (res) => {
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error || "Failed to send message");
            return data;
        });

        toast.promise(sendPromise, {
            loading: "Sending message...",
            success: "Message sent successfully",
            error: (error) =>
                error instanceof Error ? error.message : "Failed to send message",
        });

        try {
            await sendPromise;
            setSubmitted(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
            setInquiryType("general");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="public-grid-page public-dot-page px-4 pb-16 pt-20">
            <PageTitle title="Contact" />
            <div className="public-page-content mx-auto max-w-6xl space-y-14 pt-8">

                {/* Hero — left-aligned split, not centered */}
                <div className="public-text-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <BrandLogo className="h-12 w-12 shrink-0" imageClassName="p-1" />
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    CuraSync
                                </p>
                                <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
                                    Get in touch
                                </h1>
                            </div>
                        </div>
                        <p className="max-w-md pl-[60px] text-base leading-relaxed text-muted-foreground">
                            Questions about pricing, clinic onboarding, or technical support
                            — our team follows up within one business day.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
                            <HeartPulse className="h-3 w-3" />
                            Healthcare platform
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                            <Shield className="h-3 w-3" />
                            Secure &amp; private
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                            <Clock className="h-3 w-3" />
                            Replies in 1 business day
                        </Badge>
                    </div>
                </div>

                {/* Success banner */}
                {submitted && (
                    <Card className="border-primary/30 bg-primary/5">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Message sent</p>
                                <p className="text-xs text-muted-foreground">
                                    Our team will follow up within one business day.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Sidebar */}
                    <div className="space-y-5">
                        <Card
                            className="border animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "0ms", animationFillMode: "both" }}
                        >
                            <CardContent className="space-y-1 p-6">
                                <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    <Stethoscope className="h-3.5 w-3.5" />
                                    Contact channels
                                </h2>
                                <div className="divide-y divide-border">
                                    {[
                                        {
                                            icon: Mail,
                                            title: "Email support",
                                            description: "support@curasync.health",
                                            meta: "Reply within one business day",
                                        },
                                        {
                                            icon: Phone,
                                            title: "Phone",
                                            description: "+60 3-1234 5678",
                                            meta: "Mon–Fri, 9 AM – 6 PM MYT",
                                        },
                                        {
                                            icon: MessageCircle,
                                            title: "Live chat",
                                            description: "Chat with us",
                                            meta: "Clinic & Enterprise plans",
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.title}
                                            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 shrink-0">
                                                <item.icon className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-foreground">
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-foreground">{item.description}</p>
                                                <p className="text-xs text-muted-foreground">{item.meta}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="border animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "80ms", animationFillMode: "both" }}
                        >
                            <CardContent className="space-y-1 p-6">
                                <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    <Zap className="h-3.5 w-3.5" />
                                    Response times
                                </h2>
                                <div className="divide-y divide-border">
                                    {[
                                        { label: "General enquiries", time: "1 business day" },
                                        { label: "Technical support", time: "4 hrs (Clinic/Enterprise)" },
                                        { label: "Sales & onboarding", time: "Same day" },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                                        >
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {item.time}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="border animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "160ms", animationFillMode: "both" }}
                        >
                            <CardContent className="p-6">
                                <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Office
                                </h2>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-semibold text-foreground">CuraSync Sdn. Bhd.</p>
                                    <p className="text-sm text-muted-foreground">Kuala Lumpur, Malaysia</p>
                                    <div className="flex items-center gap-1.5 pt-1.5">
                                        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                                        <span className="text-xs text-muted-foreground">
                                            Mon–Fri, 9 AM – 6 PM MYT
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                                    Onboarding visits by appointment only — schedule via email first.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main column */}
                    <div className="space-y-8 lg:col-span-2">
                        <Card
                            className="border animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "100ms", animationFillMode: "both" }}
                        >
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Send a message</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Our team will get back to you as soon as possible.
                                        </p>
                                    </div>

                                    {/* Inquiry type */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">
                                            Inquiry type
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {INQUIRY_TYPES.map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setInquiryType(value)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all duration-200 active:scale-[0.98]",
                                                        inquiryType === value
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">
                                                    Full name
                                                </label>
                                                <Input
                                                    required
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData((p) => ({ ...p, name: e.target.value }))
                                                    }
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">
                                                    Email address
                                                </label>
                                                <Input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData((p) => ({ ...p, email: e.target.value }))
                                                    }
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">
                                                Subject
                                            </label>
                                            <Input
                                                required
                                                name="subject"
                                                value={formData.subject}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, subject: e.target.value }))
                                                }
                                                placeholder="What is this regarding?"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">
                                                Message
                                            </label>
                                            <Textarea
                                                required
                                                rows={6}
                                                name="message"
                                                value={formData.message}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, message: e.target.value }))
                                                }
                                                placeholder="Describe your question or request in detail..."
                                                className="resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                            className="w-full transition-all duration-200 active:scale-[0.99]"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="border animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "200ms", animationFillMode: "both" }}
                        >
                            <CardContent className="space-y-5 p-8">
                                <h2 className="text-lg font-bold text-foreground">
                                    Frequently asked questions
                                </h2>
                                <Accordion
                                    type="single"
                                    collapsible
                                    defaultValue="faq-0"
                                    className="rounded-xl border bg-muted/30 px-4"
                                >
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={faq.question} value={`faq-${index}`}>
                                            <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer disclaimer */}
                <Card
                    className="border animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: "300ms", animationFillMode: "both" }}
                >
                    <CardContent className="flex items-start gap-4 p-5">
                        <div className="mt-0.5 rounded-lg bg-destructive/10 p-2 shrink-0">
                            <Shield className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-semibold text-foreground">
                                Not for medical emergencies
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This form is for platform and product enquiries only. For urgent medical
                                concerns, call emergency services (999) or visit your nearest clinic
                                immediately.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Badge variant="secondary">Non-emergency channel</Badge>
                                <Badge variant="secondary">Product &amp; account help</Badge>
                                <Badge variant="secondary">Clinic onboarding enquiries</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
