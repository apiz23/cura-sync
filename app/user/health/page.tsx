"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Activity } from "lucide-react";

import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PatientHealthView,
    type HealthSyncSnapshot,
} from "@/components/patient-health-view";

type HealthSyncResponse = {
    success: boolean;
    data: {
        latest: HealthSyncSnapshot | null;
        recent: HealthSyncSnapshot[];
        count: number;
    };
};

export default function HealthTrackingPage() {
    const { user, isLoaded } = useUser();
    const [snapshots, setSnapshots] = useState<HealthSyncSnapshot[]>([]);
    const [latest, setLatest] = useState<HealthSyncSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !user) return;

        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/user/health-sync?days=7", {
                    cache: "no-store",
                });

                if (!res.ok) {
                    setError("Failed to load health data.");
                    return;
                }

                const json = (await res.json()) as HealthSyncResponse;

                if (!cancelled) {
                    setSnapshots(json.data?.recent ?? []);
                    setLatest(json.data?.latest ?? null);
                }
            } catch {
                if (!cancelled) {
                    setError("Unable to load health data right now.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [isLoaded, user]);

    return (
        <UserPageShell>
            <UserPageHeader
                icon={Activity}
                title="Health Tracking"
                description="Your health data synced from the CuraSync mobile app over the last 7 days."
            />

            {loading ? (
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-28 rounded-xl" />
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-56 rounded-xl" />
                        <Skeleton className="h-56 rounded-xl" />
                    </div>
                    <Skeleton className="h-56 rounded-xl" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                    {error}
                </div>
            ) : (
                <PatientHealthView
                    snapshots={snapshots}
                    isAdminView={false}
                    latestSyncedAt={latest?.syncedAt ?? null}
                    latestVendor={latest?.source.vendor ?? null}
                />
            )}
        </UserPageShell>
    );
}
