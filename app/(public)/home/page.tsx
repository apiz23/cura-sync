"use client";

import Link from "next/link";
import {
    Activity,
    ArrowRight,
    Brain,
    Cloud,
    Heart,
    Mail,
    Shield,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";

import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
    const featureCards = [
        {
            icon: <Activity className="h-6 w-6" />,
            title: "Real-time Sync",
            description:
                "Keep appointments, profiles, and medication records aligned across the platform.",
            bgColor: "bg-chart-1/10",
            textColor: "text-chart-1",
        },
        {
            icon: <Brain className="h-6 w-6" />,
            title: "AI Support",
            description:
                "Use the symptom analyzer to summarize what a patient is experiencing before follow-up.",
            bgColor: "bg-chart-2/10",
            textColor: "text-chart-2",
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Patient and Staff Roles",
            description:
                "Support different workflows for public users, patients, and facility staff.",
            bgColor: "bg-chart-3/10",
            textColor: "text-chart-3",
        },
        {
            icon: <Cloud className="h-6 w-6" />,
            title: "Centralized Access",
            description:
                "Bring facility discovery, booking, and record management into one connected system.",
            bgColor: "bg-chart-4/10",
            textColor: "text-chart-4",
        },
    ];

    const productStats = [
        { label: "Core Modules", value: "4" },
        { label: "User Roles", value: "3" },
        { label: "AI Features", value: "2" },
        { label: "Main Journeys", value: "2" },
    ];

    return (
        <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/5">
            <PageTitle title="Home" />

            {/* Hero */}
            <section className="relative px-4 py-28 sm:px-6 lg:px-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-chart-2/5 blur-3xl" />
                    <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-chart-4/5 opacity-30 blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl">
                    <div className="space-y-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Integrated Healthcare Coordination Platform
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                CuraSync
                                <span className="block bg-linear-to-r from-primary to-chart-2 bg-clip-text tracking-wide text-transparent">
                                    Platform
                                </span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                                A final year project focused on connected patient care, facility
                                operations, and AI-assisted symptom support.
                            </p>
                        </div>

                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="/contact">
                                <Button
                                    size="lg"
                                    className="gap-2 rounded-xl bg-linear-to-r from-primary to-primary/90 px-8 py-6 text-base text-primary-foreground shadow-lg transition-all hover:from-primary hover:to-primary/80 hover:shadow-xl"
                                >
                                    <Mail className="h-5 w-5" />
                                    Contact the Team
                                </Button>
                            </Link>
                            <Link href="/symptom-analyzer">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 rounded-xl border-2 border-border px-8 py-6 text-base transition-all hover:border-primary/40 hover:bg-accent"
                                >
                                    View Live Demo
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                            {productStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-2 rounded-full border border-border/40 bg-card/60 px-4 py-2 backdrop-blur-sm"
                                >
                                    <span className="text-lg font-bold text-primary">
                                        {stat.value}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-10">
                    <div className="space-y-3 text-center">
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                            What CuraSync covers
                        </h2>
                        <p className="text-muted-foreground">
                            Core modules built around real healthcare workflows
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {featureCards.map((feature) => (
                            <Card
                                key={feature.title}
                                className="rounded-2xl border border-border/50 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className={`w-fit rounded-xl p-3 ${feature.bgColor}`}>
                                            <div className={feature.textColor}>
                                                {feature.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 text-lg font-semibold text-foreground">
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
                </div>
            </section>

            {/* Why CuraSync */}
            <section className="bg-muted/20 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-8 text-center">
                    <div className="space-y-4">
                        <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 px-4 py-2 text-primary hover:bg-primary/20"
                        >
                            Why CuraSync
                        </Badge>
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                            Connect the patient and facility journey
                        </h2>
                        <p className="text-base text-muted-foreground md:text-lg">
                            The project focuses on making the main healthcare workflow clearer:
                            discover a facility, book an appointment, manage treatment, and support
                            follow-up with AI-assisted tools.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                title: "Save Time",
                                description:
                                    "Reduce repeated manual updates with shared appointments and medication records.",
                                icon: <Zap className="h-7 w-7 text-chart-1" />,
                                bgColor: "bg-chart-1/10",
                            },
                            {
                                title: "Improve Continuity",
                                description:
                                    "Keep symptom summaries, appointments, and medications in one connected system.",
                                icon: <Heart className="h-7 w-7 text-chart-2" />,
                                bgColor: "bg-chart-2/10",
                            },
                            {
                                title: "Protect Access",
                                description:
                                    "Use role-aware access controls for patients and facility staff.",
                                icon: <Shield className="h-7 w-7 text-chart-3" />,
                                bgColor: "bg-chart-3/10",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="space-y-4 rounded-2xl border border-border/30 bg-card/60 p-6 shadow-sm backdrop-blur-sm"
                            >
                                <div className={`mx-auto w-fit rounded-xl p-3 ${item.bgColor}`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-foreground md:text-xl">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="bg-linear-to-r from-primary/5 via-chart-2/5 to-chart-4/5 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-8 text-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                            Explore the project in action
                        </h2>
                        <p className="text-base text-muted-foreground md:text-lg">
                            Try the public experience, discover facilities, or open the symptom
                            analyzer to see the connected workflow.
                        </p>
                    </div>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/contact">
                            <Button
                                size="lg"
                                className="gap-2 rounded-xl bg-linear-to-r from-primary to-chart-2 px-8 py-6 text-base text-primary-foreground shadow-lg hover:from-primary/90 hover:to-chart-2/90 hover:shadow-xl"
                            >
                                <Mail className="h-5 w-5" />
                                Contact Project Team
                            </Button>
                        </Link>
                        <Link href="/facilities">
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 rounded-xl border-2 border-border px-8 py-6 text-base hover:border-primary/40 hover:bg-accent"
                            >
                                Explore Facilities
                            </Button>
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Built around patient, provider, and AI-assisted care workflows
                    </p>
                </div>
            </section>
        </div>
    );
}
