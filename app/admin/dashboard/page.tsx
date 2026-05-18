"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CalendarClock,
    ClipboardList,
    RefreshCw,
    Settings,
    Shield,
    Stethoscope,
    UserPlus,
    Users,
} from "lucide-react";

import type { Appointment, FacilityEdit, FacilityPlan, Staff } from "@/app/types";
import { useAuth } from "@/components/authprovideradmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PatientRecord = {
    id: string;
    full_name: string;
    email: string;
    created_at?: string;
};

type FacilitySummary = {
    facility: FacilityEdit | null;
    schedules: { id: string }[];
};

type AnalyticsData = {
    appointmentsByMonth: { month: string; count: number }[];
    totalPatients: number;
    staffByRole: Record<string, number>;
    totalAppointmentsThisMonth: number;
    totalAppointmentsLastMonth: number;
} | null;

type DashboardState = {
    appointments: Appointment[];
    staff: Staff[];
    patients: PatientRecord[];
    facilitySummary: FacilitySummary | null;
    analytics: AnalyticsData;
};

const initialState: DashboardState = {
    appointments: [],
    staff: [],
    patients: [],
    facilitySummary: null,
    analytics: null,
};

function getPlanBadgeVariant(plan: FacilityPlan): "default" | "secondary" | "outline" {
    if (plan === "enterprise") return "default";
    if (plan === "clinic") return "secondary";
    return "outline";
}

const PLAN_LABELS: Record<FacilityPlan, string> = {
    basic: "Basic",
    clinic: "Clinic",
    enterprise: "Enterprise",
};

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [state, setState] = useState<DashboardState>(initialState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const role = String(user?.role ?? "").toLowerCase();
    const isAdmin = role === "admin";
    const isDoctor = role === "doctor";
    const appointmentsHref = isDoctor ? "/admin/consultations" : "/admin/appointments";

    const loadDashboard = useCallback(async () => {
        if (!user?.facility_id) return;

        setLoading(true);
        setError(null);

        try {
            const facilityRequest = isAdmin
                ? fetch("/api/facility/me", { cache: "no-store" })
                : Promise.all([
                      fetch(`/api/facility/${user.facility_id}`, {
                          cache: "no-store",
                      }),
                      fetch(
                          `/api/facility/schedule?facilityId=${encodeURIComponent(
                              user.facility_id
                          )}`,
                          { cache: "no-store" }
                      ),
                  ]);

            const [appointmentsRes, staffRes, patientsRes, facilityResult, analyticsResult] =
                await Promise.all([
                    fetch(
                        `/api/appointments/by-facility?facilityId=${user.facility_id}`,
                        { cache: "no-store" }
                    ),
                    fetch(`/api/staff/by-facility?facilityId=${user.facility_id}`, {
                        cache: "no-store",
                    }),
                    fetch(
                        `/api/patients/by-facility?facilityId=${user.facility_id}`,
                        { cache: "no-store" }
                    ),
                    facilityRequest,
                    isAdmin ? fetch("/api/admin/analytics", { cache: "no-store" }) : Promise.resolve(null),
                ]);

            const [appointmentsData, staffData, patientsData] = await Promise.all([
                appointmentsRes.json().catch(() => null),
                staffRes.json().catch(() => null),
                patientsRes.json().catch(() => null),
            ]);

            let facilityData: FacilitySummary | null = null;
            let facilityOk = false;

            if (isAdmin) {
                const facilityRes = facilityResult as Response;
                facilityData = await facilityRes.json().catch(() => null);
                facilityOk = facilityRes.ok;
            } else {
                const [facilityRes, schedulesRes] = facilityResult as [
                    Response,
                    Response,
                ];
                const [facilityPayload, schedulesPayload] = await Promise.all([
                    facilityRes.json().catch(() => null),
                    schedulesRes.json().catch(() => null),
                ]);

                facilityOk = facilityRes.ok && schedulesRes.ok;
                facilityData = facilityOk
                    ? {
                          facility: facilityPayload?.facility ?? null,
                          schedules: Array.isArray(schedulesPayload?.schedules)
                              ? schedulesPayload.schedules
                              : [],
                      }
                    : null;
            }

            if (!appointmentsRes.ok || !staffRes.ok || !patientsRes.ok || !facilityOk) {
                throw new Error("Failed to load facility dashboard");
            }

            let analyticsData: AnalyticsData = null;
            if (isAdmin && analyticsResult) {
                const raw = await (analyticsResult as Response).json().catch(() => null);
                analyticsData = raw ?? null;
            }

            setState({
                appointments: Array.isArray(appointmentsData)
                    ? appointmentsData
                    : [],
                staff: Array.isArray(staffData?.staff) ? staffData.staff : [],
                patients: Array.isArray(patientsData) ? patientsData : [],
                facilitySummary: facilityData,
                analytics: analyticsData,
            });
        } catch (err) {
            console.error("Failed to load admin dashboard", err);
            setError("Unable to load the facility dashboard right now.");
            setState(initialState);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, user?.facility_id]);

    useEffect(() => {
        if (!authLoading && user?.facility_id) {
            loadDashboard();
        }
    }, [authLoading, user?.facility_id, loadDashboard]);

    const todayIso = new Date().toISOString().slice(0, 10);

    const confirmedAppointments = state.appointments.filter((appointment) =>
        appointment.status === "CONFIRMED" || appointment.status === "CHECKED_IN"
    );
    const todayAppointments = state.appointments.filter(
        (appointment) => appointment.appointment_date === todayIso
    );
    const pendingAppointments = state.appointments.filter(
        (appointment) => appointment.status === "PENDING"
    );
    const doctorCount = state.staff.filter((member) => member.role === "doctor").length;
    const adminCount = state.staff.filter((member) => member.role === "admin").length;

    const recentPatients = useMemo(
        () =>
            [...state.patients]
                .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
                .slice(0, 3),
        [state.patients]
    );

    const upcomingAppointments = useMemo(
        () =>
            [...state.appointments]
                .filter(
                    (appointment) =>
                        appointment.appointment_date >= todayIso &&
                        appointment.status !== "CANCELLED"
                )
                .sort((a, b) =>
                    `${a.appointment_date}T${a.start_time}`.localeCompare(
                        `${b.appointment_date}T${b.start_time}`
                    )
                )
                .slice(0, 4),
        [state.appointments, todayIso]
    );

    const recentStaff = useMemo(
        () =>
            [...state.staff]
                .sort((a, b) => b.created_at.localeCompare(a.created_at))
                .slice(0, 3),
        [state.staff]
    );

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-8 p-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-36 rounded-xl" />
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="h-96 rounded-xl lg:col-span-2" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-8 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Facility Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        {state.facilitySummary?.facility?.name ??
                            "Your facility"}{" "}
                        operational summary using live appointments, patients, and staff data.
                    </p>
                    {state.facilitySummary?.facility?.plan && (
                        <Badge variant={getPlanBadgeVariant(state.facilitySummary.facility.plan as FacilityPlan)}>
                            {PLAN_LABELS[state.facilitySummary.facility.plan as FacilityPlan]} Plan
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={loadDashboard} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    {isAdmin ? (
                        <Link href="/admin/settings">
                            <Button className="gap-2">
                                <Settings className="h-4 w-4" />
                                Facility settings
                            </Button>
                        </Link>
                    ) : null}
                </div>
            </div>

            {error ? (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div>
                            <p className="font-medium text-foreground">Dashboard unavailable</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        <Button variant="outline" onClick={loadDashboard}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Patients"
                    value={String(state.patients.length)}
                    description={`${recentPatients.length} recently registered records surfaced`}
                    icon={Users}
                />
                <MetricCard
                    title="Appointments Today"
                    value={String(todayAppointments.length)}
                    description={`${confirmedAppointments.length} confirmed overall`}
                    icon={Calendar}
                />
                <MetricCard
                    title="Staff Members"
                    value={String(state.staff.length)}
                    description={`${doctorCount} doctors, ${adminCount} admins`}
                    icon={Stethoscope}
                />
                <MetricCard
                    title="Weekly Schedule"
                    value={String(state.facilitySummary?.schedules?.length ?? 0)}
                    description="Configured operating-day schedule entries"
                    icon={ClipboardList}
                />
            </div>

            {isAdmin && state.analytics && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>This Month</CardDescription>
                            <CardTitle className="text-2xl">
                                {state.analytics.totalAppointmentsThisMonth}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Appointments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Last Month</CardDescription>
                            <CardTitle className="text-2xl">
                                {state.analytics.totalAppointmentsLastMonth}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Appointments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Patients</CardDescription>
                            <CardTitle className="text-2xl">
                                {state.analytics.totalPatients}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Ever visited</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Doctors</CardDescription>
                            <CardTitle className="text-2xl">
                                {state.analytics.staffByRole["doctor"] ?? 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Active staff</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>
                                {isDoctor ? "Today's queue" : "Upcoming appointments"}
                            </CardTitle>
                            <CardDescription>
                                {isDoctor
                                    ? "Patients confirmed or checked-in for today"
                                    : "Immediate workload for this facility"}
                            </CardDescription>
                        </div>
                        <Link href={appointmentsHref}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                {isDoctor ? "Open consultations" : "Open appointments"}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {upcomingAppointments.length ? (
                            upcomingAppointments.map((appointment) => (
                                <Link
                                    key={appointment.id}
                                    href={appointmentsHref}
                                    className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {appointment.patient_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(appointment.appointment_date)} at{" "}
                                            {formatTime(appointment.start_time)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {appointment.reason_for_visit || "No visit reason recorded"}
                                        </p>
                                    </div>
                                    <Badge variant="outline">{appointment.status}</Badge>
                                </Link>
                            ))
                        ) : (
                            <EmptyState
                                title="No upcoming appointments"
                                description="Once patients book appointments, they will appear here."
                                href={appointmentsHref}
                                action={isDoctor ? "Open consultations" : "Manage appointments"}
                            />
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Quick actions</CardTitle>
                            <CardDescription>Jump into the main admin workflows</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <QuickAction
                                href="/admin/patients"
                                icon={Users}
                                label="Manage patients"
                            />
                            <QuickAction
                                href={appointmentsHref}
                                icon={CalendarClock}
                                label={isDoctor ? "Open consultations" : "Review appointments"}
                            />
                            {isAdmin ? (
                                <>
                                    <QuickAction
                                        href="/admin/staff"
                                        icon={UserPlus}
                                        label="Manage staff"
                                    />
                                    <QuickAction
                                        href="/admin/security"
                                        icon={Shield}
                                        label="Review security settings"
                                    />
                                </>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Operational notes</CardTitle>
                            <CardDescription>Signals derived from current records</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <OperationalRow
                                label="Pending appointments"
                                value={String(pendingAppointments.length)}
                                tone={pendingAppointments.length ? "warning" : "neutral"}
                            />
                            <OperationalRow
                                label="Recently added patients"
                                value={String(recentPatients.length)}
                                tone="neutral"
                            />
                            <OperationalRow
                                label="Recently added staff"
                                value={String(recentStaff.length)}
                                tone="neutral"
                            />
                            <OperationalRow
                                label="Facility active"
                                value={state.facilitySummary?.facility?.is_active ? "Yes" : "No"}
                                tone={
                                    state.facilitySummary?.facility?.is_active
                                        ? "success"
                                        : "warning"
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent registrations</CardTitle>
                        <CardDescription>Newest patient records at this facility</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentPatients.length ? (
                            recentPatients.map((patient) => (
                                <Link
                                    key={patient.id}
                                    href="/admin/patients"
                                    className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {patient.full_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {patient.email}
                                        </p>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {patient.created_at
                                            ? formatDate(patient.created_at)
                                            : "Unknown"}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <EmptyState
                                title="No patient records yet"
                                description="Patient registrations will appear here after intake."
                                href="/admin/patients"
                                action="Open patients"
                            />
                        )}
                    </CardContent>
                </Card>

                {isAdmin ? (
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent staff accounts</CardTitle>
                            <CardDescription>Latest staff records for this facility</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentStaff.length ? (
                                recentStaff.map((staffMember) => (
                                    <Link
                                        key={staffMember.id}
                                        href="/admin/staff"
                                        className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {staffMember.full_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {staffMember.email}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {staffMember.role ?? "unknown"}
                                        </Badge>
                                    </Link>
                                ))
                            ) : (
                                <EmptyState
                                    title="No staff records yet"
                                    description="Add facility staff to manage care operations."
                                    href="/admin/staff"
                                    action="Open staff"
                                />
                            )}
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: typeof Users;
}) {
    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-semibold text-foreground">{value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function QuickAction({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: typeof Users;
    label: string;
}) {
    return (
        <Link href={href}>
            <Button
                variant="outline"
                className="h-12 w-full justify-between gap-3 rounded-xl"
            >
                <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </span>
                <ArrowRight className="h-4 w-4" />
            </Button>
        </Link>
    );
}

function OperationalRow({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: "neutral" | "warning" | "success";
}) {
    const toneClasses =
        tone === "warning"
            ? "bg-amber-50 text-amber-800"
            : tone === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-muted/40 text-foreground";

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-2">
            <span className="text-muted-foreground">{label}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${toneClasses}`}>
                {value}
            </span>
        </div>
    );
}

function EmptyState({
    title,
    description,
    href,
    action,
}: {
    title: string;
    description: string;
    href: string;
    action: string;
}) {
    return (
        <div className="rounded-xl border border-dashed p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {description}
            </p>
            <Link href={href} className="mt-4 inline-flex">
                <Button>{action}</Button>
            </Link>
        </div>
    );
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(time: string) {
    const [hours = "00", minutes = "00"] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}
