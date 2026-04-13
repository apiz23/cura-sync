"use client";

import { Link } from "@/i18n/navigation";
import {
    Activity,
    ArrowRight,
    BarChart,
    Brain,
    Cloud,
    Heart,
    Lock,
    Mail,
    Shield,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
    const t = useTranslations("HomePage");
    const featureCards = [
        {
            icon: <Activity className="h-6 w-6" />,
            title: t("featureCards.syncTitle"),
            description: t("featureCards.syncDescription"),
            bgColor: "bg-chart-1/10",
            textColor: "text-chart-1",
        },
        {
            icon: <Brain className="h-6 w-6" />,
            title: t("featureCards.aiTitle"),
            description: t("featureCards.aiDescription"),
            bgColor: "bg-chart-2/10",
            textColor: "text-chart-2",
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: t("featureCards.rolesTitle"),
            description: t("featureCards.rolesDescription"),
            bgColor: "bg-chart-3/10",
            textColor: "text-chart-3",
        },
        {
            icon: <Cloud className="h-6 w-6" />,
            title: t("featureCards.accessTitle"),
            description: t("featureCards.accessDescription"),
            bgColor: "bg-chart-4/10",
            textColor: "text-chart-4",
        },
    ];

    const benefits = [
        {
            icon: <Lock className="h-5 w-5" />,
            title: t("benefits.privacyTitle"),
            description: t("benefits.privacyDescription"),
        },
        {
            icon: <Zap className="h-5 w-5" />,
            title: t("benefits.workflowTitle"),
            description: t("benefits.workflowDescription"),
        },
        {
            icon: <BarChart className="h-5 w-5" />,
            title: t("benefits.visibilityTitle"),
            description: t("benefits.visibilityDescription"),
        },
        {
            icon: <Heart className="h-5 w-5" />,
            title: t("benefits.patientTitle"),
            description: t("benefits.patientDescription"),
        },
    ];

    const productStats = [
        { label: t("stats.modules"), value: "4", color: "text-chart-1" },
        { label: t("stats.roles"), value: "3", color: "text-chart-2" },
        { label: t("stats.ai"), value: "2", color: "text-chart-3" },
        { label: t("stats.journeys"), value: "2", color: "text-chart-4" },
    ];

    return (
        <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/5">
            <PageTitle title="Home" />

            <section className="relative px-4 py-28 sm:px-6 lg:px-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-chart-2/5 blur-3xl" />
                    <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-chart-4/5 opacity-30 blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="space-y-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {t("eyebrow")}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                CuraSync
                                <span className="block bg-linear-to-r from-primary to-chart-2 bg-clip-text tracking-wide text-transparent">
                                    Platform
                                </span>
                            </h1>
                            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
                                {t("description")}
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {featureCards.map((feature) => (
                                <Card
                                    key={feature.title}
                                    className="rounded-2xl border border-border/50 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                                >
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className={`w-fit rounded-xl p-3 ${feature.bgColor}`}>
                                                <div className={feature.textColor}>{feature.icon}</div>
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

                        <div className="flex flex-col justify-center gap-4 pt-8 sm:flex-row">
                            <Link href="/contact">
                                <Button
                                    size="lg"
                                    className="gap-2 rounded-xl bg-linear-to-r from-primary to-primary/90 px-8 py-6 text-base text-primary-foreground shadow-lg transition-all hover:from-primary hover:to-primary/80 hover:shadow-xl"
                                >
                                    <Mail className="h-5 w-5" />
                                    {t("contactCta")}
                                </Button>
                            </Link>
                            <Link href="/symptom-analyzer">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 rounded-xl border-2 border-border px-8 py-6 text-base transition-all hover:border-primary/40 hover:bg-accent"
                                >
                                    {t("demoCta")}
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 pt-12">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.title}
                                    className="flex items-center gap-3 rounded-full border border-border/30 bg-card/40 px-4 py-2 backdrop-blur-sm"
                                >
                                    <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                                        {benefit.icon}
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

            <section className="bg-linear-to-b from-muted/5 to-transparent px-4 py-12 sm:px-6 md:py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {productStats.map((stat) => (
                            <Card
                                key={stat.label}
                                className="rounded-xl border border-border/30 bg-card/60 shadow-xs backdrop-blur-sm"
                            >
                                <CardContent className="p-6 text-center">
                                    <div className={`mb-1 text-2xl font-bold md:text-3xl ${stat.color}`}>
                                        {stat.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground md:text-sm">
                                        {stat.label}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 md:py-20 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-8 text-center">
                    <div className="space-y-4">
                        <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 px-4 py-2 text-primary hover:bg-primary/20"
                            >
                            {t("whyBadge")}
                        </Badge>
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                            {t("whyTitle")}
                        </h2>
                        <p className="text-base text-muted-foreground md:text-lg">
                            {t("whyDescription")}
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                title: t("journeyCards.timeTitle"),
                                description: t("journeyCards.timeDescription"),
                                icon: <Zap className="h-7 w-7 text-chart-1" />,
                                bgColor: "bg-chart-1/10",
                            },
                            {
                                title: t("journeyCards.continuityTitle"),
                                description: t("journeyCards.continuityDescription"),
                                icon: <Heart className="h-7 w-7 text-chart-2" />,
                                bgColor: "bg-chart-2/10",
                            },
                            {
                                title: t("journeyCards.accessTitle"),
                                description: t("journeyCards.accessDescription"),
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
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-linear-to-r from-primary/5 via-chart-2/5 to-chart-4/5 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-8 text-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                            {t("exploreTitle")}
                        </h2>
                        <p className="text-base text-muted-foreground md:text-lg">
                            {t("exploreDescription")}
                        </p>
                    </div>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/contact">
                            <Button
                                size="lg"
                                className="gap-2 rounded-xl bg-linear-to-r from-primary to-chart-2 px-8 py-6 text-base text-primary-foreground shadow-lg hover:from-primary/90 hover:to-chart-2/90 hover:shadow-xl"
                            >
                                <Mail className="h-5 w-5" />
                                {t("contactProjectTeam")}
                            </Button>
                        </Link>
                        <Link href="/facilities">
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 rounded-xl border-2 border-border px-8 py-6 text-base hover:border-primary/40 hover:bg-accent"
                            >
                                {t("exploreFacilities")}
                            </Button>
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {t("footerNote")}
                    </p>
                </div>
            </section>

            <div className="fixed bottom-8 left-1/2 hidden -translate-x-1/2 md:block">
                <div className="flex flex-col items-center gap-1">
                    <div className="animate-bounce">
                        <ArrowRight className="h-5 w-5 rotate-90 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground/70">
                        {t("scroll")}
                    </p>
                </div>
            </div>
        </div>
    );
}
