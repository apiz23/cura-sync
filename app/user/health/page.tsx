"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Activity, X, AlertTriangle } from "lucide-react";

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

type HealthNotification = {
    id: string;
    type: string;
    title: string;
    body: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    read: boolean;
    metadata: Record<string, unknown> | null;
    created_at: string;
};

export default function HealthTrackingPage() {
    const { user, isLoaded } = useUser();
    const [snapshots, setSnapshots] = useState<HealthSyncSnapshot[]>([]);
    const [latest, setLatest] = useState<HealthSyncSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<HealthNotification[]>([]);

    useEffect(() => {
        if (!isLoaded || !user) return;

        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const [syncRes, notifRes] = await Promise.all([
                    fetch("/api/user/health-sync?days=7", { cache: "no-store" }),
                    fetch("/api/user/notifications", { cache: "no-store" }),
                ]);

                if (!syncRes.ok) {
                    setError("Failed to load health data.");
                    return;
                }

                const json = (await syncRes.json()) as HealthSyncResponse;

                if (!cancelled) {
                    setSnapshots(json.data?.recent ?? []);
                    setLatest(json.data?.latest ?? null);
                }

                if (notifRes.ok) {
                    const notifJson = await notifRes.json();
                    if (!cancelled) {
                        setAlerts((notifJson.data ?? []) as HealthNotification[]);
                    }
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

    function dismissAlert(id: string) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        fetch("/api/user/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [id] }),
        }).catch(() => undefined);
    }

    const severityStyles: Record<string, string> = {
        CRITICAL: "border-destructive/40 bg-destructive/10 text-destructive",
        WARNING: "border-chart-5/40 bg-chart-5/10 text-chart-5",
        INFO: "border-chart-2/40 bg-chart-2/10 text-chart-2",
    };

    return (
        <UserPageShell>
            <UserPageHeader
                icon={Activity}
                title="Health Tracking"
                description="Your health data synced from the CuraSync mobile app over the last 7 days."
            />

            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-base ${severityStyles[alert.severity] ?? severityStyles.WARNING}`}
                        >
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div className="flex-1">
                                <span className="font-semibold">{alert.title}.</span>{" "}
                                {alert.body}
                            </div>
                            <button
                                onClick={() => dismissAlert(alert.id)}
                                className="shrink-0 opacity-60 hover:opacity-100"
                                aria-label="Dismiss alert"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-base text-destructive">
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
