"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Lock, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";

// ── Types ─────────────────────────────────────────────────────────────────────

type AuditEntry = {
    id: string;
    actor_id: string;
    actor_type: string;
    action: "CREATE" | "READ" | "UPDATE" | "DELETE" | string;
    resource_type: string;
    resource_id: string | null;
    created_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function actionVariant(action: string) {
    if (action === "CREATE") return "bg-primary/10 text-primary";
    if (action === "UPDATE") return "bg-warning/20 text-warning-foreground";
    if (action === "DELETE") return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
}

function resourceLabel(resourceType: string) {
    const map: Record<string, string> = {
        profile: "Profile",
        appointment: "Appointment",
        medication: "Medication",
        health_sync: "Health Sync",
        patient_profile: "Patient Profile",
        condition: "Condition",
        allergy: "Allergy",
        procedure: "Procedure",
        encounter: "Encounter",
    };
    return map[resourceType] ?? resourceType;
}

function formatTimestamp(value: string) {
    return new Date(value).toLocaleString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function shortId(id: string) {
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlockchainPage() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/user/audit-logs")
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to load audit trail");
                const body = await res.json() as { data: AuditEntry[] };
                return body.data ?? [];
            })
            .then((data) => {
                if (!cancelled) setEntries(data);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    return (
        <UserPageShell>
            <UserPageHeader
                icon={ShieldCheck}
                title="Blockchain Security"
                description="Every action on your health data is recorded in a tamper-evident audit trail. These logs cannot be altered after creation."
                meta={
                    !loading ? (
                        <Badge variant="outline" className="gap-2 px-3 py-1.5">
                            <Lock className="h-3 w-3" />
                            <span>{entries.length} immutable {entries.length === 1 ? "record" : "records"}</span>
                        </Badge>
                    ) : null
                }
            />

            {/* How it works */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        icon: Lock,
                        title: "Tamper-evident",
                        body: "Every entry is assigned a unique identifier. Records cannot be modified after they are written.",
                    },
                    {
                        icon: ShieldCheck,
                        title: "Immutable log",
                        body: "Actions are appended only. No update or delete operations are permitted on the audit trail.",
                    },
                    {
                        icon: Clock,
                        title: "Timestamped",
                        body: "Each record carries a server-side timestamp, providing a verified chronological history.",
                    },
                ].map(({ icon: Icon, title, body }) => (
                    <div key={title} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-4 w-4" />
                            </div>
                            <p className="font-semibold text-foreground">{title}</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
                    </div>
                ))}
            </div>

            {/* Audit log */}
            <div>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Audit trail
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                        <div>
                            <p className="font-medium text-foreground">Could not load audit trail</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="font-medium text-foreground">No audit entries yet</p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                            Actions on your health data will appear here as they occur.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${actionVariant(entry.action)}`}
                                    >
                                        {entry.action}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {resourceLabel(entry.resource_type)}
                                        </p>
                                        <p className="font-mono text-[11px] text-muted-foreground">
                                            {shortId(entry.id)}
                                        </p>
                                    </div>
                                </div>
                                <p className="shrink-0 text-xs text-muted-foreground">
                                    {formatTimestamp(entry.created_at)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </UserPageShell>
    );
}
