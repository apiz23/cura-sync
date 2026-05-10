"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Loader2, LogOut, ScrollText, Shield, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/authprovideradmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatDateTime(value: string | null | undefined) {
    if (!value) return "Not available";

    return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function AdminSecurityPage() {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [loggingOutAll, setLoggingOutAll] = useState(false);

    if (!user) {
        return null;
    }

    async function handlePasswordChange(event: FormEvent) {
        event.preventDefault();

        if (!user) return;

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match");
            return;
        }

        setSavingPassword(true);

        try {
            const res = await fetch("/api/staff/me/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to update password");
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            updateUser({
                ...user,
                account_settings: {
                    ...(user.account_settings ?? {
                        email_notifications: true,
                        sms_notifications: false,
                        schedule_notifications: true,
                        security_alerts: true,
                        marketing_emails: false,
                        session_version: 1,
                        last_login_at: null,
                        last_seen_at: null,
                        password_changed_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }),
                    password_changed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            } as typeof user);
            toast.success("Password updated");
        } catch (error: unknown) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update password"
            );
        } finally {
            setSavingPassword(false);
        }
    }

    async function handleLogoutAll() {
        setLoggingOutAll(true);

        try {
            const res = await fetch("/api/auth/staff/logout-all", {
                method: "POST",
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to sign out sessions");
            }

            toast.success("All admin sessions were invalidated");
            router.replace("/auth/admin");
            router.refresh();
        } catch (error: unknown) {
            toast.error(
                error instanceof Error ? error.message : "Failed to sign out sessions"
            );
        } finally {
            setLoggingOutAll(false);
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your password and active admin sessions.
                </p>
            </div>

            <Card className="border-border/50 bg-muted/30">
                <CardContent className="flex items-center justify-between py-4 px-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ScrollText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Audit Trail</p>
                            <p className="text-xs text-muted-foreground">Append-only access log for all system actions · Admin only</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/audit">View logs</Link>
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-2 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Use your current password to set a new one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handlePasswordChange}>
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm new password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={savingPassword} className="gap-2">
                                {savingPassword ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>Update Password</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Session Controls
                        </CardTitle>
                        <CardDescription>
                            Invalidate all active admin sessions for this account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-xl border p-4 space-y-2">
                            <p className="text-sm font-medium">Last login</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDateTime(user.account_settings?.last_login_at)}
                            </p>
                        </div>
                        <div className="rounded-xl border p-4 space-y-2">
                            <p className="text-sm font-medium">Last password change</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDateTime(user.account_settings?.password_changed_at)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Sign out all sessions
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        This increments your session version and forces every existing admin login for this account to re-authenticate.
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={handleLogoutAll}
                                        disabled={loggingOutAll}
                                        className="gap-2"
                                    >
                                        {loggingOutAll ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Signing out...
                                            </>
                                        ) : (
                                            <>
                                                <LogOut className="h-4 w-4" />
                                                Sign Out All Sessions
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
