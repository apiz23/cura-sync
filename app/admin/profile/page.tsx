"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/authprovideradmin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    UserCircle,
    Mail,
    Building2,
    Award,
    Calendar,
    Shield,
    Briefcase,
    Edit,
    Bell,
    Clock3,
    KeyRound,
    Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EditStaffProfileModal from "./edit-sheet";
import { AuthUser } from "@/app/types";
import { getStaffRoleLabel, normalizeStaffRole } from "@/lib/staff-role";

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

export default function ProfessionalProfilePage() {
    const { user, loading, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const initials =
        (user?.full_name?.split(" ")[0]?.[0] || "") +
        (user?.full_name?.split(" ")[1]?.[0] || "");

    const handleUpdateProfile = async (updatedData: Partial<AuthUser>) => {
        try {
            const res = await fetch("/api/staff/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to update profile");
                return false;
            }

            updateUser(result as AuthUser);
            toast.success("Profile updated successfully");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
            return false;
        }
    };

    const getRoleColor = (role: string) => {
        switch (normalizeStaffRole(role)) {
            case "doctor":
                return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
            case "admin":
                return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
            default:
                return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-linear-to-br from-background via-background to-accent/5">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <Skeleton className="lg:col-span-1 h-96 rounded-2xl" />
                        <div className="lg:col-span-3 space-y-6">
                            <Skeleton className="h-48 rounded-2xl" />
                            <Skeleton className="h-48 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md mx-auto border-2 border-border/50 shadow-xl">
                    <CardContent className="p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <Shield className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">
                            Access Required
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Please log in to view your professional profile.
                        </p>
                        <Button asChild className="rounded-xl px-8 py-3 text-base">
                            <Link href="/auth/admin">Go to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-linear-to-br from-background via-background to-accent/5">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-2 border-border/50 shadow-lg overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <Avatar className="h-36 w-36 border-4 border-background shadow-lg">
                                        <AvatarFallback className="text-4xl bg-linear-to-br from-primary/20 to-primary/5">
                                            {initials.toUpperCase() || "CS"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-foreground">
                                            {user.full_name}
                                        </h2>
                                        <Badge
                                            className={`px-3 py-1.5 ${getRoleColor(
                                                user.role
                                            )}`}
                                        >
                                            {getStaffRoleLabel(user.role)}
                                        </Badge>
                                    </div>

                                    <Separator className="my-2" />

                                    <div className="space-y-4 w-full">
                                        <div className="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <div className="text-left">
                                                <p className="text-xs text-muted-foreground">
                                                    Email
                                                </p>
                                                <p className="text-foreground truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-foreground">
                                                {user.years_of_experience || "0"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Years
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-foreground">
                                                {user.license_number ? "Yes" : "No"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                License
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-foreground">
                                                {user.facility_id ? "Yes" : "No"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Facility
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <Card className="border-2 border-border/50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Briefcase className="w-5 h-5" />
                                    Professional Information
                                </CardTitle>
                                <CardDescription>
                                    Personal profile fields are editable here. Role and facility assignments stay admin-managed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-5 h-5 text-primary" />
                                            <h4 className="font-semibold text-foreground">
                                                Specialization
                                            </h4>
                                        </div>
                                        <p className="text-foreground text-lg font-medium">
                                            {user.specialization || "Not specified"}
                                        </p>
                                    </div>

                                    <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <h4 className="font-semibold text-foreground">
                                                Experience
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-foreground text-lg font-medium">
                                                {user.years_of_experience || "0"}
                                            </p>
                                            <span className="text-muted-foreground">
                                                years
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-primary" />
                                            <h4 className="font-semibold text-foreground">
                                                License
                                            </h4>
                                        </div>
                                        <p className="text-foreground text-lg font-medium">
                                            {user.license_number || "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-border/50 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <UserCircle className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-foreground">
                                        Account Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Role
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {getStaffRoleLabel(user.role)}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Facility ID
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {user.facility_id || "Not assigned"}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Member Since
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {formatDateTime(user.created_at)}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Profile ID
                                            </p>
                                            <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                                {user.id}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Clock3 className="w-4 h-4" />
                                                Last Login
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {formatDateTime(user.account_settings?.last_login_at)}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Activity className="w-4 h-4" />
                                                Last Seen
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {formatDateTime(user.account_settings?.last_seen_at)}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <KeyRound className="w-4 h-4" />
                                                Password Updated
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {formatDateTime(user.account_settings?.password_changed_at)}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Account Settings Updated
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {formatDateTime(user.account_settings?.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-border/50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-foreground">
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>
                                    Real account actions now point to working pages.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-14 rounded-xl border-border hover:bg-muted/50 gap-2"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit className="w-5 h-5" />
                                        <span>Edit Profile</span>
                                    </Button>
                                    <Button asChild variant="outline" className="rounded-xl h-14 border-border hover:bg-muted/50 gap-2 px-4">
                                        <Link href="/admin/security">
                                            <Shield className="w-5 h-5" />
                                            <span className="text-sm">Security</span>
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="rounded-xl h-14 border-border hover:bg-muted/50 gap-2 px-4">
                                        <Link href="/admin/settings">
                                            <Bell className="w-5 h-5" />
                                            <span className="text-sm">Preferences</span>
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="rounded-xl h-14 border-border hover:bg-muted/50 gap-2 px-4">
                                        <Link href="/admin/health-center">
                                            <Building2 className="w-5 h-5" />
                                            <span className="text-sm">Facility</span>
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {isEditing && (
                <EditStaffProfileModal
                    user={user}
                    onSave={handleUpdateProfile}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}
