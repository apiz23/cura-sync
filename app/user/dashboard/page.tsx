"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Calendar,
    FileText,
    HeartPulse,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            <div className="space-y-1">
                {loading ? (
                    <Skeleton className="h-9 w-64" />
                ) : (
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back, {profile?.full_name ?? "User"} 👋
                    </h1>
                )}
                <p className="text-muted-foreground">
                    Here’s your health overview and recent updates.
                </p>
            </div>

            {/* ================= STATS ================= */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="AI Predictions"
                    value="5"
                    icon={Sparkles}
                    description="Last 7 days symptom checks"
                />
                <StatCard
                    title="Health Records"
                    value="12"
                    icon={FileText}
                    description="Secured via blockchain"
                />
                <StatCard
                    title="Appointments"
                    value="2"
                    icon={Calendar}
                    description="Next: 18 Nov, 10:00 AM"
                />
                <StatCard
                    title="Health Status"
                    value="Stable"
                    icon={HeartPulse}
                    description="No alerts detected"
                    highlight
                />
            </div>

            {/* ================= RECENT ACTIVITY ================= */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Recent Activity</h2>

                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <ActivityItem
                            icon={Sparkles}
                            text="AI analysis: Mild flu symptoms detected."
                        />
                        <ActivityItem
                            icon={FileText}
                            text="New prescription added by Dr. Aisyah."
                        />
                        <ActivityItem
                            icon={Calendar}
                            text="Appointment confirmed with Klinik Sehat."
                        />
                        <ActivityItem
                            icon={ShieldCheck}
                            text="Health data securely synced to blockchain."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* ================= INSIGHTS ================= */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Health Insights</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Health Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Metric label="Heart Rate" value="76 bpm" />
                            <Metric
                                label="Blood Pressure"
                                value="118 / 79 mmHg"
                            />
                            <Metric label="Body Temperature" value="36.7°C" />
                            <Metric label="Sleep Duration" value="7.2 hrs" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Quick Actions</CardTitle>
                            <Badge variant="secondary">Shortcuts</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Check New Symptoms
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                View Medical Records
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Book Appointment
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ================= SUB COMPONENTS ================= */

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    highlight,
}: {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    highlight?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div
                    className={`text-2xl font-bold ${
                        highlight ? "text-green-600" : ""
                    }`}
                >
                    {value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function ActivityItem({
    icon: Icon,
    text,
}: {
    icon: LucideIcon;
    text: string;
}) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <p>{text}</p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
