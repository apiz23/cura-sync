"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, CheckCheck, Info, AlertTriangle, ShieldCheck, Pill, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EASE } from "@/hooks/use-motion-config";

type Notification = {
    id: string;
    type: string;
    title: string;
    body: string | null;
    severity: "info" | "warning" | "error" | "success" | null;
    read: boolean;
    metadata: Record<string, unknown> | null;
    created_at: string;
};

function formatRelative(value: string) {
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(value).toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

function notifIcon(type: string, severity: Notification["severity"]) {
    if (type.includes("medication") || type.includes("med")) return Pill;
    if (type.includes("appointment")) return Calendar;
    if (type.includes("blockchain") || type.includes("record")) return ShieldCheck;
    if (severity === "warning" || severity === "error") return AlertTriangle;
    return Info;
}

function severityStyles(severity: Notification["severity"]) {
    if (severity === "error") return { icon: "text-destructive", bg: "bg-destructive/10" };
    if (severity === "warning") return { icon: "text-chart-5", bg: "bg-chart-5/10" };
    if (severity === "success") return { icon: "text-primary", bg: "bg-primary/10" };
    return { icon: "text-muted-foreground", bg: "bg-muted/40" };
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/user/notifications");
            if (!res.ok) throw new Error("Failed to load");
            const json = await res.json() as { data: Notification[] };
            setNotifications(json.data ?? []);
        } catch {
            toast.error("Could not load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

    const markRead = useCallback(async (ids: string[]) => {
        await fetch("/api/user/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });
        setNotifications((prev) =>
            ids.length === 0
                ? prev.map((n) => ({ ...n, read: true }))
                : prev.map((n) => ids.includes(n.id) ? { ...n, read: true } : n),
        );
    }, []);

    const markAllRead = useCallback(async () => {
        setMarkingAll(true);
        try {
            await markRead([]);
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark as read");
        } finally {
            setMarkingAll(false);
        }
    }, [markRead]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <UserPageShell>
            <UserPageHeader
                sectionLabel="Activity"
                title="Notifications"
                description="Health alerts, appointment reminders, and system updates."
                meta={
                    unreadCount > 0 ? (
                        <span className="font-mono text-xs text-muted-foreground">{unreadCount} unread</span>
                    ) : null
                }
            />

            {/* Actions */}
            {!loading && notifications.length > 0 && unreadCount > 0 && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllRead}
                        disabled={markingAll}
                        className="gap-2"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark all as read
                    </Button>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40">
                        <BellOff className="h-7 w-7 text-muted-foreground opacity-60" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">No notifications</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            You&apos;re all caught up. Alerts about your appointments, medications, and records will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div>
                    {notifications.map((notif, i) => {
                        const Icon = notifIcon(notif.type, notif.severity);
                        const styles = severityStyles(notif.severity);
                        return (
                            <motion.button
                                key={notif.id}
                                onClick={() => { if (!notif.read) void markRead([notif.id]); }}
                                className={cn(
                                    "group w-full border-b border-border/70 py-4 text-left transition-colors hover:bg-muted/20 last:border-0",
                                    !notif.read && "bg-primary/[0.02]",
                                )}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: EASE }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn("mt-0.5 shrink-0", styles.icon)}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={cn("text-sm text-foreground", !notif.read ? "font-semibold" : "font-normal")}>
                                                {notif.title}
                                            </p>
                                            {!notif.read && (
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        {notif.body ? (
                                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
                                        ) : null}
                                    </div>
                                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                                        {formatRelative(notif.created_at)}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </UserPageShell>
    );
}
