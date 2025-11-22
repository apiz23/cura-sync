"use client";

import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageCircle,
    Users,
    Shield,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

    const contactMethods = [
        {
            icon: Phone,
            title: "Phone Support",
            description: "Speak directly with our team",
            contact: "+1 (555) 123-4567",
            hours: "Mon-Fri: 8:00 AM - 6:00 PM EST",
            badge: "Fast Response",
        },
        {
            icon: Mail,
            title: "Email Us",
            description: "Send us a detailed message",
            contact: "support@curasync.com",
            hours: "Typically reply within 2 hours",
            badge: "Preferred",
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Instant messaging support",
            contact: "Start Chat",
            hours: "24/7 Available",
            badge: "Instant",
        },
    ];

    const faqs = [
        {
            question: "How secure is my health data?",
            answer: "All health data is encrypted end-to-end and compliant with HIPAA regulations. We never share your information without explicit consent.",
        },
        {
            question: "Can I contact for medical emergencies?",
            answer: "No, for medical emergencies please call emergency services immediately. Our support is for platform and non-urgent health inquiries only.",
        },
        {
            question: "Do you offer technical support?",
            answer: "Yes, our technical support team is available 24/7 to help with any platform issues, account problems, or feature questions.",
        },
        {
            question: "How do I reset my password?",
            answer: "You can reset your password from the login page by clicking 'Forgot Password' or contact us for immediate assistance.",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setLoading(false);
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-8 px-4">
            <div className="max-w-6xl mx-auto space-y-12 pt-8">
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-primary rounded-3xl shadow-lg">
                            <MessageCircle className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold text-foreground">
                                Contact CuraSync
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Get in touch with our support team. We{"'"}re here
                                to help you with any questions about our health
                                platform.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {submitted && (
                    <Card className="border-border shadow-lg bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-foreground">
                                        Message Sent Successfully!
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Thank you for contacting us. We{"'"}ll get
                                        back to you within 2 hours.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Methods */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-border shadow-lg">
                            <CardContent className="p-6 space-y-6">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Contact Methods
                                </h2>

                                {contactMethods.map((method, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 p-4 bg-muted rounded-xl border border-border"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-accent rounded-lg">
                                                    <method.icon className="h-4 w-4 text-accent-foreground" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {method.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {method.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="bg-primary/10 text-primary"
                                            >
                                                {method.badge}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-foreground">
                                                {method.contact}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {method.hours}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Office Information */}
                        <Card className="border-border shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Our Office
                                </h2>

                                <div className="space-y-3">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="font-medium text-foreground">
                                            CuraSync Headquarters
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            123 Healthcare Avenue
                                            <br />
                                            San Francisco, CA 94102
                                            <br />
                                            United States
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Business Hours: Mon-Fri, 9:00 AM - 5:00
                                        PM PST
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-border shadow-lg">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-foreground">
                                            Send us a Message
                                        </h2>
                                        <p className="text-muted-foreground">
                                            Fill out the form below and we{"'"}ll
                                            get back to you as soon as possible.
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="name"
                                                    className="text-sm font-medium text-foreground"
                                                >
                                                    Full Name *
                                                </label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your full name"
                                                    className="bg-input border-border focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="email"
                                                    className="text-sm font-medium text-foreground"
                                                >
                                                    Email Address *
                                                </label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email"
                                                    className="bg-input border-border focus:border-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="subject"
                                                className="text-sm font-medium text-foreground"
                                            >
                                                Subject *
                                            </label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                placeholder="What is this regarding?"
                                                className="bg-input border-border focus:border-primary"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="message"
                                                className="text-sm font-medium text-foreground"
                                            >
                                                Message *
                                            </label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                required
                                                rows={6}
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                placeholder="Please describe your inquiry in detail..."
                                                className="bg-input border-border focus:border-primary resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className={cn(
                                                "w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg",
                                                "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl transform hover:scale-[1.02]",
                                                loading &&
                                                    "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                    Sending Message...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-3 h-5 w-5" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>

                        {/* FAQ Section */}
                        <Card className="border-border shadow-lg mt-8">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                        <MessageCircle className="h-6 w-6 text-primary" />
                                        Frequently Asked Questions
                                    </h2>

                                    <div className="space-y-4">
                                        {faqs.map((faq, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-muted rounded-xl border border-border"
                                            >
                                                <h3 className="font-semibold text-foreground mb-2">
                                                    {faq.question}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Security Notice */}
                <Card className="border-border shadow-lg bg-card">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-accent rounded-lg flex-shrink-0">
                                <Shield className="h-5 w-5 text-accent-foreground" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-foreground">
                                    Your Privacy and Security Matter
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    All communications are encrypted and secure.
                                    We adhere to strict healthcare privacy
                                    standards including HIPAA compliance. Your
                                    personal and health information is protected
                                    with the highest level of security measures.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                        <div className="p-2 bg-accent rounded-lg">
                            <Shield className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <span className="text-sm font-medium">
                            HIPAA Compliant • End-to-End Encrypted • 24/7
                            Support
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        For medical emergencies, please call 911 or your local
                        emergency services immediately. This contact form is not
                        intended for urgent medical concerns.
                    </p>
                </div>
            </div>
        </div>
    );
}
