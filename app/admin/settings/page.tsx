"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/authprovideradmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { normalizeStaffRole } from "@/lib/staff-role";

type PreferenceState = {
    email_notifications: boolean;
    sms_notifications: boolean;
    schedule_notifications: boolean;
    security_alerts: boolean;
    marketing_emails: boolean;
};

export default function AdminSettingsPage() {
    const { user, loading, updateUser } = useAuth();
    const isAdmin = normalizeStaffRole(user?.role ?? "") === "admin";
    const [form, setForm] = useState<PreferenceState>({
        email_notifications: true,
        sms_notifications: false,
        schedule_notifications: true,
        security_alerts: true,
        marketing_emails: false,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.account_settings) return;

        setForm({
            email_notifications: user.account_settings.email_notifications,
            sms_notifications: user.account_settings.sms_notifications,
            schedule_notifications: user.account_settings.schedule_notifications,
            security_alerts: user.account_settings.security_alerts,
            marketing_emails: user.account_settings.marketing_emails,
        });
    }, [user]);

    if (loading || !user) {
        return null;
    }

    if (!isAdmin) {
        return (
            <div className="p-6">
                <Card className="border-destructive/30">
                    <CardHeader>
                        <CardTitle>Access Restricted</CardTitle>
                        <CardDescription>
                            Preferences is available to admin accounts only.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    async function savePreferences() {
        if (!user) return;

        setSaving(true);

        try {
            const res = await fetch("/api/staff/me/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to update settings");
            }

            updateUser({
                ...user,
                account_settings: result,
            } as typeof user);
            toast.success("Preferences updated");
        } catch (error: unknown) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update settings"
            );
        } finally {
            setSaving(false);
        }
    }

    const rows = [
        {
            key: "email_notifications",
            title: "Email notifications",
            description: "Receive account and workflow updates by email.",
            icon: Mail,
        },
        {
            key: "sms_notifications",
            title: "SMS notifications",
            description: "Receive urgent notifications by SMS when available.",
            icon: MessageSquare,
        },
        {
            key: "schedule_notifications",
            title: "Schedule reminders",
            description: "Get reminders for appointment and schedule changes.",
            icon: Bell,
        },
        {
            key: "security_alerts",
            title: "Security alerts",
            description: "Always notify me about password and session events.",
            icon: ShieldCheck,
        },
        {
            key: "marketing_emails",
            title: "Product updates",
            description: "Receive non-critical product announcements.",
            icon: Bell,
        },
    ] as const;

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
                <p className="text-muted-foreground mt-2">
                    Manage how this admin account receives notifications.
                </p>
            </div>

            <Card className="border-2 border-border/50">
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        These settings apply to your current staff account only.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {rows.map((row) => {
                        const Icon = row.icon;
                        return (
                            <div
                                key={row.key}
                                className="flex items-start justify-between gap-4 rounded-xl border p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium">
                                            {row.title}
                                        </Label>
                                        <p className="text-base text-muted-foreground">
                                            {row.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={form[row.key]}
                                    onCheckedChange={(checked) =>
                                        setForm((current) => ({
                                            ...current,
                                            [row.key]: checked,
                                        }))
                                    }
                                />
                            </div>
                        );
                    })}

                    <div className="flex justify-end">
                        <Button onClick={savePreferences} disabled={saving} className="gap-2">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>Save Preferences</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
