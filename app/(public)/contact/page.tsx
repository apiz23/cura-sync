"use client";

import {
    CheckCircle2,
    Clock,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    Shield,
    Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const faqs = [
        {
            question: "How do you handle health information?",
            answer: "We aim to handle information carefully and can share current product details if you contact our team.",
        },
        {
            question: "Can I use this form for medical emergencies?",
            answer: "No. For urgent medical concerns, contact emergency services or a local healthcare provider immediately.",
        },
        {
            question: "Do you offer technical support?",
            answer: "Yes. Our support team can help with platform questions, account access, and product issues.",
        },
        {
            question: "How do I reset my password?",
            answer: "Use the password reset flow from the login page or contact support if you need help.",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitted(false);

        const sendPromise = fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        }).then(async (res) => {
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(data?.error || "Failed to send message");
            }
            return data;
        });

        toast.promise(sendPromise, {
            loading: "Sending message...",
            success: "Message sent successfully",
            error: (error) =>
                error instanceof Error
                    ? error.message
                    : "Failed to send message",
        });

        try {
            await sendPromise;
            setSubmitted(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background px-4 pb-8 pt-20">
            <PageTitle title="Contact" />
            <div className="mx-auto max-w-6xl space-y-12 pt-8">
                <div className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
                        <MessageCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold text-foreground">
                            Contact CuraSync
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Reach out for product questions, account help, or support with the platform.
                        </p>
                    </div>
                </div>

                {submitted ? (
                    <Card className="border shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Message sent successfully
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Thanks for reaching out. We will respond as soon as we can.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardContent className="space-y-4 p-6">
                                <h2 className="flex items-center gap-2 text-xl font-semibold">
                                    <Users className="h-5 w-5 text-primary" />
                                    Contact methods
                                </h2>

                                {[
                                    {
                                        icon: Phone,
                                        title: "Phone support",
                                        description: "+1 (555) 123-4567",
                                        meta: "Mon-Fri: 8:00 AM - 6:00 PM EST",
                                    },
                                    {
                                        icon: Mail,
                                        title: "Email us",
                                        description: "support@curasync.com",
                                        meta: "We usually reply within a few business hours.",
                                    },
                                    {
                                        icon: MessageCircle,
                                        title: "Live chat",
                                        description: "Start chat",
                                        meta: "For product and support questions.",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border bg-muted/40 p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-accent p-2">
                                                <item.icon className="h-4 w-4 text-accent-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-foreground">
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-foreground">
                                                    {item.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.meta}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="space-y-4 p-6">
                                <h2 className="flex items-center gap-2 text-xl font-semibold">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Our office
                                </h2>
                                <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground">
                                        CuraSync Headquarters
                                    </p>
                                    <p className="mt-2">
                                        123 Healthcare Avenue
                                        <br />
                                        San Francisco, CA 94102
                                        <br />
                                        United States
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Mon-Fri, 9:00 AM - 5:00 PM PST</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8 lg:col-span-2">
                        <Card className="border shadow-sm">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-foreground">
                                            Send us a message
                                        </h2>
                                        <p className="text-muted-foreground">
                                            Share your question and our team will follow up.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">
                                                    Full name
                                                </label>
                                                <Input
                                                    required
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            name: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Enter your full name"
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
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            email: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Enter your email"
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
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        subject: e.target.value,
                                                    }))
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
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        message: e.target.value,
                                                    }))
                                                }
                                                placeholder="Describe your question in detail..."
                                                className="resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className={cn(
                                                "w-full text-lg",
                                                loading && "opacity-50"
                                            )}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Sending message...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-5 w-5" />
                                                    Send message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="space-y-6 p-8">
                                <h2 className="text-2xl font-bold text-foreground">
                                    Frequently asked questions
                                </h2>
                                <Accordion
                                    type="single"
                                    collapsible
                                    defaultValue="faq-0"
                                    className="rounded-xl border bg-muted/30 px-4"
                                >
                                    {faqs.map((faq, index) => (
                                        <AccordionItem
                                            key={faq.question}
                                            value={`faq-${index}`}
                                        >
                                            <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline">
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

                <Card className="border shadow-sm">
                    <CardContent className="flex items-start gap-4 p-6">
                        <div className="rounded-lg bg-accent p-2">
                            <Shield className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-semibold text-foreground">
                                Important reminder
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This contact form is not for urgent medical concerns. For emergencies,
                                call local emergency services immediately.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Badge variant="secondary">Privacy-conscious support</Badge>
                                <Badge variant="secondary">Non-emergency contact channel</Badge>
                                <Badge variant="secondary">Product and account help</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
