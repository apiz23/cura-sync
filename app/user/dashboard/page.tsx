"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
    Activity,
    ArrowRight,
    Calendar,
    ClipboardList,
    Pill,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import type { Appointment, Medication } from "@/app/types";
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
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";

type UserProfile = {
    full_name: string | null;
    patient_profile?: {
        date_of_birth?: string | null;
        gender?: string | null;
        blood_type?: string | null;
        allergies?: string | null;
        emergency_contact?: string | null;
    } | null;
};

type HealthSyncSnapshot = {
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
};

type DashboardState = {
    profile: UserProfile | null;
    appointments: Appointment[];
    medications: Medication[];
    healthSync: {
        latest: HealthSyncSnapshot | null;
        recent: HealthSyncSnapshot[];
        count: number;
    } | null;
};

type DashboardRequestResult<T> = {
    data: T;
    ok: boolean;
    label: string;
};

const emptyState: DashboardState = {
    profile: null,
    appointments: [],
    medications: [],
    healthSync: null,
};

export default function UserDashboardPage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const userId = user?.id ?? null;
    const [state, setState] = useState<DashboardState>(emptyState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userInitials = useMemo(() => {
        const first = user?.firstName?.trim() ?? "";
        const last = user?.lastName?.trim() ?? "";
        const fromClerk =
            ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "";
        if (fromClerk) return fromClerk;

        const fromProfile = (state.profile?.full_name ?? "")
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");

        return fromProfile || "GU";
    }, [state.profile?.full_name, user?.firstName, user?.lastName]);

    const userDisplayName =
        state.profile?.full_name ?? user?.fullName ?? user?.username ?? "User";

    useEffect(() => {
        if (!isLoaded || !userId) return;

        let cancelled = false;

        async function loadDashboard() {
            setLoading(true);
            setError(null);

            try {
                const syncRes = await fetch("/api/auth/sync", {
                    method: "POST",
                    cache: "no-store",
                });

                if (!syncRes.ok) {
                    await syncRes.json().catch(() => null);
                }

                const [
                    profileResult,
                    appointmentsResult,
                    medicationsResult,
                    healthSyncResult,
                ] =
                    await Promise.all([
                        loadDashboardResource<UserProfile | null>(
                            "/api/user/profile",
                            "profile"
                        ),
                        loadDashboardResource<{ data?: Appointment[] }>(
                            "/api/appointments",
                            "appointments"
                        ),
                        loadDashboardResource<Medication[]>(
                            "/api/user/medications",
                            "medications"
                        ),
                        loadDashboardResource<{
                            data?: DashboardState["healthSync"];
                        }>("/api/user/health-sync?days=7", "health sync"),
                    ]);

                const failedSources = [
                    profileResult,
                    appointmentsResult,
                    medicationsResult,
                    healthSyncResult,
                ]
                    .filter((result) => !result.ok)
                    .map((result) => result.label);

                if (!cancelled) {
                    setState({
                        profile: profileResult.data,
                        appointments: Array.isArray(appointmentsResult.data?.data)
                            ? appointmentsResult.data.data
                            : [],
                        medications: Array.isArray(medicationsResult.data)
                            ? medicationsResult.data
                            : [],
                        healthSync: healthSyncResult.data?.data ?? null,
                    });

                    setError(
                        failedSources.length
                            ? `Some dashboard sections could not be loaded: ${failedSources.join(
                                  ", "
                              )}.`
                            : null
                    );
                }
            } catch (err) {
                console.error("Failed to load user dashboard", err);
                if (!cancelled) {
                    setError("Unable to load your dashboard right now.");
                    setState(emptyState);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [isLoaded, userId]);

    const todayIso = new Date().toISOString().slice(0, 10);

    const upcomingAppointments = useMemo(
        () =>
            state.appointments
                .filter(
                    (appointment) =>
                        appointment.appointment_date >= todayIso &&
                        appointment.status !== "CANCELLED"
                )
                .sort((a, b) =>
                    `${a.appointment_date}T${a.start_time}`.localeCompare(
                        `${b.appointment_date}T${b.start_time}`
                    )
                ),
        [state.appointments, todayIso]
    );

    const nextAppointment = upcomingAppointments[0] ?? null;
    const activeMedications = state.medications.filter(
        (medication) => medication.status === "ACTIVE"
    );
    const completedMedications = state.medications.filter(
        (medication) => medication.status === "COMPLETED"
    );
    const latestHealthSync = state.healthSync?.latest ?? null;
    const recentHealthSync = state.healthSync?.recent ?? [];
    const syncedSleepHours = latestHealthSync
        ? (latestHealthSync.summary.totalSleepMinutes / 60).toFixed(1)
        : null;

    const profileFields = [
        state.profile?.full_name,
        state.profile?.patient_profile?.date_of_birth,
        state.profile?.patient_profile?.gender,
        state.profile?.patient_profile?.blood_type,
        state.profile?.patient_profile?.emergency_contact,
    ];
    const completedProfileFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round(
        (completedProfileFields / profileFields.length) * 100
    );

    const activityItems = [
        ...upcomingAppointments.slice(0, 2).map((appointment) => ({
            title: `Appointment with ${appointment.facility_name}`,
            detail: `${formatDate(appointment.appointment_date)} at ${formatTime(
                appointment.start_time
            )}`,
            badge: appointment.status,
            href: "/user/appointments",
            icon: Calendar,
        })),
        ...activeMedications.slice(0, 2).map((medication) => ({
            title: medication.name,
            detail: [medication.dosage, medication.frequency].join(" | "),
            badge: medication.status,
            href: "/user/medications",
            icon: Pill,
        })),
    ].slice(0, 4);

    if (!loading && isLoaded && userId && state.profile === null) {
        router.replace("/user/profile?setup=true");
        return null;
    }

    return (
        <UserPageShell>
            {loading ? (
                <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                            <Skeleton className="h-10 w-72" />
                            <Skeleton className="h-4 w-96 max-w-full" />
                        </div>
                        <Skeleton className="h-9 w-40 rounded-full" />
                    </div>
                </div>
            ) : (
                <UserPageHeader
                    avatar={{
                        src: user?.imageUrl ?? null,
                        alt: userDisplayName,
                        fallback: userInitials,
                    }}
                    title={`Welcome back, ${userDisplayName}`}
                    description="This dashboard summarizes your real appointments, medications, and profile information."
                    meta={
                        <>
                            <Badge variant="outline" className="gap-2 px-3 py-1.5">
                                <Calendar className="h-3 w-3" />
                                <span>
                                    {upcomingAppointments.length} upcoming appointment
                                    {upcomingAppointments.length === 1 ? "" : "s"}
                                </span>
                            </Badge>
                            <Badge variant="outline" className="gap-2 px-3 py-1.5">
                                <Pill className="h-3 w-3" />
                                <span>
                                    {activeMedications.length} active medication
                                    {activeMedications.length === 1 ? "" : "s"}
                                </span>
                            </Badge>
                        </>
                    }
                />
            )}

            {error ? (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div>
                            <p className="font-medium text-foreground">Dashboard unavailable</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        <Link href="/user/profile">
                            <Button variant="outline">Open profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Upcoming Appointments"
                    value={String(upcomingAppointments.length)}
                    description={
                        nextAppointment
                            ? `Next: ${formatDate(nextAppointment.appointment_date)}`
                            : "No upcoming appointments"
                    }
                    icon={Calendar}
                />
                <SummaryCard
                    title="Active Medications"
                    value={String(activeMedications.length)}
                    description={
                        activeMedications.length
                            ? `${completedMedications.length} completed in history`
                            : "Add medication reminders to track treatment"
                    }
                    icon={Pill}
                />
                <SummaryCard
                    title="Profile Completion"
                    value={`${profileCompletion}%`}
                    description="Keep your health profile complete for safer care"
                    icon={ClipboardList}
                />
                <SummaryCard
                    title="Health Connect"
                    value={
                        latestHealthSync
                            ? latestHealthSync.summary.stepsCount.toLocaleString()
                            : "Off"
                    }
                    description={
                        latestHealthSync
                            ? `Last sync ${formatRelativeDateTime(
                                  latestHealthSync.syncedAt
                              )}`
                            : "Open the mobile app to sync wearables"
                    }
                    icon={Activity}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recent activity</CardTitle>
                            <CardDescription>
                                Based on your real appointments and medications
                            </CardDescription>
                        </div>
                        <Link href="/user/appointments">
                            <Button variant="ghost" size="sm" className="gap-2">
                                View appointments
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {activityItems.length ? (
                            activityItems.map((item) => (
                                <Link
                                    key={`${item.title}-${item.detail}`}
                                    href={item.href}
                                    className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.detail}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{item.badge}</Badge>
                                </Link>
                            ))
                        ) : (
                            <EmptyState
                                title="Nothing to show yet"
                                description="Book your first appointment or add your medications to populate this dashboard."
                                href="/user/appointments"
                                action="Browse facilities"
                            />
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Quick actions</CardTitle>
                            <CardDescription>
                                Shortcuts into the patient journey
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <ActionLink
                                href="/user/appointments"
                                icon={Calendar}
                                label="Book or view appointments"
                            />
                            <ActionLink
                                href="/user/medications"
                                icon={Pill}
                                label="Manage medications"
                            />
                            <ActionLink
                                href="/user/symptom-analyzer"
                                icon={Sparkles}
                                label="Use symptom analyzer"
                            />
                            <ActionLink
                                href="/user/profile"
                                icon={ShieldCheck}
                                label="Update health profile"
                            />
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Wearable snapshot</CardTitle>
                            <CardDescription>
                                Latest server snapshot uploaded from Health Connect
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 text-sm">
                            <SummaryRow
                                label="Last sync"
                                value={
                                    latestHealthSync
                                        ? formatRelativeDateTime(
                                              latestHealthSync.syncedAt
                                          )
                                        : "Not synced yet"
                                }
                            />
                            <SummaryRow
                                label="Steps"
                                value={
                                    latestHealthSync
                                        ? latestHealthSync.summary.stepsCount.toLocaleString()
                                        : "0"
                                }
                            />
                            <SummaryRow
                                label="Sleep"
                                value={
                                    latestHealthSync
                                        ? `${syncedSleepHours ?? "0.0"} hours`
                                        : "0 hours"
                                }
                            />
                            <SummaryRow
                                label="Avg heart rate"
                                value={
                                    latestHealthSync?.summary.averageHeartRateBpm !==
                                    null
                                        ? `${latestHealthSync?.summary.averageHeartRateBpm} bpm`
                                        : "No samples"
                                }
                            />
                            <SummaryRow
                                label="Total uploads"
                                value={String(state.healthSync?.count ?? 0)}
                            />

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Recent uploads
                                </p>
                                {recentHealthSync.length ? (
                                    <div className="space-y-2">
                                        {recentHealthSync.slice(0, 5).map((snapshot) => (
                                            <div
                                                key={snapshot.id}
                                                className="flex items-center justify-between gap-4 rounded-lg border bg-background/40 px-3 py-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-foreground">
                                                        {formatRelativeDateTime(
                                                            snapshot.syncedAt
                                                        )}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {snapshot.source?.attribution ??
                                                            "Synced from Health Connect"}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right text-xs text-muted-foreground">
                                                    <p>
                                                        <span className="font-medium text-foreground">
                                                            {formatInteger(
                                                                snapshot.summary.stepsCount
                                                            )}
                                                        </span>{" "}
                                                        steps
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-foreground">
                                                            {formatSleepHours(
                                                                snapshot.summary.totalSleepMinutes
                                                            )}
                                                        </span>
                                                        h sleep
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        Sync in the mobile app to see your wearable history
                                        here.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Care summary</CardTitle>
                            <CardDescription>
                                Current state of your account and treatment data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <SummaryRow
                                label="Next appointment"
                                value={
                                    nextAppointment
                                        ? `${formatDate(
                                              nextAppointment.appointment_date
                                          )}, ${formatTime(nextAppointment.start_time)}`
                                        : "Not scheduled"
                                }
                            />
                            <SummaryRow
                                label="Medication records"
                                value={String(state.medications.length)}
                            />
                            <SummaryRow
                                label="Allergies recorded"
                                value={
                                    state.profile?.patient_profile?.allergies
                                        ? "Yes"
                                        : "Not added"
                                }
                            />
                            <SummaryRow
                                label="Emergency contact"
                                value={
                                    state.profile?.patient_profile?.emergency_contact ??
                                    "Missing"
                                }
                            />
                            <SummaryRow
                                label="Wearable sync"
                                value={
                                    latestHealthSync
                                        ? formatDateTime(latestHealthSync.syncedAt)
                                        : "Not connected"
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </UserPageShell>
    );
}

async function loadDashboardResource<T>(
    url: string,
    label: string
): Promise<DashboardRequestResult<T>> {
    try {
        const response = await fetch(url, { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as T;

        if (!response.ok) {
            console.error(`Dashboard ${label} request failed`, {
                status: response.status,
                data,
            });
        }

        return {
            data,
            ok: response.ok,
            label,
        };
    } catch (error) {
        console.error(`Dashboard ${label} request threw`, error);
        return {
            data: null as T,
            ok: false,
            label,
        };
    }
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: typeof Activity;
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

function ActionLink({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: typeof Activity;
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

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-3 py-2">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium text-foreground">{value}</span>
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

function formatInteger(value: unknown) {
    const asNumber = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(asNumber)) return "0";
    return Math.round(asNumber).toLocaleString();
}

function formatSleepHours(totalSleepMinutes: unknown) {
    const minutes =
        typeof totalSleepMinutes === "number"
            ? totalSleepMinutes
            : Number(totalSleepMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return "0.0";
    return (minutes / 60).toFixed(1);
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
    const target = new Date(value);
    const diffMs = Date.now() - target.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
        return "less than 1 hour ago";
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) {
        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }

    return formatDateTime(value);
}
