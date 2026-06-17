# Admin Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/admin/reports` page with date-range charts and a CSV export button on the appointments page.

**Architecture:** Three independent changes — extend the analytics API to accept `from`/`to` date params, build the reports page consuming that API, and add a pure client-side CSV export to the appointments page. No shared components needed; all chart logic lives in the reports page file.

**Tech Stack:** Next.js 15, TypeScript, shadcn/ui, Recharts (`recharts@3.8.0` already installed), `components/ui/chart.tsx` already present.

## Global Constraints

- Admin-only for reports page and sidebar entry (`roles: ["admin"]`)
- CSV export visible to `admin` and `staff` only (hidden from `doctor`)
- Charts use `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` from `@/components/ui/chart`
- Recharts primitives imported from `recharts` directly (already a dep)
- Follow existing shadcn/ui card + skeleton patterns from `app/admin/dashboard/page.tsx`
- TypeScript strict — no `any`, no implicit `undefined` without guards
- Verify with `npx tsc --noEmit` after each task

---

### Task 1: Extend analytics API with date range + status breakdown

**Files:**
- Modify: `app/api/admin/analytics/route.ts`

**Interfaces:**
- Produces (new response fields used by Task 2):
  - `statusBreakdown: Record<string, number>` — counts keyed by status string
  - `totalAppointmentsInRange: number`
  - `totalPatientsInRange: number`
  - `appointmentsByMonth: { month: string; count: number }[]` — already existed, now respects `from`/`to`
- Backwards compatible: existing fields (`totalAppointmentsThisMonth`, `totalAppointmentsLastMonth`, `totalPatients`, `staffByRole`) preserved when no params passed

- [ ] **Step 1: Replace `app/api/admin/analytics/route.ts` with the extended version**

```typescript
import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireAdminStaffSession } from "@/lib/authz";

export async function GET(req: Request) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { facilityId } = session;

    const url = new URL(req.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    let since: string;
    let until: string;

    if (fromParam && toParam) {
        since = fromParam;
        until = toParam;
    } else {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        since = sixMonthsAgo.toISOString().slice(0, 10);
        until = new Date().toISOString().slice(0, 10);
    }

    const [appointmentsResult, allTimePatientsResult, staffResult] = await Promise.all([
        supabase
            .from("cura_appointments")
            .select("appointment_date, status, profile_id")
            .eq("facility_id", facilityId)
            .gte("appointment_date", since)
            .lte("appointment_date", until),
        supabase
            .from("cura_appointments")
            .select("profile_id")
            .eq("facility_id", facilityId),
        supabase
            .from("cura_staff_profiles")
            .select("id, role")
            .eq("facility_id", facilityId),
    ]);

    if (appointmentsResult.error || allTimePatientsResult.error || staffResult.error) {
        return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }

    const appts = appointmentsResult.data ?? [];

    // Group by month
    const byMonth: Record<string, number> = {};
    for (const appt of appts) {
        const month = appt.appointment_date.slice(0, 7);
        byMonth[month] = (byMonth[month] ?? 0) + 1;
    }

    // Build ordered month array covering the full range
    const months: { month: string; count: number }[] = [];
    const startDate = new Date(since);
    startDate.setDate(1);
    const endDate = new Date(until);
    endDate.setDate(1);
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
        months.push({ month: key, count: byMonth[key] ?? 0 });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const appt of appts) {
        const s = appt.status ?? "UNKNOWN";
        statusBreakdown[s] = (statusBreakdown[s] ?? 0) + 1;
    }

    // Unique patients in range
    const uniquePatientsInRange = new Set(
        appts.map((r) => r.profile_id).filter(Boolean)
    ).size;

    // All-time unique patients (backwards compat)
    const uniquePatients = new Set(
        (allTimePatientsResult.data ?? []).map((r) => r.profile_id).filter(Boolean)
    ).size;

    const staffByRole = (staffResult.data ?? []).reduce<Record<string, number>>(
        (acc, s) => {
            const role = s.role ?? "unknown";
            acc[role] = (acc[role] ?? 0) + 1;
            return acc;
        },
        {}
    );

    // Backwards-compat month counts
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

    return NextResponse.json({
        appointmentsByMonth: months,
        totalPatients: uniquePatients,
        totalPatientsInRange: uniquePatientsInRange,
        totalAppointmentsInRange: appts.length,
        statusBreakdown,
        staffByRole,
        totalAppointmentsThisMonth: byMonth[thisMonthKey] ?? 0,
        totalAppointmentsLastMonth: byMonth[lastMonthKey] ?? 0,
    });
}
```

- [ ] **Step 2: Type-check**

```bash
cd cura-sync-web
npx tsc --noEmit
```

Expected: no errors related to `route.ts`.

- [ ] **Step 3: Manual verify — default call still works**

Start dev server and hit `/api/admin/analytics` (as logged-in admin). Response should include all original fields plus `statusBreakdown`, `totalAppointmentsInRange`, `totalPatientsInRange`.

- [ ] **Step 4: Manual verify — range params work**

Hit `/api/admin/analytics?from=2026-01-01&to=2026-06-18`. `appointmentsByMonth` array should have 6 entries (Jan–Jun). Status counts should reflect only that range.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/analytics/route.ts
git commit -m "feat: extend analytics API with date range params and status breakdown"
```

---

### Task 2: Reports page — sidebar entry + full page

**Files:**
- Modify: `lib/admin-menu.ts`
- Create: `app/admin/reports/page.tsx`

**Interfaces:**
- Consumes from Task 1: `GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD` returning `{ appointmentsByMonth, totalAppointmentsInRange, totalPatientsInRange, statusBreakdown }`
- Produces: browseable page at `/admin/reports` visible only to `admin` role

- [ ] **Step 1: Add Reports entry to sidebar menu**

In `lib/admin-menu.ts`, add `BarChart3` to the import and a new item under System & Security:

```typescript
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    UserPlus,
    Shield,
    Hospital,
    ScrollText,
    BarChart3,
} from "lucide-react";

export const adminMenu = [
    {
        title: "Platform Overview",
        roles: ["admin", "staff", "doctor"],
        items: [
            {
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "Management & Workflow",
        roles: ["admin", "staff", "doctor"],
        items: [
            {
                title: "Patient Management",
                url: "/admin/patients",
                icon: Users,
            },
            {
                title: "Appointments",
                url: "/admin/appointments",
                icon: ClipboardList,
                roles: ["admin", "staff"],
            },
            {
                title: "Consultations",
                url: "/admin/consultations",
                icon: ClipboardList,
                roles: ["doctor"],
            },
            {
                title: "Staff Management",
                url: "/admin/staff",
                icon: UserPlus,
                roles: ["admin"],
            },
        ],
    },
    {
        title: "System & Security",
        roles: ["admin"],
        items: [
            {
                title: "Reports",
                url: "/admin/reports",
                icon: BarChart3,
                roles: ["admin"],
            },
            {
                title: "Audit Trail",
                url: "/admin/audit",
                icon: ScrollText,
            },
            {
                title: "Health Center",
                url: "/admin/health-center",
                icon: Hospital,
            },
            {
                title: "Security",
                url: "/admin/security",
                icon: Shield,
            },
        ],
    },
];
```

- [ ] **Step 2: Create `app/admin/reports/page.tsx`**

```typescript
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
    PENDING: "hsl(var(--chart-4))",
    CONFIRMED: "hsl(var(--chart-2))",
    CHECKED_IN: "hsl(var(--chart-1))",
    COMPLETED: "hsl(var(--chart-3))",
    CANCELLED: "hsl(var(--destructive))",
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
              fill: STATUS_COLORS[status] ?? "hsl(var(--muted-foreground))",
          }))
        : [];

    const barChartConfig: ChartConfig = {
        count: { label: "Appointments", color: "hsl(var(--primary))" },
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
                                        fill="hsl(var(--primary))"
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
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Manual verify**

Navigate to `/admin/reports` as admin. Should see:
- "Reports" link in sidebar under System & Security
- Date range controls defaulting to 6 months
- Stat cards with counts
- Bar chart showing monthly appointments
- Donut chart showing status breakdown

Navigate there as staff or doctor — should see "Access restricted" message (or be redirected by the sidebar not showing the link).

- [ ] **Step 5: Commit**

```bash
git add lib/admin-menu.ts app/admin/reports/page.tsx
git commit -m "feat: add admin reports page with date range, stat cards, and charts"
```

---

### Task 3: CSV export on Appointments page

**Files:**
- Modify: `app/admin/appointments/page.tsx`

**Interfaces:**
- Consumes: `filteredAppointments: Appointment[]` — already computed state in the page
- Produces: browser file download `appointments-YYYY-MM-DD.csv` on button click

- [ ] **Step 1: Add `exportToCSV` helper and Export button to `app/admin/appointments/page.tsx`**

Add the helper function near the bottom of the file, before the last closing brace (after `formatTime`):

```typescript
function exportToCSV(appointments: Appointment[]) {
    function escapeField(value: string): string {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    const headers = ["No", "Patient Name", "Date", "Time", "Reason", "Status"];
    const rows = appointments.map((appt, index) =>
        [
            String(index + 1),
            appt.patient_name,
            appt.appointment_date,
            appt.start_time,
            appt.reason_for_visit ?? "",
            appt.status,
        ]
            .map(escapeField)
            .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\r\n");
    const BOM = "﻿";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Add the Export CSV button to the page header**

Add `Download` to the lucide-react import at the top of `app/admin/appointments/page.tsx`:

```typescript
import {
    AlertCircle,
    Calendar,
    CalendarClock,
    CalendarDays,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Clock4,
    Download,
    FileText,
    Filter,
    Loader2,
    RefreshCw,
    Search,
    User,
    XCircle,
} from "lucide-react";
```

Then in the JSX, find the header row containing the Refresh button (around line 510–520 in the original file). Replace it so the Export button appears next to Refresh — but only for non-doctor roles:

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isDoctor ? "Consultations" : "Appointments"}
        </h1>
        <p className="mt-1 text-muted-foreground">
            {isDoctor
                ? "See today's queue and complete consultations after check-in"
                : "Manage and track patient appointments"}
        </p>
    </div>
    <div className="flex items-center gap-2">
        {!isDoctor && (
            <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(filteredAppointments)}
                className="gap-2 border-border hover:bg-accent"
                disabled={filteredAppointments.length === 0}
            >
                <Download className="h-4 w-4" />
                Export CSV
            </Button>
        )}
        <Button
            variant="outline"
            size="sm"
            onClick={fetchAppointments}
            className="gap-2 border-border hover:bg-accent"
        >
            <RefreshCw className="h-4 w-4" />
            Refresh
        </Button>
    </div>
</div>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual verify**

1. Visit `/admin/appointments` as admin or staff.
2. "Export CSV" button appears next to "Refresh".
3. Click it with no filters — downloads `appointments-YYYY-MM-DD.csv` with all appointments.
4. Apply a status filter (e.g. PENDING only), click Export — downloaded file contains only PENDING rows.
5. Open in Excel — columns render correctly, no encoding issues.
6. Visit as doctor role — Export CSV button is not visible.

- [ ] **Step 5: Commit**

```bash
git add app/admin/appointments/page.tsx
git commit -m "feat: add CSV export to appointments page (admin/staff only)"
```
