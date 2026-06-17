"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Users,
    Link2,
    Loader2,
    UserPlus,
    UserCircle,
    ArrowRight,
    AlertCircle,
    Activity,
    Heart,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import Link from "next/link";

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
            <UserPageHeader
                icon={Users}
                title="Caregiver"
                description="Link to a patient to monitor their health, appointments, and medications."
                meta={
                    isCaregiver ? (
                        <Badge variant="outline" className="gap-2 px-3 py-1.5">
                            <ShieldCheck className="h-3 w-3" />
                            <span>{patientCount} linked patient{patientCount === 1 ? "" : "s"}</span>
                        </Badge>
                    ) : null
                }
            />

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                {/* Left — linked patients */}
                {isCaregiver && (
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div>
                                <CardTitle>Linked Patients</CardTitle>
                                <CardDescription>Patients who have shared health data with you</CardDescription>
                            </div>
                            {patientsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {patientsError ? (
                                <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                                    <p className="text-sm text-destructive">{patientsError}</p>
                                </div>
                            ) : !patients || patients.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-6 text-center">
                                    <UserCircle className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
                                    <p className="mt-3 font-medium text-foreground">No patients linked yet</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Enter an invite code on the right to get started.</p>
                                </div>
                            ) : (
                                patients.map((link) => {
                                    const p = link.patient;
                                    const age = calcAge(p.date_of_birth);
                                    return (
                                        <Link
                                            key={link.link_id}
                                            href={`/user/caregiver/${p.id}`}
                                            className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                                    <UserCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{p.full_name ?? "Unknown"}</p>
                                                    <p className="text-sm text-muted-foreground">
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
                                            </div>
                                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </Link>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Right — link form + info */}
                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Link2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle>Link a Patient</CardTitle>
                                    <CardDescription>Enter the 6-digit code from the patient&apos;s profile</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {linkSuccess ? (
                                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-4">
                                    <UserPlus className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">{linkSuccess}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="invite-code">Invite Code</Label>
                                        <Input
                                            id="invite-code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder="000000"
                                            maxLength={6}
                                            inputMode="numeric"
                                            className="font-mono text-2xl tracking-[0.4em] text-center h-14 max-w-[200px]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>
                                            Your Relationship{" "}
                                            <span className="font-normal text-muted-foreground text-xs">(optional)</span>
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
                                        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
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
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>How it works</CardTitle>
                            <CardDescription>Steps to link with a patient</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {[
                                { step: "1", text: "Ask patient to open CuraSync → Profile → \"Share with Caregiver\"" },
                                { step: "2", text: "Patient generates a 6-digit code (valid 15 minutes)" },
                                { step: "3", text: "Enter the code above — you're linked instantly" },
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                        {step}
                                    </span>
                                    <p className="text-muted-foreground">{text}</p>
                                </div>
                            ))}
                            <div className="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2 mt-1">
                                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p className="text-muted-foreground">
                                    You get <strong className="text-foreground">read-only</strong> access. Patient can revoke at any time.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </UserPageShell>
    );
}
