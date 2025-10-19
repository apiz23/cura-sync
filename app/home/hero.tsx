"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle,
    Shield,
    Sparkles,
    Heart,
    Zap,
} from "lucide-react";
import { LightRays } from "@/components/ui/light-rays";

export default function Hero() {
    const [currentFeature, setCurrentFeature] = useState(0);

    const features = [
        {
            icon: <Zap className="h-4 w-4" />,
            text: "Instant AI Analysis",
        },
        {
            icon: <Shield className="h-4 w-4" />,
            text: "HIPAA Secure",
        },
        {
            icon: <Heart className="h-4 w-4" />,
            text: "24/7 Care",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [features.length]);

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background px-4 py-10">
            <LightRays />

            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-16">
                {/* Content */}
                <div className="text-center lg:text-left space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Healthcare Platform
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                            Smart
                            <span className="text-primary block">
                                Health Care
                            </span>
                            That Cares
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Get instant symptom analysis, connect with verified
                            doctors, and manage your health—all in one secure
                            platform.
                        </p>
                    </div>

                    {/* Animated features */}
                    <div className="flex justify-center lg:justify-start items-center space-x-3 py-2">
                        <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-xs">
                            <div className="text-primary">
                                {features[currentFeature].icon}
                            </div>
                            <span className="font-medium text-card-foreground">
                                {features[currentFeature].text}
                            </span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                        <Link href="/symptom-analyzer">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-base py-6 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Start Free Analysis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>

                        <Link href="/how-it-works">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-base py-6 px-8 border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-accent/20"
                            >
                                See How It Works
                            </Button>
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border">
                            <CheckCircle className="h-4 w-4 text-chart-1" />
                            <span>98% Accuracy</span>
                        </div>
                        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border">
                            <Shield className="h-4 w-4 text-chart-2" />
                            <span>Fully Encrypted</span>
                        </div>
                    </div>
                </div>

                {/* Visual element */}
                <div className="relative mx-auto">
                    <div className="relative mx-auto lg:mx-0 max-w-sm lg:max-w-md">
                        {/* Main card */}
                        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border backdrop-blur-sm">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-destructive rounded-full"></div>
                                        <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                                        <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                                    </div>
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Symptom Checker
                                    </div>
                                </div>

                                {/* AI Icon */}
                                <div className="flex justify-center py-2">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-2 rounded-2xl flex items-center justify-center shadow-md">
                                        <Sparkles className="h-8 w-8 text-primary-foreground" />
                                    </div>
                                </div>

                                {/* Input mockup */}
                                <div className="space-y-3">
                                    <div className="bg-muted rounded-lg p-3 border border-border">
                                        <div className="text-sm text-muted-foreground">
                                            {"'"}Headache and fever for 2
                                            days...{"'"}
                                        </div>
                                    </div>

                                    {/* Quick symptoms */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            "Fever",
                                            "Headache",
                                            "Cough",
                                            "Fatigue",
                                        ].map((symptom) => (
                                            <div
                                                key={symptom}
                                                className="bg-secondary rounded-lg p-2 text-center border border-border"
                                            >
                                                <div className="text-xs font-medium text-secondary-foreground">
                                                    {symptom}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Result bar */}
                                <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-chart-2 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-chart-2">
                                                Analysis Ready
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                                <div
                                                    className="bg-chart-2 h-1.5 rounded-full transition-all duration-1000"
                                                    style={{ width: "87%" }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-3 -right-3 bg-card rounded-lg p-2 shadow-md border border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <Shield className="h-3 w-3 text-primary-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-3 -left-3 bg-card rounded-lg p-2 shadow-md border border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-chart-1 rounded-full flex items-center justify-center">
                                    <Zap className="h-3 w-3 text-primary-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="animate-bounce">
                    <div className="w-5 h-8 border border-border rounded-full flex justify-center">
                        <div className="w-0.5 h-2 bg-muted-foreground rounded-full mt-2"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
