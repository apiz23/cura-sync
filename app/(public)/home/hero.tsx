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
    Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
        }, 3000);

        return () => clearInterval(interval);
    }, [features.length]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-20">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-chart-2/20 rounded-full blur-[100px] opacity-50" />
                <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-chart-4/20 rounded-full blur-[80px] opacity-30" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-linear(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Content */}
                <div className="text-center lg:text-left space-y-8">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 backdrop-blur-sm"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent font-bold">
                            AI-Powered Healthcare Platform
                        </span>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight"
                        >
                            Smart
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-4 to-chart-2 block pb-2">
                                Health Care
                            </span>
                            That Cares
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Get instant symptom analysis, connect with verified
                            doctors, and manage your health—all in one secure,
                            intelligent platform designed for you.
                        </motion.p>
                    </div>

                    {/* Animated features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center lg:justify-start items-center space-x-3 h-12"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentFeature}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center space-x-3 bg-card/50 backdrop-blur-md rounded-xl px-5 py-2.5 border border-border/50 shadow-sm"
                            >
                                <div className="text-primary p-1 bg-primary/10 rounded-lg">
                                    {features[currentFeature].icon}
                                </div>
                                <span className="font-medium text-card-foreground">
                                    {features[currentFeature].text}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
                    >
                        <Link href="/symptom-analyzer">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-lg py-7 px-8 bg-linear-to-r from-primary to-chart-2 hover:opacity-90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300 rounded-xl"
                            >
                                Start Free Analysis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>

                        <Link href="/how-it-works">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-lg py-7 px-8 border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-accent/20 rounded-xl"
                            >
                                See How It Works
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-chart-1/10 rounded-full">
                                <CheckCircle className="h-4 w-4 text-chart-1" />
                            </div>
                            <span>98% Accuracy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-chart-2/10 rounded-full">
                                <Shield className="h-4 w-4 text-chart-2" />
                            </div>
                            <span>Fully Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded-full">
                                <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <span>Medically Verified</span>
                        </div>
                    </motion.div>
                </div>

                {/* Visual element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative mx-auto w-full max-w-md lg:max-w-lg"
                >
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-linear-to-r from-primary to-chart-2 rounded-3xl blur-2xl opacity-20 animate-pulse" />

                        {/* Main card */}
                        <div className="relative bg-card/80 rounded-3xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-destructive rounded-full shadow-sm"></div>
                                        <div className="w-3 h-3 bg-chart-4 rounded-full shadow-sm"></div>
                                        <div className="w-3 h-3 bg-chart-2 rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <div className="text-xs font-medium text-muted-foreground">
                                            System Active
                                        </div>
                                    </div>
                                </div>

                                {/* AI Icon */}
                                <div className="flex justify-center py-4">
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="w-24 h-24 bg-linear-to-br from-primary to-chart-2 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20"
                                    >
                                        <Sparkles className="h-12 w-12 text-white" />
                                    </motion.div>
                                </div>

                                {/* Input mockup */}
                                <div className="space-y-4">
                                    <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold">
                                                    You
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground pt-1.5">
                                                &quot;I&apos;ve had a headache
                                                and fever for 2 days...&quot;
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick symptoms */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            "Fever",
                                            "Headache",
                                            "Cough",
                                            "Fatigue",
                                        ].map((symptom, i) => (
                                            <motion.div
                                                key={symptom}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.8 + i * 0.1,
                                                }}
                                                className="bg-secondary/50 hover:bg-secondary/80 transition-colors rounded-xl p-3 text-center border border-border/50 cursor-default"
                                            >
                                                <div className="text-xs font-medium text-secondary-foreground">
                                                    {symptom}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Result bar */}
                                <div className="bg-linear-to-r from-chart-2/10 to-transparent border border-chart-2/20 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-chart-2/20 rounded-full">
                                            <CheckCircle className="h-5 w-5 text-chart-2 shrink-0" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-sm font-semibold text-chart-2">
                                                    Analysis Complete
                                                </div>
                                                <span className="text-xs font-bold text-chart-2">
                                                    100%
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: "100%" }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: 1,
                                                    }}
                                                    className="bg-chart-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1,
                            }}
                            className="absolute -top-6 -right-6 bg-card rounded-2xl p-4 shadow-xl border border-white/10 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Security
                                    </div>
                                    <div className="text-sm font-bold">
                                        HIPAA Ready
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5,
                            }}
                            className="absolute -bottom-8 -left-8 bg-card rounded-2xl p-4 shadow-xl border border-white/10 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-chart-1/10 rounded-full flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-chart-1" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Speed
                                    </div>
                                    <div className="text-sm font-bold">
                                        Instant Results
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
                <div className="animate-bounce">
                    <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center p-1">
                        <div className="w-1 h-2 bg-muted-foreground rounded-full mt-1"></div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
