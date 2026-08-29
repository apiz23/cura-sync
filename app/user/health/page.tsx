"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PatientHealthView,
    type HealthSyncSnapshot,
} from "@/components/patient-health-view";
import { EASE } from "@/hooks/use-motion-config";

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
        const dismissed = alerts.find((a) => a.id === id);
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        fetch("/api/user/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [id] }),
        }).catch(() => {
            if (dismissed) {
                setAlerts((prev) => [...prev, dismissed]);
            }
        });
    }

    const severityIconClass: Record<string, string> = {
        CRITICAL: "text-destructive",
        WARNING: "text-amber-500 dark:text-amber-400",
        INFO: "text-primary",
    };

    return (
        <UserPageShell>
            <motion.div
                className="contents"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
            >
            <UserPageHeader
                sectionLabel="Health Tracking"
                title="Wearable & Health Data"
                description="Your health data synced from the CuraSync mobile app over the last 7 days."
            />

            {alerts.length > 0 && (
                <div>
                    {alerts.map((alert) => {
                        const colorClass = severityIconClass[alert.severity] ?? severityIconClass.INFO;
                        return (
                            <div
                                key={alert.id}
                                className="flex items-start gap-3 border-b border-border/70 py-3 last:border-0"
                            >
                                <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${colorClass}`} />
                                <div className="flex-1 text-sm">
                                    <span className={`font-semibold ${colorClass}`}>{alert.title}. </span>
                                    <span className="text-muted-foreground">{alert.body}</span>
                                </div>
                                <button
                                    onClick={() => dismissAlert(alert.id)}
                                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label="Dismiss alert"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
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
            </motion.div>
        </UserPageShell>
    );
}
