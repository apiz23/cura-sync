"use client";

import {
    Mail,
    Sparkles,
    Zap,
    CheckCircle,
    Shield,
    Activity,
    Users,
    Brain,
    Cloud,
    Lock,
    BarChart,
    ArrowRight,
    Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageTitle from "@/components/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Page() {
    const featureCards = [
        {
            icon: <Activity className="h-6 w-6" />,
            title: "Real-time Sync",
            description:
                "Instant patient data synchronization across all devices",
            bgColor: "bg-chart-1/10",
            textColor: "text-chart-1",
        },
        {
            icon: <Brain className="h-6 w-6" />,
            title: "AI Insights",
            description: "Clinical decision support powered by advanced AI",
            bgColor: "bg-chart-2/10",
            textColor: "text-chart-2",
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Team Collaboration",
            description: "Seamless communication between healthcare providers",
            bgColor: "bg-chart-3/10",
            textColor: "text-chart-3",
        },
        {
            icon: <Cloud className="h-6 w-6" />,
            title: "Cloud Native",
            description: "Secure, scalable infrastructure built for healthcare",
            bgColor: "bg-chart-4/10",
            textColor: "text-chart-4",
        },
    ];

    const benefits = [
        {
            icon: <Lock className="h-5 w-5" />,
            title: "HIPAA Compliant",
            description: "Enterprise-grade security and compliance",
        },
        {
            icon: <Zap className="h-5 w-5" />,
            title: "Fast Implementation",
            description: "Get started in days, not months",
        },
        {
            icon: <BarChart className="h-5 w-5" />,
            title: "Analytics Dashboard",
            description: "Comprehensive insights and reporting",
        },
        {
            icon: <Heart className="h-5 w-5" />,
            title: "Patient Focused",
            description: "Designed for better patient outcomes",
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/5">
            <PageTitle title="Home" />

            {/* Hero Section */}
            <section className="relative py-28 px-4 sm:px-6 lg:px-8">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-chart-2/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-chart-4/5 rounded-full blur-3xl opacity-30" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="text-center space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Next Generation Healthcare Platform
                            </span>
                        </div>

                        {/* Main Title */}
                        <div className="space-y-6">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight serif">
                                CuraSync
                                <span className="block bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                                    Platform
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Revolutionizing healthcare collaboration with
                                real-time patient data synchronization and
                                AI-powered clinical insights
                            </p>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                            {featureCards.map((feature, index) => (
                                <Card
                                    key={index}
                                    className="bg-card/60 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 rounded-2xl"
                                >
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div
                                                className={`p-3 rounded-xl ${feature.bgColor} w-fit`}
                                            >
                                                <div
                                                    className={
                                                        feature.textColor
                                                    }
                                                >
                                                    {feature.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2 text-foreground">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Button
                                size="lg"
                                className="gap-2 px-8 py-6 text-base rounded-xl bg-linear-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                            >
                                <Mail className="h-5 w-5" />
                                Get Started for Free
                            </Button>
                            <Link href="/symptom-analyzer">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 px-8 py-6 text-base rounded-xl border-2 border-border hover:border-primary/40 hover:bg-accent transition-all"
                                >
                                    View Live Demo
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center gap-3 pt-12">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 bg-card/40 backdrop-blur-sm rounded-full px-4 py-2 border border-border/30"
                                >
                                    <div className="p-1.5 bg-primary/10 rounded-full">
                                        <div className="text-primary">
                                            {benefit.icon}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-foreground">
                                            {benefit.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-muted/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                label: "Healthcare Providers",
                                value: "500+",
                                color: "text-chart-1",
                            },
                            {
                                label: "Patient Records",
                                value: "1M+",
                                color: "text-chart-2",
                            },
                            {
                                label: "AI Insights",
                                value: "99.9%",
                                color: "text-chart-3",
                            },
                            {
                                label: "Uptime",
                                value: "99.99%",
                                color: "text-chart-4",
                            },
                        ].map((stat, index) => (
                            <Card
                                key={index}
                                className="bg-card/60 backdrop-blur-sm border border-border/30 shadow-xs rounded-xl"
                            >
                                <CardContent className="p-6 text-center">
                                    <div
                                        className={`text-2xl md:text-3xl font-bold mb-1 ${stat.color}`}
                                    >
                                        {stat.value}
                                    </div>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {stat.label}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="space-y-4">
                        <Badge
                            variant="outline"
                            className="px-4 py-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                        >
                            Why Choose CuraSync
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                            Transform Your Healthcare Practice
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground">
                            Our platform brings together the best of technology
                            and healthcare to deliver unparalleled efficiency
                            and patient care
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Save Time",
                                description:
                                    "Reduce administrative tasks by 40% with automated workflows",
                                icon: <Zap className="h-7 w-7 text-chart-1" />,
                                bgColor: "bg-chart-1/10",
                            },
                            {
                                title: "Improve Care",
                                description:
                                    "Access comprehensive patient data instantly for better decisions",
                                icon: (
                                    <Heart className="h-7 w-7 text-chart-2" />
                                ),
                                bgColor: "bg-chart-2/10",
                            },
                            {
                                title: "Ensure Security",
                                description:
                                    "Bank-level security with full HIPAA compliance",
                                icon: (
                                    <Shield className="h-7 w-7 text-chart-3" />
                                ),
                                bgColor: "bg-chart-3/10",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="space-y-4 p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/30 shadow-sm"
                            >
                                <div
                                    className={`p-3 rounded-xl ${item.bgColor} w-fit mx-auto`}
                                >
                                    {item.icon}
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-foreground">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary/5 via-chart-2/5 to-chart-4/5">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                            Ready to Transform Your Practice?
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground">
                            Join thousands of healthcare providers who trust
                            CuraSync
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="gap-2 px-8 py-6 text-base rounded-xl bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg hover:shadow-xl"
                        >
                            <Mail className="h-5 w-5" />
                            Schedule a Demo
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="gap-2 px-8 py-6 text-base rounded-xl border-2 border-border hover:border-primary/40 hover:bg-accent"
                        >
                            Learn More
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        No credit card required • 14-day free trial • Cancel
                        anytime
                    </p>
                </div>
            </section>

            {/* Scroll Indicator */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
                <div className="flex flex-col items-center gap-1">
                    <div className="animate-bounce">
                        <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                    </div>
                    <p className="text-xs text-muted-foreground/70 font-medium">
                        Scroll to explore
                    </p>
                </div>
            </div>
        </div>
    );
}
