"use client";

import { useMemo } from "react";
import { Activity, Heart, Moon, Footprints } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export type HealthSyncSnapshot = {
    id: string;
    syncedAt: string;
    rangeStart: string;
    rangeEnd: string;
    source: {
        platform: string;
        vendor: string;
        attribution: string;
    };
    summary: {
        sleepSessionsCount: number;
        totalSleepMinutes: number;
        averageHeartRateBpm: number | null;
        stepsCount: number;
    };
    createdAt: string | null;
    updatedAt: string | null;
};

type DayBucket = {
    label: string;
    date: string;
    steps: number | null;
    sleepHours: number | null;
    heartRate: number | null;
};

type Aggregates = {
    avgSleepHours: number | null;
    avgHeartRate: number | null;
    avgSteps: number | null;
};

interface PatientHealthViewProps {
    snapshots: HealthSyncSnapshot[];
    isAdminView: boolean;
    latestSyncedAt?: string | null;
    latestVendor?: string | null;
}

// --- chart configs ---
const stepsConfig = {
    steps: { label: "Steps", color: "#6366f1" },
} satisfies ChartConfig;

const hrConfig = {
    heartRate: { label: "Avg HR (bpm)", color: "#22c55e" },
} satisfies ChartConfig;

const sleepConfig = {
    sleepHours: { label: "Sleep (hrs)", color: "#a855f7" },
} satisfies ChartConfig;

// --- helpers ---
function formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function getLast7Days(): string[] {
    const days: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push(formatLocalDate(d));
    }
    return days;
}

function getDayLabel(dateStr: string): string {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
    });
}

function computeAggregates(snapshots: HealthSyncSnapshot[]): Aggregates {
    if (!snapshots.length) {
        return { avgSleepHours: null, avgHeartRate: null, avgSteps: null };
    }
    const withSleep = snapshots.filter((s) => s.summary.totalSleepMinutes > 0);
    const withHR = snapshots.filter(
        (s) => s.summary.averageHeartRateBpm !== null
    );
    const withSteps = snapshots.filter((s) => s.summary.stepsCount > 0);
    return {
        avgSleepHours:
            withSleep.length
                ? withSleep.reduce(
                      (sum, s) => sum + s.summary.totalSleepMinutes,
                      0
                  ) /
                  withSleep.length /
                  60
                : null,
        avgHeartRate:
            withHR.length
                ? Math.round(
                      withHR.reduce(
                          (sum, s) => sum + (s.summary.averageHeartRateBpm ?? 0),
                          0
                      ) / withHR.length
                  )
                : null,
        avgSteps:
            withSteps.length
                ? Math.round(
                      withSteps.reduce((sum, s) => sum + s.summary.stepsCount, 0) /
                          withSteps.length
                  )
                : null,
    };
}

function buildChartData(snapshots: HealthSyncSnapshot[]): DayBucket[] {
    const days = getLast7Days();
    const byDate = new Map<string, HealthSyncSnapshot>();
    for (const snap of snapshots) {
        const date = snap.rangeStart.slice(0, 10);
        const existing = byDate.get(date);
        if (!existing || snap.summary.stepsCount > existing.summary.stepsCount) {
            byDate.set(date, snap);
        }
    }
    return days.map((date) => {
        const snap = byDate.get(date);
        return {
            label: getDayLabel(date),
            date,
            steps: snap?.summary.stepsCount ?? null,
            sleepHours:
                snap && snap.summary.totalSleepMinutes > 0
                    ? parseFloat((snap.summary.totalSleepMinutes / 60).toFixed(1))
                    : null,
            heartRate: snap?.summary.averageHeartRateBpm ?? null,
        };
    });
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatRelativeDateTime(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "less than 1h ago";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
}

// --- subcomponents ---
function StatCard({
    label,
    value,
    unit,
    sub,
    color,
    icon: Icon,
}: {
    label: string;
    value: string | null;
    unit?: string;
    sub?: string;
    color: string;
    icon: React.ElementType;
}) {
    return (
        <Card className="border shadow-sm">
            <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: `${color}20` }}
                    >
                        <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </span>
                </div>
                {value !== null ? (
                    <div className="flex items-baseline gap-1">
                        <span
                            className="text-2xl font-bold"
                            style={{ color }}
                        >
                            {value}
                        </span>
                        {unit && (
                            <span className="text-sm text-muted-foreground">
                                {unit}
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No data</p>
                )}
                {sub && (
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                )}
            </CardContent>
        </Card>
    );
}

// --- main export ---
export function PatientHealthView({
    snapshots,
    isAdminView,
    latestSyncedAt,
    latestVendor,
}: PatientHealthViewProps) {
    const aggregates = useMemo(() => computeAggregates(snapshots), [snapshots]);
    const chartData = useMemo(() => buildChartData(snapshots), [snapshots]);

    if (!snapshots.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">No health data yet</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    {isAdminView
                        ? "Patient has not synced health data yet."
                        : "Open the CuraSync mobile app to sync your wearable."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isAdminView && (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                    <span className="text-primary">
                        Health data synced by patient from mobile app · Read-only
                    </span>
                    {latestSyncedAt && (
                        <span className="text-muted-foreground">
                            Last sync: {formatRelativeDateTime(latestSyncedAt)}
                            {latestVendor ? ` · ${latestVendor}` : ""}
                        </span>
                    )}
                </div>
            )}

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Avg Sleep · 7 days"
                    value={
                        aggregates.avgSleepHours !== null
                            ? aggregates.avgSleepHours.toFixed(1)
                            : null
                    }
                    unit="hrs"
                    color="#a855f7"
                    icon={Moon}
                />
                <StatCard
                    label="Avg Heart Rate · 7 days"
                    value={
                        aggregates.avgHeartRate !== null
                            ? String(aggregates.avgHeartRate)
                            : null
                    }
                    unit="bpm"
                    color="#22c55e"
                    icon={Heart}
                />
                <StatCard
                    label="Avg Steps · 7 days"
                    value={
                        aggregates.avgSteps !== null
                            ? aggregates.avgSteps.toLocaleString()
                            : null
                    }
                    color="#f59e0b"
                    icon={Footprints}
                />
            </div>

            {/* Steps + HR charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">
                            Daily Steps
                        </CardTitle>
                        <CardDescription>Last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={stepsConfig} className="h-40 w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    tickMargin={8}
                                    axisLine={false}
                                    tick={{ fontSize: 11 }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel={false} />}
                                />
                                <Bar
                                    dataKey="steps"
                                    fill="var(--color-steps)"
                                    radius={4}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">
                            Avg Heart Rate
                        </CardTitle>
                        <CardDescription>bpm · last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={hrConfig} className="h-40 w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    tickMargin={8}
                                    axisLine={false}
                                    tick={{ fontSize: 11 }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel={false} />}
                                />
                                <Bar
                                    dataKey="heartRate"
                                    fill="var(--color-heartRate)"
                                    radius={4}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Sleep chart */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                        Sleep Duration
                    </CardTitle>
                    <CardDescription>hours · last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={sleepConfig} className="h-40 w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                tickMargin={8}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel={false} />}
                            />
                            <Bar
                                dataKey="sleepHours"
                                fill="var(--color-sleepHours)"
                                radius={4}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* History table */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                        Sync History
                    </CardTitle>
                    <CardDescription>Most recent first</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-4 py-3 text-left font-medium">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Source
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Steps
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Sleep
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Avg HR
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...snapshots]
                                    .sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime())
                                    .slice(0, 7)
                                    .map((snap) => (
                                    <tr
                                        key={snap.id}
                                        className="border-b last:border-0 hover:bg-muted/20"
                                    >
                                        <td className="px-4 py-3 text-foreground">
                                            {formatDateTime(snap.syncedAt)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {snap.source.vendor}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {snap.summary.stepsCount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {snap.summary.totalSleepMinutes > 0
                                                ? `${(snap.summary.totalSleepMinutes / 60).toFixed(1)}h`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {snap.summary.averageHeartRateBpm !== null
                                                ? `${snap.summary.averageHeartRateBpm} bpm`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
