"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Shield, ShieldCheck, Lock, Mail, CalendarDays, Key, LogOut, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { toast } from "sonner";

function formatDate(value: Date | null | undefined) {
    if (!value) return "—";
    return value.toLocaleDateString("en-MY", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function StatusRow({
    label,
    value,
    active,
}: {
    label: string;
    value: string;
    active?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-base text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                {active !== undefined ? (
                    active ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    )
                ) : null}
                <span className="text-right text-base font-medium text-foreground">{value}</span>
            </div>
        </div>
    );
}

export default function SecurityPage() {
    const { user, isLoaded } = useUser();
    const { openUserProfile, signOut } = useClerk();

    const [blockchainEnabled, setBlockchainEnabled] = useState(false);
    const [facilityPlan, setFacilityPlan] = useState<string | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [blockchainLoading, setBlockchainLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/blockchain-toggle")
            .then((r) => r.json())
            .then((data: { enabled: boolean; facilityPlan: string | null }) => {
                setBlockchainEnabled(data.enabled);
                setFacilityPlan(data.facilityPlan);
            })
            .catch(() => { /* silent — not critical */ })
            .finally(() => setBlockchainLoading(false));
    }, []);

    const handleBlockchainToggle = useCallback(async (checked: boolean) => {
        setToggleLoading(true);
        try {
            const res = await fetch("/api/user/blockchain-toggle", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: checked }),
            });
            if (!res.ok) throw new Error("Failed to update");
            setBlockchainEnabled(checked);
            toast.success(checked ? "Blockchain protection enabled" : "Blockchain protection disabled");
        } catch {
            toast.error("Could not update setting");
        } finally {
            setToggleLoading(false);
        }
    }, []);

    if (!isLoaded) {
        return (
            <UserPageShell>
                <Skeleton className="h-32 w-full rounded-3xl" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                </div>
            </UserPageShell>
        );
    }

    if (!user) return null;

    const primaryEmail = user.primaryEmailAddress?.emailAddress ?? "—";
    const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";
    const mfaEnabled = user.twoFactorEnabled ?? false;
    const accountCreated = user.createdAt ?? null;
    const lastSignIn = user.lastSignInAt ?? null;
    const externalAccounts = user.externalAccounts ?? [];

    return (
        <UserPageShell>
            <UserPageHeader
                icon={Shield}
                title="Security"
                description="Manage your account security, authentication methods, and active sessions."
            />

            {/* Account identity */}
            <section className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                    Account identity
                </h2>
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-medium text-foreground">{primaryEmail}</p>
                            <p className="text-base text-muted-foreground">
                                {emailVerified ? "Verified" : "Not verified"}
                            </p>
                        </div>
                        {emailVerified ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </section>

            {/* Security status */}
            <section className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                    Security status
                </h2>
                <div className="space-y-2">
                    <StatusRow
                        label="Two-factor authentication"
                        value={mfaEnabled ? "Enabled" : "Not enabled"}
                        active={mfaEnabled}
                    />
                    <StatusRow
                        label="Account created"
                        value={formatDate(accountCreated)}
                    />
                    <StatusRow
                        label="Last sign in"
                        value={formatDate(lastSignIn)}
                    />
                    {externalAccounts.length > 0 ? (
                        <StatusRow
                            label="Linked accounts"
                            value={externalAccounts
                                .map((a) => a.provider)
                                .join(", ")}
                            active={true}
                        />
                    ) : null}
                </div>
            </section>

            {/* Actions */}
            <section className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Key className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Password & 2FA</p>
                                <p className="text-base text-muted-foreground">
                                    Update password and manage two-factor authentication
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserProfile()}
                            className="shrink-0 gap-2"
                        >
                            Manage
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CalendarDays className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Connected accounts</p>
                                <p className="text-base text-muted-foreground">
                                    Add or remove OAuth connections (Google, etc.)
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserProfile()}
                            className="shrink-0 gap-2"
                        >
                            Manage
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                <LogOut className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Sign out</p>
                                <p className="text-base text-muted-foreground">
                                    End your current session on this device
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => void signOut({ redirectUrl: "/" })}
                            className="shrink-0"
                        >
                            Sign out
                        </Button>
                    </div>
                </div>
            </section>

            {/* Blockchain protection */}
            <section className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                    Record protection
                </h2>
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">Blockchain record protection</p>
                                <p className="text-sm text-muted-foreground">
                                    Your health records will be hashed and anchored on the Polygon Amoy testnet
                                    each time your clinic adds or updates a record. Verify them on the{" "}
                                    <a href="/user/blockchain" className="text-primary hover:underline">
                                        Blockchain page
                                    </a>
                                    .
                                </p>
                                {facilityPlan === "basic" && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                        <Lock className="h-3 w-3" />
                                        Requires Clinic plan or above — ask your clinic to upgrade
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="shrink-0">
                            {blockchainLoading ? (
                                <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
                            ) : (
                                <Switch
                                    checked={blockchainEnabled}
                                    onCheckedChange={handleBlockchainToggle}
                                    disabled={toggleLoading || facilityPlan === "basic"}
                                    className="data-[state=checked]:bg-primary"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </UserPageShell>
    );
}
