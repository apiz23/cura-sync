"use client";

import {
    ArrowDown,
    Mail,
    Sparkles,
    Zap,
    CheckCircle,
    Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageTitle from "@/components/page-title";
import { Marquee } from "@/components/ui/marquee";

export default function Page() {
    const featureCards = [
        {
            icon: <Zap className="h-5 w-5" />,
            text: "Real-time Collaboration",
        },
        {
            icon: <Sparkles className="h-5 w-5" />,
            text: "AI-Powered Clinical Insights",
        },
        {
            icon: <Shield className="h-5 w-5" />,
            text: "Secure & HIPAA Compliant",
        },
        {
            icon: <CheckCircle className="h-5 w-5" />,
            text: "Enterprise-Grade Reliability",
        },
    ];

    return (
        <section className="flex justify-center items-center h-screen w-full bg-background">
            <PageTitle title={"Home"} />
            {/* Enhanced Background with Theme Colors */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-chart-2/10 rounded-full blur-[100px] opacity-50" />
                <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-chart-4/10 rounded-full blur-[80px] opacity-30" />
            </div>

            {/* Animated background grid */}
            <div className="absolute inset-0 bg-[linear-linear(to_right,var(--color-border)_1px,transparent_1px),linear-linear(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-24px_24px] opacity-20" />

            <div className="relative z-10 mx-auto max-w-6xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Professional Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 backdrop-blur-sm mb-6"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent font-bold">
                            Next Generation Healthcare Platform
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mb-6 text-5xl font-bold text-foreground md:text-7xl lg:text-8xl leading-tight"
                    >
                        Cura Sync
                        <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-2 to-chart-4 pb-2">
                            Platform
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground md:text-2xl leading-relaxed bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border"
                    >
                        Revolutionizing healthcare collaboration with real-time
                        patient data synchronization, AI-powered clinical
                        insights, and seamless provider communication for better
                        patient outcomes.
                    </motion.p>

                    {/* Animated Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="relative w-full mb-8"
                    >
                        <Marquee pauseOnHover className="[--duration:20s]">
                            {featureCards.map((feature, index) => (
                                <FeatureCard key={index} {...feature} />
                            ))}
                        </Marquee>

                        {/* Gradient fade edges */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background to-transparent" />
                    </motion.div>

                    {/* Enhanced CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="mb-12 flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <Button
                            size="lg"
                            className="gap-2 text-lg py-6 px-8 overflow-y-hidden bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                        >
                            <Mail className="h-5 w-5" />
                            Get Started
                        </Button>
                        <Link href="/symptom-analyzer">
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 text-lg py-6 px-8 overflow-y-hidden border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-300"
                            >
                                View Demo
                                <ArrowDown className="h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8"
                    >
                        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
                            <div className="p-1 bg-primary/10 rounded-full">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
                            <div className="p-1 bg-chart-2/10 rounded-full">
                                <Zap className="h-4 w-4 text-chart-2" />
                            </div>
                            <span>Real-time Sync</span>
                        </div>
                        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
                            <div className="p-1 bg-chart-4/10 rounded-full">
                                <Shield className="h-4 w-4 text-chart-4" />
                            </div>
                            <span>Enterprise Secure</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Enhanced Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{
                    opacity: { delay: 1.5, duration: 0.6 },
                    y: {
                        delay: 1.5,
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
            >
                <div className="flex flex-col items-center gap-2">
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <ArrowDown className="h-6 w-6 text-muted-foreground" />
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="text-xs text-muted-foreground/70 font-medium"
                    >
                        Scroll to explore
                    </motion.p>
                </div>
            </motion.div>
        </section>
    );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md rounded-xl px-6 py-3 border min-w-[260px]">
            <div className="text-primary p-2 bg-primary/10 rounded-lg">
                {icon}
            </div>
            <span className="font-medium text-card-foreground text-lg">
                {text}
            </span>
        </div>
    );
}
