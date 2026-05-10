"use client";

import {
    Check,
    Star,
    Zap,
    Crown,
    Sparkles,
    Shield,
    Users,
    Clock,
    Heart,
    BadgeCheck,
    ArrowRight,
    Calendar,
    X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import PageTitle from "@/components/page-title";

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: "Basic",
            description: "Essential health tracking for individuals",
            icon: Heart,
            price: {
                monthly: 9,
                annual: 7,
            },
            popular: false,
            features: [
                "Symptom tracking & analysis",
                "Basic health insights",
                "7-day history retention",
                "Standard support",
                "Mobile app access",
                "Basic health reports",
            ],
            cta: "Get Started",
            color: "border-border",
        },
        {
            name: "Professional",
            description: "Advanced features for health-conscious individuals",
            icon: Zap,
            price: {
                monthly: 29,
                annual: 24,
            },
            popular: true,
            features: [
                "Everything in Basic",
                "AI-powered health analysis",
                "30-day history retention",
                "Priority support",
                "Advanced health reports",
                "Medication tracking",
                "Health trend analysis",
                "Export health data",
            ],
            cta: "Start Free Trial",
            color: "border-primary",
        },
        {
            name: "Enterprise",
            description: "Comprehensive health management for organizations",
            icon: Crown,
            price: {
                monthly: 79,
                annual: 65,
            },
            popular: false,
            features: [
                "Everything in Professional",
                "Unlimited history retention",
                "24/7 dedicated support",
                "Custom health metrics",
                "Team management",
                "API access",
                "White-label solutions",
                "Admin controls",
                "Custom integrations",
                "Dedicated account manager",
            ],
            cta: "Contact Sales",
            color: "border-border",
        },
    ];

    const features = [
        {
            category: "Health Tracking",
            icon: Heart,
            items: [
                {
                    name: "Symptom Checker",
                    basic: true,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Medication Tracking",
                    basic: false,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Vital Signs Monitoring",
                    basic: true,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Health History",
                    basic: "7 days",
                    pro: "30 days",
                    enterprise: "Unlimited",
                },
            ],
        },
        {
            category: "AI Features",
            icon: Sparkles,
            items: [
                {
                    name: "Basic Health Insights",
                    basic: true,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "AI-Powered Analysis",
                    basic: false,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Predictive Health Trends",
                    basic: false,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Custom AI Models",
                    basic: false,
                    pro: false,
                    enterprise: true,
                },
            ],
        },
        {
            category: "Support & Security",
            icon: Shield,
            items: [
                {
                    name: "Standard Support",
                    basic: true,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Priority Support",
                    basic: false,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "24/7 Dedicated Support",
                    basic: false,
                    pro: false,
                    enterprise: true,
                },
                {
                    name: "Access Controls",
                    basic: true,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Deployment guidance",
                    basic: true,
                    pro: true,
                    enterprise: true,
                },
            ],
        },
        {
            category: "Advanced Features",
            icon: Zap,
            items: [
                {
                    name: "Mobile App Access",
                    basic: true,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "Data Export",
                    basic: false,
                    pro: true,
                    enterprise: true,
                },
                {
                    name: "API Access",
                    basic: false,
                    pro: false,
                    enterprise: true,
                },
                {
                    name: "White-label Solutions",
                    basic: false,
                    pro: false,
                    enterprise: true,
                },
                {
                    name: "Team Management",
                    basic: false,
                    pro: false,
                    enterprise: true,
                },
            ],
        },
    ];

    const faqs = [
        {
            question: "Can I change plans later?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
        },
        {
            question: "Is there a free trial?",
            answer: "Yes, the Professional plan includes a 14-day free trial. No credit card required.",
        },
        {
            question: "Do you offer discounts for students or nonprofits?",
            answer: "We offer special pricing for students, educational institutions, and nonprofit organizations. Contact our sales team.",
        },
        {
            question: "How secure is my health data?",
            answer: "We design the product with privacy and controlled access in mind. Contact us if you need details about your deployment and security setup.",
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, PayPal, and for Enterprise plans, we also accept bank transfers.",
        },
    ];

    const FeatureIcon = ({ available }: { available: boolean | string }) => {
        if (typeof available === "boolean") {
            return available ? (
                <Check className="h-5 w-5 text-primary" />
            ) : (
                <X className="h-5 w-5 text-muted-foreground" />
            );
        }
        return (
            <span className="text-sm font-medium text-foreground">
                {available}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-8 px-4">
            <PageTitle title={"Pricing"} />
            <div className="max-w-7xl mx-auto space-y-16 pt-8">
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-primary rounded-3xl shadow-lg">
                            <Sparkles className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div className="space-y-3">
                            <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary px-4 py-1"
                            >
                                Transparent Pricing
                            </Badge>
                            <h1 className="text-4xl font-bold text-foreground">
                                Choose Your Plan
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Simple, transparent pricing for every need.
                                Start with a free trial and upgrade as you grow.
                            </p>
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span
                            className={cn(
                                "font-medium",
                                !isAnnual && "text-foreground"
                            )}
                        >
                            Monthly
                        </span>
                        <Switch
                            checked={isAnnual}
                            onCheckedChange={setIsAnnual}
                            className="data-[state=checked]:bg-primary"
                        />
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "font-medium",
                                    isAnnual && "text-foreground"
                                )}
                            >
                                Annual
                            </span>
                            <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary"
                            >
                                Save 20%
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={cn(
                                "border-2 relative transition-all duration-300 hover:shadow-xl",
                                plan.popular && "ring-2 ring-primary",
                                plan.color
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground px-4 py-1 flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-current" />
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            <CardContent className="p-8 space-y-8">
                                {/* Header */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "p-3 rounded-xl",
                                                plan.popular
                                                    ? "bg-primary"
                                                    : "bg-accent"
                                            )}
                                        >
                                            <plan.icon
                                                className={cn(
                                                    "h-6 w-6",
                                                    plan.popular
                                                        ? "text-primary-foreground"
                                                        : "text-accent-foreground"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground">
                                                {plan.name}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {plan.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-foreground">
                                                $
                                                {isAnnual
                                                    ? plan.price.annual
                                                    : plan.price.monthly}
                                            </span>
                                            <span className="text-muted-foreground">
                                                /month
                                            </span>
                                        </div>
                                        {isAnnual && (
                                            <p className="text-sm text-muted-foreground">
                                                Billed annually ($
                                                {plan.price.annual * 12})
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-4">
                                    <ul className="space-y-3">
                                        {plan.features.map(
                                            (feature, featureIndex) => (
                                                <li
                                                    key={featureIndex}
                                                    className="flex items-start gap-3"
                                                >
                                                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                                    <span className="text-foreground">
                                                        {feature}
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <Button
                                    className={cn(
                                        "w-full py-3 text-lg font-semibold rounded-xl transition-all duration-200",
                                        plan.popular
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                            : "bg-accent hover:bg-accent/90 text-accent-foreground"
                                    )}
                                >
                                    {plan.cta}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Feature Comparison Cards */}
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-foreground">
                            Compare Features
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Detailed feature breakdown across all plans
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {features.map((category, categoryIndex) => (
                            <Card
                                key={categoryIndex}
                                className="border-border shadow-lg"
                            >
                                <CardContent className="p-6">
                                    {/* Category Header */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-accent rounded-lg">
                                            <category.icon className="h-5 w-5 text-accent-foreground" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground">
                                            {category.category}
                                        </h3>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        {category.items.map(
                                            (item, itemIndex) => (
                                                <div
                                                    key={itemIndex}
                                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                                                >
                                                    <span className="font-medium text-foreground text-sm">
                                                        {item.name}
                                                    </span>
                                                    <div className="flex items-center gap-6">
                                                        {/* Basic */}
                                                        <div
                                                            className={cn(
                                                                "flex items-center justify-center w-8 h-8 rounded",
                                                                item.basic ===
                                                                    true
                                                                    ? "bg-primary/10"
                                                                    : "bg-muted"
                                                            )}
                                                        >
                                                            <FeatureIcon
                                                                available={
                                                                    item.basic
                                                                }
                                                            />
                                                        </div>

                                                        {/* Professional */}
                                                        <div
                                                            className={cn(
                                                                "flex items-center justify-center w-8 h-8 rounded",
                                                                item.pro ===
                                                                    true
                                                                    ? "bg-primary/10"
                                                                    : "bg-muted"
                                                            )}
                                                        >
                                                            <FeatureIcon
                                                                available={
                                                                    item.pro
                                                                }
                                                            />
                                                        </div>

                                                        {/* Enterprise */}
                                                        <div
                                                            className={cn(
                                                                "flex items-center justify-center w-8 h-8 rounded",
                                                                item.enterprise ===
                                                                    true
                                                                    ? "bg-primary/10"
                                                                    : "bg-muted"
                                                            )}
                                                        >
                                                            <FeatureIcon
                                                                available={
                                                                    item.enterprise
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {/* Plan Legend */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                                        <span className="text-xs text-muted-foreground">
                                            Plans:
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                                                <span className="text-xs text-muted-foreground">
                                                    Basic
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                <span className="text-xs text-muted-foreground">
                                                    Pro
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-foreground rounded-full"></div>
                                                <span className="text-xs text-muted-foreground">
                                                    Enterprise
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-foreground">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to know about our pricing and
                            plans
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {faqs.map((faq, index) => (
                            <Card
                                key={index}
                                className="border-border shadow-lg"
                            >
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-foreground mb-3">
                                        {faq.question}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Enterprise CTA */}
                <Card className="border-primary shadow-2xl bg-linear-to-r from-primary/5 to-primary/10">
                    <CardContent className="p-12 text-center">
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="flex justify-center">
                                <div className="p-4 bg-primary rounded-2xl">
                                    <Users className="h-8 w-8 text-primary-foreground" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-foreground">
                                    Need a Custom Solution?
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Contact our sales team for custom enterprise
                                    pricing, volume discounts, and specialized
                                    healthcare solutions.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                                >
                                    Contact Sales
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-primary text-primary hover:bg-primary/10"
                                >
                                    Schedule Demo
                                    <Calendar className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Footer */}
                <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Privacy-minded setup
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Team admin controls
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Ongoing support
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Contact us for details about deployment, access control,
                        and operational support for your team.
                    </p>
                </div>
            </div>
        </div>
    );
}
