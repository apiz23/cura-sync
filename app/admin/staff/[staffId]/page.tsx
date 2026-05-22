"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    Calendar,
    Mail,
    Shield,
    Stethoscope,
    User,
    UserCog,
    Trash2,
} from "lucide-react";

import type { Staff, StaffRole } from "@/app/types";
import { useAuth } from "@/components/authprovideradmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getRoleIcon(role: StaffRole | null | undefined) {
    switch (role) {
        case "doctor":
            return <Stethoscope className="h-3.5 w-3.5" />;
        case "staff":
            return <Shield className="h-3.5 w-3.5" />;
        case "admin":
            return <UserCog className="h-3.5 w-3.5" />;
        default:
            return <User className="h-3.5 w-3.5" />;
    }
}

function getRoleBadgeClass(role: StaffRole | null | undefined) {
    // Theme-safe accents (no hard-coded blue/emerald/purple backgrounds).
    switch (role) {
        case "doctor":
            return "bg-primary/10 text-primary border-primary/20";
        case "admin":
            return "bg-secondary/30 text-secondary-foreground border-secondary/40";
        default:
            return "bg-muted text-foreground border-border";
    }
}

export default function StaffDetailPage() {
    const params = useParams<{ staffId: string }>();
    const staffId = params.staffId;
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === "admin";

    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<Staff | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;
        if (!isAdmin) return;

        const controller = new AbortController();

        async function load() {
            setLoading(true);
            setStaff(null);
            try {
                const res = await fetch(`/api/staff/${encodeURIComponent(staffId)}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    setStaff(null);
                    return;
                }
                setStaff(data as Staff);
            } catch (err) {
                if ((err as any)?.name !== "AbortError") {
                    console.error(err);
                    setStaff(null);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        load();

        return () => controller.abort();
    }, [authLoading, isAdmin, staffId, user]);

    const title = useMemo(() => {
        if (!staff) return "Staff profile";
        return staff.full_name ?? "Staff profile";
    }, [staff]);

    async function handleDelete() {
        if (!staff) return;
        if (!confirm("Are you sure you want to delete this staff member?")) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/staff/${encodeURIComponent(staff.id)}`, {
                method: "DELETE",
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(payload?.error || "Failed to delete staff");
            }
            toast.success("Staff member removed");
            router.push("/admin/staff");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete staff");
        } finally {
            setDeleting(false);
        }
    }

    if (!authLoading && user && !isAdmin) {
        return (
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle>Staff Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base text-muted-foreground">
                        Only facility administrators can view staff profiles.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (!loading && !staff) {
        return notFound();
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/admin/staff")}
                            className="rounded-full"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    </div>
                    <p className="text-base text-muted-foreground">
                        Facility staff account details
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting || loading || !staff}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Remove
                    </Button>
                </div>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-64" />
                            <Skeleton className="h-4 w-96" />
                            <Skeleton className="h-4 w-72" />
                        </div>
                    ) : staff ? (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`gap-2 ${getRoleBadgeClass(staff.role)}`}
                                >
                                    {getRoleIcon(staff.role)}
                                    <span className="capitalize">{staff.role ?? "staff"}</span>
                                </Badge>
                                {staff.specialization ? (
                                    <Badge variant="outline" className="bg-muted/40">
                                        {staff.specialization}
                                    </Badge>
                                ) : null}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-border bg-card p-4">
                                    <p className="text-base text-muted-foreground">Email</p>
                                    <p className="mt-1 flex items-center gap-2 text-base font-medium">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {staff.email}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-card p-4">
                                    <p className="text-base text-muted-foreground">Joined</p>
                                    <p className="mt-1 flex items-center gap-2 text-base font-medium">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {formatDate(staff.created_at)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-card p-4">
                                    <p className="text-base text-muted-foreground">License</p>
                                    <p className="mt-1 text-base font-medium">
                                        {staff.license_number ?? "Not set"}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-card p-4">
                                    <p className="text-base text-muted-foreground">Experience</p>
                                    <p className="mt-1 text-base font-medium">
                                        {staff.years_of_experience ?? "Not set"}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}

