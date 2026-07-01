"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
    Loader2,
    UserPlus,
    UserCircle,
    ArrowRight,
    AlertCircle,
    Activity,
    Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EASE } from "@/hooks/use-motion-config";

const RELATIONSHIP_OPTIONS = ["Parent", "Spouse", "Child", "Sibling", "Guardian", "Friend"];

type LinkedPatient = {
    link_id: string;
    relationship: string | null;
    linked_since: string;
    patient: {
        id: string | null;
        full_name: string | null;
        email: string | null;
        date_of_birth: string | null;
        gender: string | null;
        blood_type: string | null;
        allergies: string | null;
        chronic_conditions: string | null;
    };
};

function calcAge(dob: string | null) {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export default function CaregiverPage() {
    const { user } = useUser();
    const userRole = user?.publicMetadata?.role as string | undefined;
    const isCaregiver = userRole === "caregiver";

    const [code, setCode] = useState("");
    const [relationship, setRelationship] = useState("");
    const [linking, setLinking] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);
    const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

    const [patients, setPatients] = useState<LinkedPatient[] | null>(null);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patientsError, setPatientsError] = useState<string | null>(null);

    const canSubmit = code.trim().length === 6 && !linking;

    async function loadPatients() {
        setPatientsLoading(true);
        setPatientsError(null);
        try {
            const res = await fetch("/api/caregiver/patients");
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json() as { data: LinkedPatient[] };
            setPatients(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            setPatientsError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setPatientsLoading(false);
        }
    }

    async function submitCode() {
        if (!canSubmit) return;
        setLinking(true);
        setLinkError(null);
        try {
            const res = await fetch("/api/caregiver/invite/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim(), relationship: relationship.trim() || null }),
            });
            const json = await res.json().catch(() => ({})) as { data?: { patientName?: string }; error?: string };
            if (!res.ok) {
                setLinkError(json.error ?? `Error ${res.status}`);
                return;
            }
            const name = json.data?.patientName ?? "Patient";
            setLinkSuccess(`Linked to ${name}! Reloading your account...`);
            setCode("");
            setRelationship("");
            await user?.reload();
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            setLinkError(err instanceof Error ? err.message : "Network error");
        } finally {
            setLinking(false);
        }
    }

    if (isCaregiver && patients === null && !patientsLoading && !patientsError) {
        void loadPatients();
    }

    const patientCount = patients?.length ?? 0;

    return (
        <UserPageShell>
            <motion.div
                className="contents"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
            >
            <UserPageHeader
                sectionLabel="Care Network"
                title="Caregiver Access"
                description="Link to a patient to monitor their health, appointments, and medications."
                meta={
                    isCaregiver ? (
                        <span className="font-mono text-xs text-muted-foreground">
                            {patientCount} linked patient{patientCount === 1 ? "" : "s"}
                        </span>
                    ) : null
                }
            />

            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                {/* Left — linked patients */}
                {isCaregiver && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Linked Patients
                            </p>
                            {patientsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                        </div>
                        <div className="h-px bg-border/50" />

                        {patientsError ? (
                            <div className="flex items-center gap-3 border-b border-destructive/20 py-3">
                                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                                <p className="text-sm text-destructive">{patientsError}</p>
                            </div>
                        ) : !patients || patients.length === 0 ? (
                            <div className="py-10 text-center">
                                <UserCircle className="mx-auto h-8 w-8 text-muted-foreground opacity-30" />
                                <p className="mt-3 text-sm font-medium text-foreground">No patients linked yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">Enter an invite code on the right to get started.</p>
                            </div>
                        ) : (
                            <div>
                                {patients.map((link, i) => {
                                    const p = link.patient;
                                    const age = calcAge(p.date_of_birth);
                                    return (
                                        <motion.div
                                            key={link.link_id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.05, ease: EASE }}
                                        >
                                            <Link
                                                href={`/user/caregiver/${p.id}`}
                                                className={cn(
                                                    "flex items-center justify-between border-b border-border/40 py-4 last:border-0",
                                                    "transition-colors hover:text-foreground group",
                                                )}
                                            >
                                                <div>
                                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                        {p.full_name ?? "Unknown"}
                                                    </p>
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        {[age ? `${age} yrs` : null, p.gender, p.blood_type].filter(Boolean).join(" · ")}
                                                    </p>
                                                    {link.relationship && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Your {link.relationship.toLowerCase()} · Linked {formatDate(link.linked_since)}
                                                        </p>
                                                    )}
                                                    {(p.allergies || p.chronic_conditions) && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {p.allergies && (
                                                                <Badge variant="outline" className="gap-1 text-xs border-destructive/30 text-destructive">
                                                                    <AlertCircle className="h-2.5 w-2.5" /> {p.allergies}
                                                                </Badge>
                                                            )}
                                                            {p.chronic_conditions && (
                                                                <Badge variant="outline" className="gap-1 text-xs border-primary/30 text-primary">
                                                                    <Activity className="h-2.5 w-2.5" /> {p.chronic_conditions}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Right — link form + info */}
                <div className="space-y-8">
                    {/* Link form */}
                    <section className="space-y-4">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Link a Patient
                        </p>
                        <div className="h-px bg-border/50" />
                        <p className="text-sm text-muted-foreground">Enter the 6-digit code from the patient&apos;s profile</p>

                        {linkSuccess ? (
                            <div className="flex items-center gap-3 border-b border-primary/20 py-3">
                                <UserPlus className="h-4 w-4 shrink-0 text-primary" />
                                <p className="text-sm font-medium text-foreground">{linkSuccess}</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="invite-code" className="text-xs text-muted-foreground">Invite Code</Label>
                                    <Input
                                        id="invite-code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        inputMode="numeric"
                                        className="font-mono text-2xl tracking-[0.4em] text-center h-14 max-w-[200px] rounded-lg"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Your Relationship{" "}
                                        <span className="text-muted-foreground/60">(optional)</span>
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {RELATIONSHIP_OPTIONS.map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setRelationship(opt === relationship ? "" : opt)}
                                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                    relationship === opt
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        value={relationship}
                                        onChange={(e) => setRelationship(e.target.value)}
                                        placeholder="Or type your own (e.g. Uncle)"
                                        className="text-sm"
                                    />
                                </div>

                                {linkError && (
                                    <div className="flex items-start gap-2 border-b border-destructive/20 pb-3">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                        <p className="text-sm text-destructive">{linkError}</p>
                                    </div>
                                )}

                                <Button onClick={submitCode} disabled={!canSubmit} className="w-full sm:w-auto">
                                    {linking
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Linking...</>
                                        : <><UserPlus className="mr-2 h-4 w-4" />Link Patient</>
                                    }
                                </Button>
                            </div>
                        )}
                    </section>

                    {/* How it works */}
                    <section className="space-y-4">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            How it works
                        </p>
                        <div className="h-px bg-border/50" />
                        <div className="space-y-0">
                            {[
                                { step: "01", text: "Ask patient to open CuraSync → Profile → \"Share with Caregiver\"" },
                                { step: "02", text: "Patient generates a 6-digit code (valid 15 minutes)" },
                                { step: "03", text: "Enter the code above — you're linked instantly" },
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-start gap-4 border-b border-border/40 py-3 last:border-0">
                                    <span className="font-mono text-[10px] font-semibold text-muted-foreground/60 mt-0.5">
                                        {step}
                                    </span>
                                    <p className="text-sm text-muted-foreground">{text}</p>
                                </div>
                            ))}
                            <div className="flex items-start gap-4 pt-3">
                                <Heart className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                    You get <span className="font-medium text-foreground">read-only</span> access. Patient can revoke at any time.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            </motion.div>
        </UserPageShell>
    );
}
