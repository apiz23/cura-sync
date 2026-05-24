"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarClock,
    CheckCircle,
    ChevronRight,
    Clock,
    FileText,
    Loader2,
    RefreshCw,
    Stethoscope,
    User,
    UserRoundSearch,
} from "lucide-react";
import { useAuth } from "@/components/authprovideradmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Appointment } from "@/app/types";
import { AppointmentSheet } from "../appointments/AppointmentSheet";

function formatTime(time: string) {
    const [hours = "00", minutes = "00"] = time.split(":");
    const d = new Date();
    d.setHours(Number(hours), Number(minutes), 0, 0);
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(d);
}

function statusBadgeClass(status: Appointment["status"]) {
    if (status === "CHECKED_IN") {
        return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    }

    return "border-amber-500/35 bg-amber-500/15 text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-300";
}

export default function ConsultationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completingId, setCompletingId] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] =
        useState<Appointment | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [summaryAppointment, setSummaryAppointment] =
        useState<Appointment | null>(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [summarySaving, setSummarySaving] = useState(false);
    const [summaryFields, setSummaryFields] = useState({
        reason: "",
        diagnosis_summary: "",
        notes: "",
    });

    const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const fetchQueue = useCallback(async () => {
        if (!user?.facility_id) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/appointments/by-facility?facilityId=${user.facility_id}`,
                { cache: "no-store" }
            );
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error || "Failed to load queue");

            const todayQueue = (Array.isArray(data) ? data : []).filter(
                (a: Appointment) =>
                    a.appointment_date === todayIso &&
                    (a.status === "CHECKED_IN" || a.status === "CONFIRMED")
            );

            todayQueue.sort((a: Appointment, b: Appointment) => {
                if (a.status !== b.status) {
                    return a.status === "CHECKED_IN" ? -1 : 1;
                }
                return a.start_time.localeCompare(b.start_time);
            });

            setAppointments(todayQueue);
        } catch (err) {
            console.error("[ConsultationsPage] fetchQueue:", err);
            const msg = err instanceof Error ? err.message : "Failed to load queue";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [user?.facility_id, todayIso]);

    useEffect(() => {
        if (!authLoading && user?.facility_id) fetchQueue();
    }, [authLoading, user?.facility_id, fetchQueue]);

    function openAppointmentSheet(appointment: Appointment) {
        setSelectedAppointment(appointment);
        setSheetOpen(true);
    }

    function openSummarySheet(appointment: Appointment) {
        setSummaryAppointment(appointment);
        setSummaryFields({
            reason: appointment.reason_for_visit ?? "",
            diagnosis_summary: "",
            notes: "",
        });
        setSummaryOpen(true);
    }

    async function handleSaveSummary() {
        if (!summaryAppointment?.profile_id) {
            toast.error("Patient profile is missing for this appointment");
            return;
        }

        setSummarySaving(true);
        try {
            const res = await fetch(
                `/api/patients/${summaryAppointment.profile_id}/records`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        record_type: "encounter",
                        encounter_type: "CLINIC",
                        encounter_date: new Date().toISOString(),
                        facility_name:
                            user?.facility_name ??
                            summaryAppointment.facility_name ??
                            null,
                        provider_name: user?.full_name || user?.email || null,
                        reason: summaryFields.reason.trim() || null,
                        diagnosis_summary:
                            summaryFields.diagnosis_summary.trim() || null,
                        notes: summaryFields.notes.trim() || null,
                    }),
                }
            );

            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(payload?.error || "Failed to save checkup summary");
            }

            toast.success("Today's checkup summary saved");
            setSummaryOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save summary");
        } finally {
            setSummarySaving(false);
        }
    }

    async function handleComplete(appointment: Appointment) {
        if (appointment.status !== "CHECKED_IN") {
            toast.error("Patient must be checked in before completing consultation");
            return;
        }

        setCompletingId(appointment.id);
        try {
            const res = await fetch(`/api/appointments/${appointment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "COMPLETED" }),
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(payload?.error || "Failed to complete consultation");
            }

            setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
            toast.success(`Consultation with ${appointment.patient_name} completed`);
        } catch (err) {
            console.error("[ConsultationsPage] handleComplete:", err);
            toast.error(err instanceof Error ? err.message : "Failed to complete");
        } finally {
            setCompletingId(null);
        }
    }

    const checkedInCount = appointments.filter(
        (a) => a.status === "CHECKED_IN"
    ).length;
    const confirmedCount = appointments.filter(
        (a) => a.status === "CONFIRMED"
    ).length;

    if (authLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user?.facility_id) {
        return (
            <div className="p-6 text-base text-muted-foreground">
                No facility assigned to your account. Contact an administrator.
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Stethoscope className="size-4" />
                        Doctor queue
                    </div>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                        Today&apos;s Consultations
                    </h1>
                    <p className="mt-1 text-base text-muted-foreground">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQueue}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Queue total</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            {appointments.length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Ready now</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            {checkedInCount}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <p className="text-base text-muted-foreground">Waiting check-in</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            {confirmedCount}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {error ? (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 text-base text-destructive">
                        {error}
                    </CardContent>
                </Card>
            ) : null}

            {loading ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
            ) : appointments.length === 0 ? (
                <Card>
                    <CardContent className="px-6 py-12 text-center">
                        <CheckCircle className="mx-auto mb-3 size-10 text-emerald-600" />
                        <p className="font-medium text-foreground">No patients in queue</p>
                        <p className="mt-1 text-base text-muted-foreground">
                            All done for today, or no patients have been checked in yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {appointments.map((appt) => {
                        const canComplete = appt.status === "CHECKED_IN";
                        const patientHref = appt.profile_id
                            ? `/admin/patients/${appt.profile_id}`
                            : null;

                        return (
                            <Card
                                key={appt.id}
                                className="border-border bg-card transition-colors hover:bg-muted/20"
                            >
                                <CardContent className="p-4">
                                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                        <div className="flex min-w-0 gap-4">
                                            <Avatar className="size-12 shrink-0 border border-border">
                                                <AvatarImage
                                                    src={appt.patient_avatar ?? undefined}
                                                    alt={appt.patient_name}
                                                />
                                                <AvatarFallback>
                                                    <User className="size-4" />
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate font-semibold text-foreground">
                                                        {appt.patient_name}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={statusBadgeClass(appt.status)}
                                                    >
                                                        {appt.status === "CHECKED_IN"
                                                            ? "Checked in"
                                                            : "Confirmed"}
                                                    </Badge>
                                                </div>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="size-3.5" />
                                                        {formatTime(appt.start_time)} &ndash;{" "}
                                                        {formatTime(appt.end_time)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarClock className="size-3.5" />
                                                        Appointment #{appt.id.slice(0, 8)}
                                                    </span>
                                                </div>

                                                <div className="mt-3 rounded-lg border border-border bg-background/60 p-3">
                                                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        <FileText className="size-3.5" />
                                                        Reason for visit
                                                    </div>
                                                    <p className="line-clamp-2 text-base text-foreground">
                                                        {appt.reason_for_visit ||
                                                            "No reason provided yet."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                                            {patientHref ? (
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="justify-start gap-2"
                                                >
                                                    <Link href={patientHref}>
                                                        <UserRoundSearch className="size-4" />
                                                        Open profile
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    className="justify-start gap-2"
                                                >
                                                    <UserRoundSearch className="size-4" />
                                                    Open profile
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="justify-start gap-2"
                                                onClick={() => openAppointmentSheet(appt)}
                                            >
                                                Details
                                                <ChevronRight className="size-4" />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="justify-start gap-2"
                                                onClick={() => openSummarySheet(appt)}
                                            >
                                                <FileText className="size-4" />
                                                Add summary
                                            </Button>

                                            <Button
                                                size="sm"
                                                disabled={!canComplete || completingId === appt.id}
                                                onClick={() => handleComplete(appt)}
                                                className="justify-start gap-2"
                                            >
                                                {completingId === appt.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="size-4" />
                                                )}
                                                Complete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {appointments.length > 0 ? (
                <p className="text-right text-base text-muted-foreground">
                    {checkedInCount} checked in | {confirmedCount} confirmed
                </p>
            ) : null}

            <AppointmentSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                appointment={selectedAppointment}
                onUpdated={(updated) => {
                    if (
                        updated.appointment_date !== todayIso ||
                        (updated.status !== "CHECKED_IN" &&
                            updated.status !== "CONFIRMED")
                    ) {
                        setAppointments((prev) =>
                            prev.filter((appointment) => appointment.id !== updated.id)
                        );
                        return;
                    }

                    setAppointments((prev) =>
                        prev.map((appointment) =>
                            appointment.id === updated.id ? updated : appointment
                        )
                    );
                }}
            />

            <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg p-4">
                    <SheetHeader>
                        <SheetTitle>Today&apos;s Checkup Summary</SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 space-y-5">
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                            <p className="text-base font-semibold text-foreground">
                                {summaryAppointment?.patient_name ?? "Patient"}
                            </p>
                            <p className="mt-1 text-base text-muted-foreground">
                                This will be saved under the patient&apos;s Medical History
                                as a clinic encounter.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="checkup-reason">Reason for visit</Label>
                            <Input
                                id="checkup-reason"
                                value={summaryFields.reason}
                                onChange={(event) =>
                                    setSummaryFields((prev) => ({
                                        ...prev,
                                        reason: event.target.value,
                                    }))
                                }
                                placeholder="Chief complaint or visit reason"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="checkup-diagnosis">Diagnosis summary</Label>
                            <Textarea
                                id="checkup-diagnosis"
                                rows={5}
                                value={summaryFields.diagnosis_summary}
                                onChange={(event) =>
                                    setSummaryFields((prev) => ({
                                        ...prev,
                                        diagnosis_summary: event.target.value,
                                    }))
                                }
                                placeholder="Clinical impression, findings, assessment, or diagnosis..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="checkup-notes">Plan and notes</Label>
                            <Textarea
                                id="checkup-notes"
                                rows={4}
                                value={summaryFields.notes}
                                onChange={(event) =>
                                    setSummaryFields((prev) => ({
                                        ...prev,
                                        notes: event.target.value,
                                    }))
                                }
                                placeholder="Treatment plan, advice, follow-up, referral, or extra notes..."
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSummaryOpen(false)}
                                disabled={summarySaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => void handleSaveSummary()}
                                disabled={summarySaving}
                            >
                                {summarySaving ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <FileText className="mr-2 size-4" />
                                )}
                                Save summary
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
