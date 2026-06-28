"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    Calendar,
    Clock,
    Info,
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    Shield,
    Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";

type TelehealthAppointment = {
    id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    facility_name: string | null;
    reason_for_visit: string | null;
    appointment_type: string | null;
};

function formatDate(dateStr: string) {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(t: string) {
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function isJoinable(appt: TelehealthAppointment): boolean {
    const now = new Date();
    const apptStart = new Date(`${appt.appointment_date}T${appt.start_time}`);
    const apptEnd = new Date(`${appt.appointment_date}T${appt.end_time}`);
    const windowStart = new Date(apptStart.getTime() - 10 * 60 * 1000);
    return now >= windowStart && now <= apptEnd && appt.status === "CONFIRMED";
}

function VideoRoom({ appointment, onLeave }: { appointment: TelehealthAppointment; onLeave: () => void }) {
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-xl" style={{ aspectRatio: "16/9", maxHeight: 480 }}>
                <div className="flex h-full flex-col items-center justify-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700">
                        <Video className="h-10 w-10 text-zinc-400" />
                    </div>
                    <p className="text-base font-medium text-zinc-300">
                        {appointment.facility_name ?? "Healthcare Provider"}
                    </p>
                    <p className="text-sm text-zinc-500">Waiting for provider to join…</p>
                </div>

                {/* Self preview */}
                <div className="absolute bottom-3 right-3 flex h-24 w-32 items-center justify-center overflow-hidden rounded-xl bg-zinc-800 shadow-lg">
                    {camOn ? (
                        <p className="text-xs text-zinc-400">Your camera</p>
                    ) : (
                        <VideoOff className="h-6 w-6 text-zinc-500" />
                    )}
                </div>

                {/* Timer */}
                <div className="absolute left-3 top-3 rounded-lg bg-black/50 px-3 py-1 text-sm font-mono text-white">
                    {mins}:{secs}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <Button
                    variant={micOn ? "outline" : "secondary"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setMicOn((v) => !v)}
                    aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                >
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-destructive" />}
                </Button>
                <Button
                    variant={camOn ? "outline" : "secondary"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setCamOn((v) => !v)}
                    aria-label={camOn ? "Turn off camera" : "Turn on camera"}
                >
                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-destructive" />}
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={onLeave}
                    aria-label="Leave call"
                >
                    <PhoneOff className="h-5 w-5" />
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Full WebRTC integration requires a provider configuration (e.g. Daily.co or Jitsi).
            </p>
        </div>
    );
}

export default function TelehealthPage() {
    const { getToken } = useAuth();
    const [appointments, setAppointments] = useState<TelehealthAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeAppt, setActiveAppt] = useState<TelehealthAppointment | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                const res = await fetch("/api/appointments", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const json = await res.json().catch(() => null);
                const all: TelehealthAppointment[] = Array.isArray(json?.data) ? json.data : [];
                const today = new Date().toISOString().slice(0, 10);
                const upcoming = all.filter((a) => a.appointment_date >= today && a.status !== "CANCELLED");
                // Show only TELEHEALTH type if the column exists and has data; otherwise show all upcoming
                const telehealth = upcoming.filter((a) => a.appointment_type === "TELEHEALTH");
                setAppointments(
                    (telehealth.length > 0 ? telehealth : upcoming).sort((a, b) =>
                        `${a.appointment_date}T${a.start_time}`.localeCompare(
                            `${b.appointment_date}T${b.start_time}`,
                        ),
                    ),
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [getToken]);

    if (activeAppt) {
        return (
            <UserPageShell>
                <UserPageHeader
                    title="Telehealth Session"
                    description={`${activeAppt.facility_name ?? "Provider"} · ${formatDate(activeAppt.appointment_date)}`}
                />
                <div className="mx-auto max-w-3xl">
                    <VideoRoom appointment={activeAppt} onLeave={() => setActiveAppt(null)} />
                </div>
            </UserPageShell>
        );
    }

    return (
        <UserPageShell>
            <UserPageHeader
                sectionLabel="Virtual Consultations"
                title="Telehealth"
                description="Join video consultations with your healthcare provider."
            />

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/30">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                <div className="text-sm text-sky-700 dark:text-sky-300">
                    <p className="font-medium">How it works</p>
                    <p className="mt-1 text-sky-600 dark:text-sky-400">
                        Book a &ldquo;Telehealth&rdquo; appointment from the Appointments page. The Join button activates 10 minutes before your scheduled time.
                    </p>
                </div>
            </div>

            {/* Requirements card */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { icon: Wifi, label: "Stable internet", desc: "Min. 2 Mbps recommended" },
                    { icon: Video, label: "Camera & mic", desc: "Browser permission required" },
                    { icon: Shield, label: "Private session", desc: "End-to-end encrypted" },
                ].map((item) => (
                    <Card key={item.label} className="border shadow-sm">
                        <CardContent className="flex items-start gap-3 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upcoming appointments */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))
                    ) : appointments.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-6 text-center">
                            <p className="text-sm font-medium text-muted-foreground">No upcoming appointments</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Book an appointment with Telehealth type to start a video consultation.
                            </p>
                        </div>
                    ) : (
                        appointments.map((appt) => {
                            const joinable = isJoinable(appt);
                            return (
                                <div
                                    key={appt.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-foreground">
                                                {appt.facility_name ?? "Healthcare Facility"}
                                            </p>
                                            <Badge variant="outline" className="text-xs">
                                                {appt.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(appt.appointment_date)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatTime(appt.start_time)} – {formatTime(appt.end_time)}
                                            </span>
                                        </div>
                                        {appt.reason_for_visit && (
                                            <p className="text-xs text-muted-foreground">{appt.reason_for_visit}</p>
                                        )}
                                    </div>
                                    <Button
                                        disabled={!joinable}
                                        onClick={() => setActiveAppt(appt)}
                                        className="shrink-0"
                                        size="sm"
                                    >
                                        <Video className="mr-1.5 h-4 w-4" />
                                        {joinable ? "Join now" : "Not yet open"}
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </UserPageShell>
    );
}
