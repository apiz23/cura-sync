"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, AlertCircle, Calendar, Pill, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { PatientHealthView, type HealthSyncSnapshot } from "@/components/patient-health-view";

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

export default function UserCaregiverPatientPage() {
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
            .then((body: { data: { link_id: string; patient: { id: string | null; full_name: string | null } }[] }) => {
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
            .then((json) => setMedications(json?.data ?? []))
            .catch((err: unknown) => setMedsError(err instanceof Error ? err.message : "Failed"))
            .finally(() => setMedsLoading(false));
    }, [authorized, patientId, activeTab, hasFetchedMeds]);

    const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
        { id: "health", label: "Health", icon: Activity },
        { id: "appointments", label: "Appointments", icon: Calendar },
        { id: "medications", label: "Medications", icon: Pill },
    ];

    if (!isLoaded || authorized === null) {
        return (
            <UserPageShell>
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </UserPageShell>
        );
    }

    if (authorized === false) {
        return (
            <UserPageShell>
                <UserPageHeader
                    icon={AlertCircle}
                    title="Access Denied"
                    description="You are not linked to this patient."
                    actions={
                        <Button variant="outline" onClick={() => router.push("/user/caregiver")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Caregiver
                        </Button>
                    }
                />
            </UserPageShell>
        );
    }

    return (
        <UserPageShell>
            <UserPageHeader
                icon={UserCircle}
                title={patientName ?? "Patient"}
                description="Read-only view of this patient's health data"
                actions={
                    <Button variant="outline" onClick={() => router.push("/user/caregiver")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> All Patients
                    </Button>
                }
                meta={
                    <Badge variant="outline" className="gap-2 px-3 py-1.5">
                        <UserCircle className="h-3 w-3" />
                        Caregiver view
                    </Badge>
                }
            />

            {/* Tab bar */}
            <div className="flex gap-1 border-b border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
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

            {/* Tab content */}
            {activeTab === "health" && (
                healthLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                    </div>
                ) : healthError ? (
                    <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                        <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                        <p className="text-sm">{healthError}</p>
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
                    <div className="rounded-2xl border border-dashed p-10 text-center">
                        <Calendar className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
                        <p className="mt-4 font-semibold text-foreground">No appointments found</p>
                    </div>
                ) : (
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Appointments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {appointments.map((appt) => (
                                <div key={appt.id} className="flex items-start justify-between rounded-xl border border-border/60 p-4">
                                    <div>
                                        <p className="font-medium text-foreground">{appt.facility_name}</p>
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
                            ))}
                        </CardContent>
                    </Card>
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
                    <div className="rounded-2xl border border-dashed p-10 text-center">
                        <Pill className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
                        <p className="mt-4 font-semibold text-foreground">No medications found</p>
                    </div>
                ) : (
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Medications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {medications.map((med) => (
                                <div key={med.id} className="flex items-start justify-between rounded-xl border border-border/60 p-4">
                                    <div>
                                        <p className="font-medium text-foreground">{med.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {med.dosage} · {med.frequency}
                                        </p>
                                    </div>
                                    <Badge variant={med.status === "ACTIVE" ? "default" : "secondary"}>
                                        {med.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )
            )}
        </UserPageShell>
    );
}
