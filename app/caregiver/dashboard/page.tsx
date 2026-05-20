"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import {
    Users,
    Heart,
    AlertCircle,
    Activity,
    CalendarDays,
    ArrowRight,
    UserCircle,
    ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ─────────────────────────────────────────────────────────────────────

type LinkedPatient = {
    link_id: string;
    relationship: string | null;
    linked_since: string;
    patient: {
        id: string | null;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        date_of_birth: string | null;
        gender: string | null;
        blood_type: string | null;
        allergies: string | null;
        chronic_conditions: string | null;
    };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcAge(dob: string | null) {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CaregiverDashboardPage() {
    const { user, isLoaded } = useUser();
    const [patients, setPatients] = useState<LinkedPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userRole = user?.publicMetadata?.role as string | undefined;
    const isCaregiver = userRole === "caregiver";

    useEffect(() => {
        if (!isLoaded || !user || !isCaregiver) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        fetch("/api/caregiver/patients")
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to load patients");
                const body = await res.json() as { data: LinkedPatient[] };
                return body.data ?? [];
            })
            .then((data) => { if (!cancelled) setPatients(data); })
            .catch((err: unknown) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [isLoaded, user, isCaregiver]);

    // Not loaded yet
    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="space-y-3 text-center">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>
            </div>
        );
    }

    // Not signed in
    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="max-w-sm text-center space-y-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                        <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Caregiver Portal</h1>
                    <p className="text-sm text-muted-foreground leading-6">
                        Sign in to view and monitor health data for patients linked to your
                        caregiver account.
                    </p>
                    <SignInButton mode="modal">
                        <Button className="w-full">Sign in</Button>
                    </SignInButton>
                </div>
            </div>
        );
    }

    // Signed in but wrong role
    if (!isCaregiver) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="max-w-sm text-center space-y-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
                        <AlertCircle className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Access restricted</h1>
                    <p className="text-sm text-muted-foreground leading-6">
                        This portal is for caregiver accounts only. Your current role is{" "}
                        <span className="font-medium text-foreground">{userRole ?? "patient"}</span>.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/user/dashboard">Go to patient dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const firstName = user.firstName ?? "Caregiver";

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="mx-auto max-w-[960px] px-4 py-6 md:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Heart className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    CuraSync Caregiver
                                </p>
                                <h1 className="text-lg font-bold text-foreground">
                                    Welcome, {firstName}
                                </h1>
                            </div>
                        </div>
                        <Badge variant="outline" className="gap-1.5">
                            <Users className="h-3 w-3" />
                            {patients.length} linked {patients.length === 1 ? "patient" : "patients"}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[960px] px-4 py-8 md:px-6 space-y-8">

                {/* Role info strip */}
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">
                        As a caregiver, you have read-only access to health data for patients
                        who have consented to link their account with yours. Contact the
                        clinic to add or remove linked patients.
                    </p>
                </div>

                {/* Patient cards */}
                <section>
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Linked patients
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                            <div>
                                <p className="font-medium text-foreground">Could not load patients</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                            <UserCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                            <p className="mt-4 font-semibold text-foreground">No patients linked yet</p>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                Your caregiver account is active. A clinic staff member can link a
                                patient&apos;s profile to your account with the patient&apos;s consent.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {patients.map((link) => {
                                const p = link.patient;
                                const age = calcAge(p.date_of_birth);
                                return (
                                    <div
                                        key={link.link_id}
                                        className="rounded-2xl border border-border bg-card p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <UserCircle className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {p.full_name ?? "Unknown patient"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {[
                                                            age !== null ? `${age} years old` : null,
                                                            p.gender,
                                                            p.blood_type ? `Blood type ${p.blood_type}` : null,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ") || "No profile data"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {link.relationship && (
                                                    <Badge variant="secondary">{link.relationship}</Badge>
                                                )}
                                                <Badge variant="outline" className="gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    Linked {formatDate(link.linked_since)}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Health indicators */}
                                        {(p.allergies || p.chronic_conditions) && (
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                {p.allergies && (
                                                    <div className="flex items-start gap-2 rounded-lg bg-destructive/5 px-3 py-2">
                                                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                                                        <div>
                                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">
                                                                Allergies
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-foreground">{p.allergies}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {p.chronic_conditions && (
                                                    <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2">
                                                        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                                        <div>
                                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                                Conditions
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-foreground">
                                                                {p.chronic_conditions}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4 flex justify-end">
                                            <Button asChild variant="outline" size="sm" className="gap-2">
                                                <Link href={`/caregiver/patient/${p.id}`}>
                                                    View health data
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
