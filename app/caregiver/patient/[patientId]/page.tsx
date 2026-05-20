"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientHealthView, type HealthSyncSnapshot } from "@/components/patient-health-view";

type LinkedPatient = {
    link_id: string;
    patient: {
        id: string | null;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        blood_type: string | null;
        allergies: string | null;
        chronic_conditions: string | null;
    };
};

export default function CaregiverPatientPage() {
    const { user, isLoaded } = useUser();
    const params = useParams<{ patientId: string }>();
    const router = useRouter();
    const patientId = params.patientId;

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [patientName, setPatientName] = useState<string | null>(null);
    const [snapshots, setSnapshots] = useState<HealthSyncSnapshot[]>([]);
    const [latest, setLatest] = useState<HealthSyncSnapshot | null>(null);
    const [healthLoading, setHealthLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Verify the caregiver has a link to this patient.
    useEffect(() => {
        if (!isLoaded || !user) return;
        const role = user.publicMetadata?.role as string | undefined;
        if (role !== "caregiver") { setAuthorized(false); return; }

        fetch("/api/caregiver/patients")
            .then((r) => r.json())
            .then((body: { data: LinkedPatient[] }) => {
                const match = (body.data ?? []).find((l) => l.patient.id === patientId);
                if (!match) { setAuthorized(false); return; }
                setPatientName(match.patient.full_name);
                setAuthorized(true);
            })
            .catch(() => setAuthorized(false));
    }, [isLoaded, user, patientId]);

    // Load health data once authorized.
    useEffect(() => {
        if (authorized !== true) return;

        fetch(`/api/patients/${patientId}/health-sync?days=7`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
                setSnapshots(json?.data?.recent ?? []);
                setLatest(json?.data?.latest ?? null);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load health data");
            })
            .finally(() => setHealthLoading(false));
    }, [authorized, patientId]);

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
                    <p className="text-sm text-muted-foreground">
                        You are not linked to this patient, or your session has expired.
                    </p>
                    <Button variant="outline" onClick={() => router.push("/caregiver/dashboard")}>
                        Back to dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card">
                <div className="mx-auto max-w-[960px] px-4 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/caregiver/dashboard")}
                            className="rounded-full"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                                {patientName ?? "Patient"} — Health Data
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[960px] px-4 py-8 md:px-6">
                {healthLoading ? (
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                        </div>
                        <Skeleton className="h-56 rounded-xl" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                        <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                        <p className="text-sm text-foreground">{error}</p>
                    </div>
                ) : (
                    <PatientHealthView
                        snapshots={snapshots}
                        isAdminView={false}
                        latestSyncedAt={latest?.syncedAt ?? null}
                        latestVendor={latest?.source.vendor ?? null}
                    />
                )}
            </div>
        </div>
    );
}
