"use client";

import Link from "next/link";
import {
    ArrowRight,
    FileQuestion,
    Home,
    Search,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/page-title";

const recoveryLinks = [
    {
        href: "/home",
        label: "Back to Home",
        description: "Return to the main landing page",
        icon: Home,
        tone: "text-primary",
        bg: "bg-primary/10",
    },
    {
        href: "/symptom-analyzer",
        label: "Open Symptom Analyzer",
        description: "Jump into the live product experience",
        icon: Search,
        tone: "text-chart-2",
        bg: "bg-chart-2/10",
    },
];

export default function NotFound() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted/5">
            <PageTitle title="Page Not Found" />

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl" />
                <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-chart-4/10 blur-3xl opacity-40" />
            </div>

            <section className="relative z-10 flex min-h-screen items-center px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
                    <div className="flex-1 space-y-6 text-center lg:text-left">
                        <Badge className="border-primary/20 bg-primary/10 px-4 py-2 text-primary hover:bg-primary/15">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Route unavailable
                        </Badge>

                        <div className="space-y-4">
                            <p className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl md:text-9xl">
                                404
                            </p>
                            <h1 className="serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                                This page is not part of the current care path
                            </h1>
                            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                The page you tried to open does not exist, may
                                have moved, or the link is out of date. Use one
                                of the routes below to get back into CuraSync.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                            <Button
                                asChild
                                size="lg"
                                className="gap-2 rounded-xl bg-linear-to-r from-primary to-chart-2 px-8 py-6 text-base text-primary-foreground shadow-lg hover:from-primary/90 hover:to-chart-2/90"
                            >
                                <Link href="/home">
                                    <Home className="h-5 w-5" />
                                    Back to Home
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="gap-2 rounded-xl border-2 border-border bg-background/60 px-8 py-6 text-base backdrop-blur-sm hover:border-primary/40 hover:bg-accent"
                            >
                                <Link href="/symptom-analyzer">
                                    Explore Feature
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="flex-1 border-border/40 bg-card/60 shadow-xl backdrop-blur-sm">
                        <CardContent className="p-6 sm:p-8">
                            <div className="mb-8 flex items-center justify-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-linear-to-br from-primary/15 to-chart-2/10 shadow-sm">
                                    <FileQuestion className="h-10 w-10 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {recoveryLinks.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-background/60 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-background"
                                        >
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}
                                            >
                                                <Icon
                                                    className={`h-5 w-5 ${item.tone}`}
                                                />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-foreground">
                                                    {item.label}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
