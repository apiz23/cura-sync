"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Shield, Clock, Sparkles } from "lucide-react";

export default function Hero() {
    const [currentFeature, setCurrentFeature] = useState(0);

    const features = [
        {
            icon: <Sparkles className="h-5 w-5" />,
            text: "AI-Powered Symptom Analysis",
        },
        {
            icon: <Shield className="h-5 w-5" />,
            text: "Secure Medical Records",
        },
        {
            icon: <Clock className="h-5 w-5" />,
            text: "24/7 Health Assistance",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [features.length]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent rounded-full opacity-10 blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-24 md:pt-32 px-4 sm:px-6 lg:px-8">
                {/* Content */}
                <div className="text-center lg:text-left space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                            Your Personal
                            <span className="text-primary block">
                                Health Companion
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                            AI-powered healthcare that understands you. Get
                            instant symptom analysis and connect with verified
                            medical professionals.
                        </p>
                    </div>

                    {/* Animated feature highlight */}
                    <div className="flex justify-center lg:justify-start items-center space-x-2 py-4">
                        <div className="text-primary">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div className="h-8 overflow-hidden">
                            <div
                                className="transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateY(-${
                                        currentFeature * 100
                                    }%)`,
                                }}
                            >
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="h-8 flex items-center"
                                    >
                                        <span className="text-lg font-medium text-foreground">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link href="/symptom-checker">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-lg py-6 px-8 bg-primary text-primary-foreground hover:opacity-90"
                            >
                                Check Symptoms Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>

                        <Link href="/how-it-works">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-lg py-6 px-8 border-2 border-border"
                            >
                                How It Works
                            </Button>
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-primary" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                            <span>Verified Doctors</span>
                        </div>
                    </div>
                </div>

                {/* Visual element */}
                <div className="relative">
                    <div className="relative mx-auto lg:mx-0 max-w-md lg:max-w-full">
                        {/* Main illustration container */}
                        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                            <div className="space-y-6">
                                {/* AI analysis visual */}
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                        <Sparkles className="h-12 w-12 text-primary-foreground" />
                                    </div>
                                </div>

                                {/* Symptom input mockup */}
                                <div className="space-y-4">
                                    <div className="bg-muted rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground font-medium">
                                            Describe your symptoms...
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-secondary rounded-md p-2 text-center">
                                            <div className="text-xs text-secondary-foreground">
                                                Fever
                                            </div>
                                        </div>
                                        <div className="bg-secondary rounded-md p-2 text-center">
                                            <div className="text-xs text-secondary-foreground">
                                                Headache
                                            </div>
                                        </div>
                                        <div className="bg-secondary rounded-md p-2 text-center">
                                            <div className="text-xs text-secondary-foreground">
                                                Cough
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis result mockup */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-green-800">
                                                Initial analysis complete
                                            </div>
                                            <div className="text-xs text-green-600">
                                                87% match with common conditions
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-4 -right-4 bg-card rounded-lg p-3 shadow-lg border border-border">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-secondary-foreground" />
                                </div>
                                <div className="text-xs font-medium text-foreground">
                                    Secure
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-4 -left-4 bg-card rounded-lg p-3 shadow-lg border border-border">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-accent-foreground" />
                                </div>
                                <div className="text-xs font-medium text-foreground">
                                    Fast
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="animate-bounce">
                    <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
