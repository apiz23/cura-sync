"use client";

import { memo, useMemo } from "react";
import {
    Activity,
    Heart,
    Moon,
    Footprints,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ReferenceLine,
    XAxis,
    YAxis,
} from "recharts";
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
        averageSpo2Percent: number | null;
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

type Trend = "up" | "down" | "flat" | null;

interface PatientHealthViewProps {
    snapshots: HealthSyncSnapshot[];
    isAdminView: boolean;
    latestSyncedAt?: string | null;
    latestVendor?: string | null;
}

const stepsConfig = {
    steps: { label: "Steps", color: "var(--chart-1)" },
} satisfies ChartConfig;

const hrConfig = {
    heartRate: { label: "Heart Rate (bpm)", color: "var(--destructive)" },
} satisfies ChartConfig;

const sleepConfig = {
    sleepHours: { label: "Sleep (hrs)", color: "var(--chart-4)" },
} satisfies ChartConfig;

function formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function getLastNDaysEndingAt(endDate: string | null, count = 7): string[] {
    const days: string[] = [];
    const anchor = endDate ? new Date(`${endDate}T12:00:00`) : new Date();

    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(anchor);
        d.setDate(d.getDate() - i);
        days.push(formatLocalDate(d));
    }

    return days;
}

function snapLocalDate(rangeStart: string): string {
    return formatLocalDate(new Date(rangeStart));
}

function getDayLabel(dateStr: string): string {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
    });
}

function getSnapshotWindowDays(snapshots: HealthSyncSnapshot[]): string[] {
    const latestDate =
        snapshots
            .map((snapshot) => snapLocalDate(snapshot.rangeStart))
            .sort()
            .at(-1) ?? null;

    return getLastNDaysEndingAt(latestDate, 7);
}

function computeAggregates(snapshots: HealthSyncSnapshot[]): Aggregates {
    const days = getSnapshotWindowDays(snapshots);
    const daySet = new Set(days);
    const recent = snapshots.filter((s) => daySet.has(snapLocalDate(s.rangeStart)));
    if (!recent.length) return { avgSleepHours: null, avgHeartRate: null, avgSteps: null };

    const withSleep = recent.filter((s) => s.summary.totalSleepMinutes > 0);
    const withHR = recent.filter((s) => s.summary.averageHeartRateBpm !== null);
    const withSteps = recent.filter((s) => s.summary.stepsCount > 0);

    return {
        avgSleepHours: withSleep.length
            ? withSleep.reduce((sum, s) => sum + s.summary.totalSleepMinutes, 0) /
              withSleep.length /
              60
            : null,
        avgHeartRate: withHR.length
            ? Math.round(
                  withHR.reduce((sum, s) => sum + (s.summary.averageHeartRateBpm ?? 0), 0) /
                      withHR.length
              )
            : null,
        avgSteps: withSteps.length
            ? Math.round(
                  withSteps.reduce((sum, s) => sum + s.summary.stepsCount, 0) / withSteps.length
              )
            : null,
    };
}

function buildChartData(snapshots: HealthSyncSnapshot[]): DayBucket[] {
    const days = getSnapshotWindowDays(snapshots);
    const byDate = new Map<string, HealthSyncSnapshot>();
    for (const snap of snapshots) {
        const date = snapLocalDate(snap.rangeStart);
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

function formatRelativeDateTime(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "less than 1h ago";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
}

function computeTrend(latest: number | null, avg: number | null): Trend {
    if (latest === null || avg === null) return null;
    if (latest > avg * 1.05) return "up";
    if (latest < avg * 0.95) return "down";
    return "flat";
}

function stepsColor(steps: number): string {
    if (steps >= 8000) return "text-chart-3";
    if (steps >= 4000) return "text-chart-5";
    return "text-destructive";
}

function sleepColor(hours: number): string {
    if (hours >= 7) return "text-chart-4";
    if (hours >= 5) return "text-chart-5";
    return "text-destructive";
}

function hrColor(bpm: number): string {
    if (bpm >= 60 && bpm <= 100) return "text-chart-3";
    if (bpm > 100) return "text-destructive";
    return "text-chart-5";
}

const StatCard = memo(function StatCard({
    label,
    value,
    unit,
    sub,
    color,
    icon: Icon,
    trend,
}: {
    label: string;
    value: string | null;
    unit?: string;
    sub?: string;
    color: string;
    icon: React.ElementType;
    trend?: Trend;
}) {
    return (
        <Card className="border shadow-sm">
            <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}
                        >
                            <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {label}
                        </span>
                    </div>
                    {trend === "up" && <TrendingUp className="h-4 w-4 text-chart-3" />}
                    {trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                    {trend === "flat" && <Minus className="h-4 w-4 text-muted-foreground" />}
                </div>
                {value !== null ? (
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold" style={{ color }}>
                            {value}
                        </span>
                        {unit && (
                            <span className="text-sm text-muted-foreground">{unit}</span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No data</p>
                )}
                {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
        </Card>
    );
});

export function PatientHealthView({
    snapshots,
    isAdminView,
    latestSyncedAt,
    latestVendor,
}: PatientHealthViewProps) {
    const aggregates = useMemo(() => computeAggregates(snapshots), [snapshots]);
    const chartData = useMemo(() => buildChartData(snapshots), [snapshots]);

    const trends = useMemo(() => {
        const latest = chartData[chartData.length - 1];
        return {
            steps: computeTrend(latest?.steps ?? null, aggregates.avgSteps),
            hr: computeTrend(latest?.heartRate ?? null, aggregates.avgHeartRate),
            sleep: computeTrend(latest?.sleepHours ?? null, aggregates.avgSleepHours),
        };
    }, [chartData, aggregates]);

    const sortedHistory = useMemo(() => {
        const byDate = new Map<string, HealthSyncSnapshot>();
        for (const snap of snapshots) {
            const date = snapLocalDate(snap.rangeStart);
            const existing = byDate.get(date);
            if (!existing || snap.summary.stepsCount > existing.summary.stepsCount) {
                byDate.set(date, snap);
            }
        }
        return [...byDate.values()]
            .sort((a, b) => b.rangeStart.localeCompare(a.rangeStart))
            .slice(0, 7);
    }, [snapshots]);

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
            {latestSyncedAt && (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                    <span className="text-primary">
                        {isAdminView
                            ? "Health data synced by patient from mobile app · Read-only"
                            : "Synced from mobile app"}
                    </span>
                    <span className="text-muted-foreground">
                        Last sync: {formatRelativeDateTime(latestSyncedAt)}
                        {latestVendor ? ` · ${latestVendor}` : ""}
                    </span>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Avg Sleep · 7 days"
                    value={
                        aggregates.avgSleepHours !== null
                            ? aggregates.avgSleepHours.toFixed(1)
                            : null
                    }
                    unit="hrs"
                    sub={
                        aggregates.avgSleepHours !== null
                            ? aggregates.avgSleepHours >= 7
                                ? "Within healthy range"
                                : "Below 7h target"
                            : undefined
                    }
                    color="var(--chart-4)"
                    icon={Moon}
                    trend={trends.sleep}
                />
                <StatCard
                    label="Avg Heart Rate · 7 days"
                    value={
                        aggregates.avgHeartRate !== null
                            ? String(aggregates.avgHeartRate)
                            : null
                    }
                    unit="bpm"
                    sub={
                        aggregates.avgHeartRate !== null
                            ? aggregates.avgHeartRate >= 60 && aggregates.avgHeartRate <= 100
                                ? "Normal resting range"
                                : "Outside normal range"
                            : undefined
                    }
                    color="var(--destructive)"
                    icon={Heart}
                    trend={trends.hr}
                />
                <StatCard
                    label="Avg Steps · 7 days"
                    value={
                        aggregates.avgSteps !== null
                            ? aggregates.avgSteps.toLocaleString()
                            : null
                    }
                    sub={
                        aggregates.avgSteps !== null
                            ? aggregates.avgSteps >= 8000
                                ? "Meeting daily goal"
                                : `${(8000 - aggregates.avgSteps).toLocaleString()} below 8k goal`
                            : undefined
                    }
                    color="var(--chart-1)"
                    icon={Footprints}
                    trend={trends.steps}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Steps */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Daily Steps</CardTitle>
                        <CardDescription>Last 7 days · dashed line = 8k goal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={stepsConfig} className="h-52 w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    tickMargin={8}
                                    axisLine={false}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(v) =>
                                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                                    }
                                    width={30}
                                />
                                <ReferenceLine
                                    y={8000}
                                    stroke="var(--chart-1)"
                                    strokeDasharray="4 4"
                                    strokeOpacity={0.45}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel={false} />}
                                />
                                <Bar
                                    dataKey="steps"
                                    fill="var(--color-steps)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Heart Rate — AreaChart */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Heart Rate</CardTitle>
                        <CardDescription>bpm · last 7 days · normal 60–100</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={hrConfig} className="h-52 w-full">
                            <AreaChart accessibilityLayer data={chartData}>
                                <defs>
                                    <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    tickMargin={8}
                                    axisLine={false}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 10 }}
                                    domain={[40, 140]}
                                    width={30}
                                />
                                <ReferenceLine
                                    y={60}
                                    stroke="var(--chart-3)"
                                    strokeDasharray="3 3"
                                    strokeOpacity={0.4}
                                />
                                <ReferenceLine
                                    y={100}
                                    stroke="var(--chart-5)"
                                    strokeDasharray="3 3"
                                    strokeOpacity={0.4}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel={false} />}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="heartRate"
                                    stroke="var(--destructive)"
                                    strokeWidth={2}
                                    fill="url(#hrGrad)"
                                    connectNulls={false}
                                    dot={{ fill: "var(--destructive)", strokeWidth: 0, r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Sleep */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Sleep Duration</CardTitle>
                    <CardDescription>hours · last 7 days · dashed line = 7h target</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={sleepConfig} className="h-52 w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                tickMargin={8}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10 }}
                                domain={[0, 12]}
                                tickFormatter={(v) => `${v}h`}
                                width={30}
                            />
                            <ReferenceLine
                                y={7}
                                stroke="var(--chart-4)"
                                strokeDasharray="4 4"
                                strokeOpacity={0.5}
                                label={{
                                    value: "7h",
                                    position: "insideTopRight",
                                    fontSize: 10,
                                    fill: "var(--chart-4)",
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel={false} />}
                            />
                            <Bar
                                dataKey="sleepHours"
                                fill="var(--color-sleepHours)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* History table */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Daily Breakdown</CardTitle>
                    <CardDescription>One row per day · most recent first</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-4 py-3 text-left font-medium">Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Source</th>
                                    <th className="px-4 py-3 text-right font-medium">Steps</th>
                                    <th className="px-4 py-3 text-right font-medium">Sleep</th>
                                    <th className="px-4 py-3 text-right font-medium">Avg HR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedHistory.map((snap) => {
                                    const sleepH =
                                        snap.summary.totalSleepMinutes > 0
                                            ? snap.summary.totalSleepMinutes / 60
                                            : null;
                                    const hr = snap.summary.averageHeartRateBpm;
                                    return (
                                        <tr
                                            key={snap.id}
                                            className="border-b last:border-0 hover:bg-muted/20"
                                        >
                                            <td className="px-4 py-3 text-foreground">
                                                {new Date(
                                                    snap.rangeStart
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {snap.source.vendor}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right font-mono font-medium ${stepsColor(snap.summary.stepsCount)}`}
                                            >
                                                {snap.summary.stepsCount.toLocaleString()}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right font-mono font-medium ${sleepH !== null ? sleepColor(sleepH) : "text-muted-foreground"}`}
                                            >
                                                {sleepH !== null ? `${sleepH.toFixed(1)}h` : "—"}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right font-mono font-medium ${hr !== null ? hrColor(hr) : "text-muted-foreground"}`}
                                            >
                                                {hr !== null ? `${hr} bpm` : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
