"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { EASE } from "@/hooks/use-motion-config";

// ── Types ────────────────────────────────────────────────────────────────────

type Condition = {
    id: string;
    name: string;
    status: "ACTIVE" | "RESOLVED" | "CHRONIC";
    severity: "MILD" | "MODERATE" | "SEVERE" | null;
    onset_date: string | null;
    resolved_date: string | null;
    notes: string | null;
    created_at: string;
};

type Allergy = {
    id: string;
    allergen: string;
    reaction: string | null;
    severity: "MILD" | "MODERATE" | "SEVERE" | null;
    status: "ACTIVE" | "RESOLVED";
    notes: string | null;
    created_at: string;
};

type Procedure = {
    id: string;
    name: string;
    procedure_date: string | null;
    facility_name: string | null;
    outcome: string | null;
    notes: string | null;
    created_at: string;
};

type Encounter = {
    id: string;
    encounter_type: "CLINIC" | "ER" | "HOSPITAL" | "TELEHEALTH";
    encounter_date: string;
    facility_name: string | null;
    provider_name: string | null;
    reason: string | null;
    diagnosis_summary: string | null;
    notes: string | null;
    ipfs_cid: string | null;
    created_at: string;
};

type Records = {
    conditions: Condition[];
    allergies: Allergy[];
    procedures: Procedure[];
    encounters: Encounter[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function conditionStatusVariant(status: Condition["status"]) {
    if (status === "ACTIVE") return "destructive";
    if (status === "CHRONIC") return "secondary";
    return "outline";
}

function severityClass(severity: string | null) {
    if (severity === "SEVERE") return "text-destructive";
    if (severity === "MODERATE") return "text-chart-5";
    return "text-muted-foreground";
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
    return (
        <div className="py-12 text-center">
            <p className="font-medium text-foreground">No {label} recorded</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Your clinic can update this section during your next visit. Records
                appear here once added by your care team.
            </p>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RecordsPage() {
    const [records, setRecords] = useState<Records | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/user/records")
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to load records");
                return res.json() as Promise<Records>;
            })
            .then((data) => {
                if (!cancelled) setRecords(data);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const totalEntries = records
        ? records.conditions.length + records.allergies.length + records.procedures.length + records.encounters.length
        : 0;

    return (
        <UserPageShell>
            <motion.div
                className="contents"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
            >
            <UserPageHeader
                sectionLabel="Medical Records"
                title="Medical History"
                description="Your health records as maintained by your registered clinic. Contact your care team to add or update entries."
                meta={
                    !loading && records ? (
                        <span className="font-mono text-xs text-muted-foreground">
                            {totalEntries} total {totalEntries === 1 ? "entry" : "entries"}
                        </span>
                    ) : null
                }
            />

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-96" />
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            ) : error ? (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                    <div>
                        <p className="font-medium text-foreground">Could not load records</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            ) : records ? (
                <Tabs defaultValue="conditions">
                    <TabsList className="flex-wrap">
                        <TabsTrigger value="conditions">
                            Conditions
                            {records.conditions.length ? (
                                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                                    {records.conditions.length}
                                </span>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger value="allergies">
                            Allergies
                            {records.allergies.length ? (
                                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                                    {records.allergies.length}
                                </span>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger value="procedures">
                            Procedures
                            {records.procedures.length ? (
                                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                                    {records.procedures.length}
                                </span>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger value="encounters">
                            Encounters
                            {records.encounters.length ? (
                                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                                    {records.encounters.length}
                                </span>
                            ) : null}
                        </TabsTrigger>
                    </TabsList>

                    {/* Conditions */}
                    <TabsContent value="conditions" className="mt-0">
                        {records.conditions.length === 0 ? (
                            <EmptyState label="conditions" />
                        ) : (
                            <div>
                                {records.conditions.map((condition, i) => (
                                    <motion.div
                                        key={condition.id}
                                        className="border-b border-border/70 py-4 last:border-0"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: EASE }}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-foreground">{condition.name}</p>
                                                {condition.onset_date ? (
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        Since {formatDate(condition.onset_date)}
                                                        {condition.resolved_date
                                                            ? ` · Resolved ${formatDate(condition.resolved_date)}`
                                                            : null}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant={conditionStatusVariant(condition.status)}>
                                                    {condition.status}
                                                </Badge>
                                                {condition.severity ? (
                                                    <Badge variant="outline" className={severityClass(condition.severity)}>
                                                        {condition.severity}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </div>
                                        {condition.notes ? (
                                            <p className="mt-2 text-sm text-muted-foreground">{condition.notes}</p>
                                        ) : null}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Allergies */}
                    <TabsContent value="allergies" className="mt-0">
                        {records.allergies.length === 0 ? (
                            <EmptyState label="allergies" />
                        ) : (
                            <div>
                                {records.allergies.map((allergy, i) => (
                                    <motion.div
                                        key={allergy.id}
                                        className="border-b border-border/70 py-4 last:border-0"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: EASE }}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-foreground">{allergy.allergen}</p>
                                                {allergy.reaction ? (
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        Reaction: {allergy.reaction}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant={allergy.status === "ACTIVE" ? "destructive" : "outline"}>
                                                    {allergy.status}
                                                </Badge>
                                                {allergy.severity ? (
                                                    <Badge variant="outline" className={severityClass(allergy.severity)}>
                                                        {allergy.severity}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </div>
                                        {allergy.notes ? (
                                            <p className="mt-2 text-sm text-muted-foreground">{allergy.notes}</p>
                                        ) : null}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Procedures */}
                    <TabsContent value="procedures" className="mt-0">
                        {records.procedures.length === 0 ? (
                            <EmptyState label="procedures" />
                        ) : (
                            <div>
                                {records.procedures.map((procedure, i) => (
                                    <motion.div
                                        key={procedure.id}
                                        className="border-b border-border/70 py-4 last:border-0"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: EASE }}
                                    >
                                        <p className="font-semibold text-foreground">{procedure.name}</p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {procedure.procedure_date ? formatDate(procedure.procedure_date) : "Date unknown"}
                                            {procedure.facility_name ? ` · ${procedure.facility_name}` : null}
                                        </p>
                                        {procedure.outcome ? (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">Outcome: </span>
                                                {procedure.outcome}
                                            </p>
                                        ) : null}
                                        {procedure.notes ? (
                                            <p className="mt-1 text-sm text-muted-foreground">{procedure.notes}</p>
                                        ) : null}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Encounters */}
                    <TabsContent value="encounters" className="mt-0">
                        {records.encounters.length === 0 ? (
                            <EmptyState label="encounters" />
                        ) : (
                            <div>
                                {records.encounters.map((encounter, i) => (
                                    <motion.div
                                        key={encounter.id}
                                        className="border-b border-border/70 py-4 last:border-0"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: EASE }}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {encounter.reason ?? "Visit"}
                                                </p>
                                                <p className="mt-0.5 text-sm text-muted-foreground">
                                                    {formatDate(encounter.encounter_date)}
                                                    {encounter.facility_name ? ` · ${encounter.facility_name}` : null}
                                                    {encounter.provider_name ? ` · ${encounter.provider_name}` : null}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">{encounter.encounter_type}</Badge>
                                                {encounter.ipfs_cid ? (
                                                    <Badge variant="outline" className="gap-1 border-sky-500/30 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
                                                        <Paperclip className="h-3 w-3" />
                                                        Document
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </div>
                                        {encounter.diagnosis_summary ? (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">Diagnosis: </span>
                                                {encounter.diagnosis_summary}
                                            </p>
                                        ) : null}
                                        {encounter.notes ? (
                                            <p className="mt-1 text-sm text-muted-foreground">{encounter.notes}</p>
                                        ) : null}
                                        {encounter.ipfs_cid ? (
                                            <a
                                                href={`https://gateway.pinata.cloud/ipfs/${encounter.ipfs_cid}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View attached document (IPFS)
                                            </a>
                                        ) : null}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            ) : null}
            </motion.div>
        </UserPageShell>
    );
}
