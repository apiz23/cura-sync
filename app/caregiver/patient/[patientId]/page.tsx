"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, AlertCircle, Calendar, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PatientHealthView, type HealthSyncSnapshot } from "@/components/patient-health-view";

type LinkedPatient = {
    link_id: string;
    patient: { id: string | null; full_name: string | null };
};

type Appointment = {
    id: string;
    facility_name: string;
    appointment_date: string;
    start_time: string;
    status: string;
    reason_for_visit: string | null;
};

type Medication = {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    status: string;
};

type Tab = "health" | "appointments" | "medications";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(value: string) {
    const [h, m] = value.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function CaregiverPatientPage() {
    const { user, isLoaded } = useUser();
    const params = useParams<{ patientId: string }>();
    const router = useRouter();
    const patientId = params.patientId;

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [patientName, setPatientName] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("health");

    const [snapshots, setSnapshots] = useState<HealthSyncSnapshot[]>([]);
    const [latest, setLatest] = useState<HealthSyncSnapshot | null>(null);
    const [healthLoading, setHealthLoading] = useState(true);
    const [healthError, setHealthError] = useState<string | null>(null);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [hasFetchedAppts, setHasFetchedAppts] = useState(false);
    const [apptLoading, setApptLoading] = useState(false);
    const [apptError, setApptError] = useState<string | null>(null);

    const [medications, setMedications] = useState<Medication[]>([]);
    const [hasFetchedMeds, setHasFetchedMeds] = useState(false);
    const [medsLoading, setMedsLoading] = useState(false);
    const [medsError, setMedsError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !user) return;
        const role = user.publicMetadata?.role as string | undefined;
        if (role !== "caregiver") { setAuthorized(false); return; }

        fetch("/api/caregiver/patients")
            .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then((body: { data: LinkedPatient[] }) => {
                const match = (body.data ?? []).find((l) => l.patient.id === patientId);
                if (!match) { setAuthorized(false); return; }
                setPatientName(match.patient.full_name);
                setAuthorized(true);
            })
            .catch(() => setAuthorized(false));
    }, [isLoaded, user, patientId]);

    useEffect(() => {
        if (authorized !== true) return;
        fetch(`/api/caregiver/patients/${patientId}/health-sync?days=7`)
            .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then((json) => {
                setSnapshots(json?.data?.recent ?? []);
                setLatest(json?.data?.latest ?? null);
            })
            .catch((err: unknown) => setHealthError(err instanceof Error ? err.message : "Failed"))
            .finally(() => setHealthLoading(false));
    }, [authorized, patientId]);

    useEffect(() => {
        if (authorized !== true || activeTab !== "appointments" || hasFetchedAppts) return;
        setHasFetchedAppts(true);
        setApptLoading(true);
        fetch(`/api/caregiver/patients/${patientId}/appointments`)
            .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then((json) => setAppointments(json?.data ?? []))
            .catch((err: unknown) => setApptError(err instanceof Error ? err.message : "Failed"))
            .finally(() => setApptLoading(false));
    }, [authorized, patientId, activeTab, hasFetchedAppts]);

    useEffect(() => {
        if (authorized !== true || activeTab !== "medications" || hasFetchedMeds) return;
        setHasFetchedMeds(true);
        setMedsLoading(true);
        fetch(`/api/caregiver/patients/${patientId}/medications`)
            .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then((json) => setMedications(json?.data ?? json ?? []))
            .catch((err: unknown) => setMedsError(err instanceof Error ? err.message : "Failed"))
            .finally(() => setMedsLoading(false));
    }, [authorized, patientId, activeTab, hasFetchedMeds]);

    if (!isLoaded || authorized === null) {
        return (
            <div className="min-h-screen bg-background px-4 py-8">
                <div className="mx-auto max-w-[960px] space-y-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (authorized === false) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="max-w-sm text-center space-y-4">
                    <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
                    <h1 className="text-xl font-bold text-foreground">Access denied</h1>
                    <p className="text-sm text-muted-foreground">You are not linked to this patient.</p>
                    <Button variant="outline" onClick={() => router.push("/caregiver/dashboard")}>
                        Back to dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
        { id: "health", label: "Health", icon: Activity },
        { id: "appointments", label: "Appointments", icon: Calendar },
        { id: "medications", label: "Medications", icon: Pill },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card">
                <div className="mx-auto max-w-[960px] px-4 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/caregiver/dashboard")} className="rounded-full" aria-label="Back to dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-foreground">{patientName ?? "Patient"}</span>
                    </div>
                </div>
                <div className="mx-auto max-w-[960px] px-4 md:px-6">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[960px] px-4 py-8 md:px-6">
                {activeTab === "health" && (
                    healthLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                        </div>
                    ) : healthError ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                            <p className="text-sm text-foreground">{healthError}</p>
                        </div>
                    ) : (
                        <PatientHealthView
                            snapshots={snapshots}
                            isAdminView={false}
                            latestSyncedAt={latest?.syncedAt ?? null}
                            latestVendor={latest?.source.vendor ?? null}
                        />
                    )
                )}

                {activeTab === "appointments" && (
                    apptLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                        </div>
                    ) : apptError ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <p className="text-sm">{apptError}</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                            <Calendar className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
                            <p className="mt-4 font-semibold text-foreground">No appointments found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map((appt) => (
                                <div key={appt.id} className="rounded-xl border border-border bg-card p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-foreground">{appt.facility_name}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {formatDate(appt.appointment_date)} · {formatTime(appt.start_time)}
                                            </p>
                                            {appt.reason_for_visit && (
                                                <p className="text-sm text-muted-foreground mt-1">{appt.reason_for_visit}</p>
                                            )}
                                        </div>
                                        <Badge variant={appt.status === "CONFIRMED" ? "default" : "secondary"}>
                                            {appt.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === "medications" && (
                    medsLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                        </div>
                    ) : medsError ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <p className="text-sm">{medsError}</p>
                        </div>
                    ) : medications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                            <Pill className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
                            <p className="mt-4 font-semibold text-foreground">No medications found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {medications.map((med) => (
                                <div key={med.id} className="rounded-xl border border-border bg-card p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-foreground">{med.name}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {med.dosage} · {med.frequency}
                                            </p>
                                        </div>
                                        <Badge variant={med.status === "ACTIVE" ? "default" : "secondary"}>
                                            {med.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
