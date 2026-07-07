"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, Key, LogOut, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { toast } from "sonner";
import { EASE } from "@/hooks/use-motion-config";

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
        <div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                {active !== undefined ? (
                    active ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )
                ) : null}
                <span className="text-right text-sm font-medium text-foreground">{value}</span>
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
                <Skeleton className="h-32 w-full rounded-2xl" />
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
            <motion.div
                className="contents"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
            >
            <UserPageHeader
                sectionLabel="Account Security"
                title="Security"
                description="Manage your account security, authentication methods, and active sessions."
            />

            {/* Account identity */}
            <section className="space-y-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Account identity
                </p>
                <div className="h-px bg-border/50" />
                <div className="flex items-center justify-between gap-4 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="truncate text-sm font-medium text-foreground">{primaryEmail}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {emailVerified ? (
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                        ) : (
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                            {emailVerified ? "Verified" : "Not verified"}
                        </span>
                    </div>
                </div>
            </section>

            {/* Security status */}
            <section className="space-y-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Security status
                </p>
                <div className="h-px bg-border/50" />
                <div className="space-y-0">
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
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Actions
                </p>
                <div className="h-px bg-border/50" />
                <div>
                    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-4">
                        <div>
                            <p className="text-sm font-medium text-foreground">Password & 2FA</p>
                            <p className="text-xs text-muted-foreground">
                                Update password and manage two-factor authentication
                            </p>
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

                    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-4">
                        <div>
                            <p className="text-sm font-medium text-foreground">Connected accounts</p>
                            <p className="text-xs text-muted-foreground">
                                Add or remove OAuth connections (Google, etc.)
                            </p>
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

                    <div className="flex items-center justify-between gap-4 py-4">
                        <div>
                            <p className="text-sm font-medium text-foreground">Sign out</p>
                            <p className="text-xs text-muted-foreground">
                                End your current session on this device
                            </p>
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
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Record protection
                </p>
                <div className="h-px bg-border/50" />
                <div className="flex items-start justify-between gap-4 py-2">
                    <div className="space-y-1 max-w-lg">
                        <p className="text-sm font-semibold text-foreground">Blockchain record protection</p>
                        <p className="text-sm text-muted-foreground">
                            Your health records will be hashed and recorded in CuraSync&apos;s
                            tamper-evident ledger each time your clinic adds or updates a record. Verify them on the{" "}
                            <a href="/user/blockchain" className="text-primary hover:underline">
                                Blockchain page
                            </a>
                            .
                        </p>
                        {facilityPlan === "basic" && (
                            <div className="flex items-center gap-1.5 text-xs text-chart-5 dark:text-chart-5">
                                <Lock className="h-3 w-3" />
                                Requires Clinic plan or above — ask your clinic to upgrade
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 pt-0.5">
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
            </section>
            </motion.div>
        </UserPageShell>
    );
}
