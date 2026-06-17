"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";

import { useAuth } from "@/components/authprovideradmin";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsData = {
    appointmentsByMonth: { month: string; count: number }[];
    totalAppointmentsInRange: number;
    totalPatientsInRange: number;
    statusBreakdown: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: "var(--chart-4)",
    CONFIRMED: "var(--chart-2)",
    CHECKED_IN: "var(--chart-1)",
    COMPLETED: "var(--chart-3)",
    CANCELLED: "var(--destructive)",
};

function getDefaultFrom(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return d.toISOString().slice(0, 10);
}

function getDefaultTo(): string {
    return new Date().toISOString().slice(0, 10);
}

export default function ReportsPage() {
    const { user } = useAuth();
    const [from, setFrom] = useState(getDefaultFrom);
    const [to, setTo] = useState(getDefaultTo);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    const role = String(user?.role ?? "").toLowerCase();

    const fetchData = useCallback(async () => {
        if (from > to) {
            setDateError("From date must be before or equal to To date");
            return;
        }
        setDateError(null);
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/admin/analytics?from=${from}&to=${to}`,
                { cache: "no-store" }
            );
            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.error ?? "Failed to load report");
            setData(json as AnalyticsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load report");
        } finally {
            setLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (role && role !== "admin") {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <p className="text-muted-foreground">Access restricted to administrators.</p>
            </div>
        );
    }

    const completionRate = (() => {
        if (!data) return null;
        const completed = data.statusBreakdown["COMPLETED"] ?? 0;
        const cancelled = data.statusBreakdown["CANCELLED"] ?? 0;
        const denom = completed + cancelled;
        return denom === 0 ? null : Math.round((completed / denom) * 100);
    })();

    const statusChartData = data
        ? Object.entries(data.statusBreakdown).map(([status, count]) => ({
              name: status,
              value: count,
              fill: STATUS_COLORS[status] ?? "var(--muted-foreground)",
          }))
        : [];

    const barChartConfig: ChartConfig = {
        count: { label: "Appointments", color: "var(--primary)" },
    };

    const statusChartConfig: ChartConfig = Object.fromEntries(
        statusChartData.map((s) => [s.name, { label: s.name, color: s.fill }])
    );

    const barData = (data?.appointmentsByMonth ?? []).map(({ month, count }) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        }),
        count,
    }));

    return (
        <div className="flex flex-1 flex-col gap-8 p-6">
            {/* Header + controls */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Reports
                    </h1>
                    <p className="text-muted-foreground">
                        Appointment and patient analytics for this facility
                    </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="from" className="text-base">
                            From
                        </Label>
                        <Input
                            id="from"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="h-9 w-40"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="to" className="text-base">
                            To
                        </Label>
                        <Input
                            id="to"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="h-9 w-40"
                        />
                    </div>
                    <Button onClick={fetchData} className="h-9 gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Apply
                    </Button>
                </div>
            </div>

            {dateError && (
                <p className="text-base text-destructive">{dateError}</p>
            )}

            {error && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                        <p className="text-muted-foreground">{error}</p>
                        <Button variant="outline" onClick={fetchData}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Stat cards */}
            <div className="grid gap-6 sm:grid-cols-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Total Appointments"
                            value={String(data?.totalAppointmentsInRange ?? 0)}
                            description="In selected range"
                        />
                        <StatCard
                            title="Unique Patients"
                            value={String(data?.totalPatientsInRange ?? 0)}
                            description="Distinct patients in range"
                        />
                        <StatCard
                            title="Completion Rate"
                            value={completionRate !== null ? `${completionRate}%` : "—"}
                            description="Completed vs cancelled"
                        />
                    </>
                )}
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Appointments by month</CardTitle>
                        <CardDescription>
                            Total appointments per calendar month in range
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-64 w-full rounded-lg" />
                        ) : barData.length && barData.some((d) => d.count > 0) ? (
                            <ChartContainer
                                config={barChartConfig}
                                className="h-64 w-full"
                            >
                                <BarChart
                                    data={barData}
                                    margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11 }}
                                        className="text-muted-foreground"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                        className="text-muted-foreground"
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="count"
                                        fill="var(--primary)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status breakdown</CardTitle>
                        <CardDescription>
                            Appointments by status in range
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-64 w-full rounded-lg" />
                        ) : statusChartData.length ? (
                            <ChartContainer
                                config={statusChartConfig}
                                className="h-64 w-full"
                            >
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-base text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function EmptyChart() {
    return (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-base text-muted-foreground">No data in this range</p>
        </div>
    );
}
