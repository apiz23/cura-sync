"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, Loader2, RefreshCw, Stethoscope, User } from "lucide-react";
import { useAuth } from "@/components/authprovideradmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { Appointment } from "@/app/types";

function formatTime(time: string) {
    const [hours = "00", minutes = "00"] = time.split(":");
    const d = new Date();
    d.setHours(Number(hours), Number(minutes), 0, 0);
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d);
}

export default function ConsultationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completingId, setCompletingId] = useState<string | null>(null);

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
            // CHECKED_IN first, then by time
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
            if (!res.ok) throw new Error(payload?.error || "Failed to complete consultation");
            setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
            toast.success(`Consultation with ${appointment.patient_name} completed`);
        } catch (err) {
            console.error("[ConsultationsPage] handleComplete:", err);
            toast.error(err instanceof Error ? err.message : "Failed to complete");
        } finally {
            setCompletingId(null);
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-64">
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
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Stethoscope className="size-6" />
                        Today&apos;s Consultations
                    </h1>
                    <p className="text-muted-foreground text-base mt-1">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric",
                        })}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchQueue} disabled={loading}>
                    <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6 text-destructive text-base">{error}</CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
            ) : appointments.length === 0 ? (
                <Card>
                    <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
                        <CheckCircle className="size-10 mx-auto mb-3 text-green-500" />
                        <p className="font-medium">No patients in queue</p>
                        <p className="text-base">All done for today, or no check-ins yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {appointments.map((appt) => (
                        <Card key={appt.id} className="flex items-center gap-4 p-4">
                            <Avatar className="size-10 shrink-0">
                                <AvatarImage src={appt.patient_avatar ?? undefined} />
                                <AvatarFallback>
                                    <User className="size-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{appt.patient_name}</p>
                                <p className="text-base text-muted-foreground flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {formatTime(appt.start_time)} – {formatTime(appt.end_time)}
                                </p>
                                {appt.reason_for_visit && (
                                    <p className="text-base text-muted-foreground mt-0.5 truncate">
                                        {appt.reason_for_visit}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Badge
                                    className={
                                        appt.status === "CHECKED_IN"
                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                            : "bg-amber-100 text-amber-700 border-amber-200"
                                    }
                                >
                                    {appt.status === "CHECKED_IN" ? "Checked In" : "Confirmed"}
                                </Badge>
                                <Button
                                    size="sm"
                                    disabled={
                                        appt.status !== "CHECKED_IN" ||
                                        completingId === appt.id
                                    }
                                    onClick={() => handleComplete(appt)}
                                >
                                    {completingId === appt.id ? (
                                        <Loader2 className="size-4 animate-spin mr-1" />
                                    ) : (
                                        <CheckCircle className="size-4 mr-1" />
                                    )}
                                    Complete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {appointments.length > 0 && (
                <p className="text-base text-muted-foreground text-right">
                    {appointments.filter((a) => a.status === "CHECKED_IN").length} checked in ·{" "}
                    {appointments.filter((a) => a.status === "CONFIRMED").length} confirmed
                </p>
            )}
        </div>
    );
}
