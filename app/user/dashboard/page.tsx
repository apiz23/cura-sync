"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Calendar,
    FileText,
    HeartPulse,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    User,
    Activity,
    Pill,
    Stethoscope,
    Bell,
    ChevronRight,
    ArrowUpRight,
    Brain,
    Database,
    Thermometer,
    Moon,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
    full_name: string;
}

export default function UserDashboardPage() {
    const { user, isLoaded } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isLoaded, user]);

    return (
        <div className="flex flex-1 flex-col gap-8 p-6">
            {/* ================= HEADER ================= */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        {loading ? (
                            <>
                                <Skeleton className="h-10 w-72" />
                                <Skeleton className="h-4 w-96" />
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">
                                            Welcome back,{" "}
                                            <span className="text-3xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                                {profile?.full_name ?? "User"}
                                            </span>
                                            <span className="text-3xl ml-2">
                                                👋
                                            </span>
                                        </h1>
                                        <p className="text-muted-foreground">
                                            Your health dashboard is updated in
                                            real-time
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <Badge variant="outline" className="gap-2 px-3 py-1.5">
                        <Activity className="w-3 h-3 text-green-500" />
                        <span>Last updated: Today</span>
                    </Badge>
                </div>
            </div>

            {/* ================= STATS ================= */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="AI Predictions"
                    value="5"
                    icon={Brain}
                    description="Last 7 days symptom checks"
                    trend="+2 this week"
                    color="from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Health Records"
                    value="12"
                    icon={Database}
                    description="Secured via blockchain"
                    trend="100% secure"
                    color="from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Appointments"
                    value="2"
                    icon={Calendar}
                    description="Next: Tomorrow, 10:00 AM"
                    trend="1 upcoming"
                    color="from-amber-500 to-amber-600"
                />
                <StatCard
                    title="Health Status"
                    value="Excellent"
                    icon={HeartPulse}
                    description="All vitals normal"
                    trend="Stable"
                    color="from-emerald-500 to-emerald-600"
                    highlight
                />
            </div>

            {/* ================= HEALTH OVERVIEW ================= */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 border-2 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Activity className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">
                                        Recent Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Your latest health activities
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-2">
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            {
                                icon: Brain,
                                color: "bg-purple-100 text-purple-600",
                                time: "10 min ago",
                                text: "AI analysis completed for flu symptoms",
                                status: "Completed",
                            },
                            {
                                icon: Stethoscope,
                                color: "bg-blue-100 text-blue-600",
                                time: "2 hours ago",
                                text: "Virtual consultation with Dr. Aisyah",
                                status: "Completed",
                            },
                            {
                                icon: Pill,
                                color: "bg-green-100 text-green-600",
                                time: "5 hours ago",
                                text: "Medication reminder: Take antibiotics",
                                status: "Upcoming",
                            },
                            {
                                icon: ShieldCheck,
                                color: "bg-emerald-100 text-emerald-600",
                                time: "Yesterday",
                                text: "Health data synced to blockchain",
                                status: "Secure",
                            },
                            {
                                icon: Bell,
                                color: "bg-amber-100 text-amber-600",
                                time: "2 days ago",
                                text: "Annual health checkup reminder",
                                status: "Pending",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                                <div
                                    className={`p-2.5 rounded-lg ${item.color} flex-shrink-0 group-hover:scale-105 transition-transform`}
                                >
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground">
                                        {item.text}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">
                                            {item.time}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Health Metrics */}
                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">
                                    Health Metrics
                                </CardTitle>
                                <CardDescription>
                                    Current vital signs
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <MetricWithProgress
                            label="Heart Rate"
                            value="76"
                            unit="bpm"
                            icon={Activity}
                            status="Normal"
                        />
                        <MetricWithProgress
                            label="Blood Pressure"
                            value="118/79"
                            unit="mmHg"
                            icon={Zap}
                            status="Optimal"
                        />
                        <MetricWithProgress
                            label="Body Temperature"
                            value="36.7"
                            unit="°C"
                            icon={Thermometer}
                            status="Normal"
                        />
                        <MetricWithProgress
                            label="Sleep Quality"
                            value="7.2"
                            unit="hrs"
                            icon={Moon}
                            status="Good"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* ================= QUICK ACTIONS & INSIGHTS ================= */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Actions */}
                <Card className="border-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Zap className="w-5 h-5 text-primary" />
                            </div>
                            <span>Quick Actions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full h-12 justify-start gap-3 rounded-xl hover:shadow-md transition-all">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-medium">
                                Check Symptoms with AI
                            </span>
                            <ArrowUpRight className="w-4 h-4 ml-auto" />
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 justify-start gap-3 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all"
                        >
                            <FileText className="w-5 h-5" />
                            <span className="font-medium">
                                View Medical Records
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 justify-start gap-3 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all"
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="font-medium">
                                Book Appointment
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 justify-start gap-3 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all"
                        >
                            <Pill className="w-5 h-5" />
                            <span className="font-medium">
                                Medication Schedule
                            </span>
                        </Button>
                    </CardContent>
                </Card>

                {/* Health Insights */}
                <Card className="border-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Brain className="w-5 h-5 text-primary" />
                            </div>
                            <span>Health Insights</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-blue-800">
                                        Sleep Improvement
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        Your sleep duration has increased by 15%
                                        this week
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-emerald-100">
                                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-emerald-800">
                                        Heart Health
                                    </p>
                                    <p className="text-sm text-emerald-600 mt-1">
                                        Resting heart rate is within optimal
                                        range
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-amber-100">
                                    <Bell className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-amber-800">
                                        Upcoming Checkup
                                    </p>
                                    <p className="text-sm text-amber-600 mt-1">
                                        Annual physical exam recommended next
                                        month
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/* ================= SUB COMPONENTS ================= */

function StatCard({
    title,
    value,
    description,
    trend,
    icon: Icon,
    color,
    highlight,
}: {
    title: string;
    value: string;
    description: string;
    trend: string;
    icon: LucideIcon;
    color: string;
    highlight?: boolean;
}) {
    return (
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${color}/10`}
                    >
                        <Icon
                            className={`w-4 h-4 bg-gradient-to-br ${color} bg-clip-text text-transparent`}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    className={`text-3xl font-bold ${
                        highlight ? "text-emerald-600" : ""
                    }`}
                >
                    {value}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    {description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600">
                        {trend}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function MetricWithProgress({
    label,
    value,
    unit,
    icon: Icon,
    status,
}: {
    label: string;
    value: string;
    unit: string;
    icon: LucideIcon;
    status: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{value}</span>
                    <span className="text-sm text-muted-foreground">
                        {unit}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                    {status}
                </Badge>
            </div>
        </div>
    );
}
