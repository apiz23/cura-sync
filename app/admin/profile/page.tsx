"use client";

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
    Clock,
    Edit,
    Bell,
    FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EditStaffProfileModal from "./edit-sheet";

interface Availability {
    available?: boolean;
    schedule?: string;
    notes?: string;
    updated_at?: string;
}

interface StaffProfile {
    id: string;
    full_name: string;
    email: string;
    role: "doctor" | "nurse" | "admin";
    specialization: string | null;
    license_number: string | null;
    facility_id: string | null;
    years_of_experience: number | null;
    availability: Availability | null;
    created_at: string;
}

export default function StaffProfilePage() {
    const { staff: initialStaff, loading } = useAuth();
    const [staff, setStaff] = useState<StaffProfile | null>(
        initialStaff as StaffProfile | null
    );
    const [isEditing, setIsEditing] = useState(false);

    const initials =
        (staff?.full_name?.split(" ")[0]?.[0] || "") +
        (staff?.full_name?.split(" ")[1]?.[0] || "");

    const handleUpdateProfile = async (updatedData: Partial<StaffProfile>) => {
        try {
            const res = await fetch(`/api/staff/${updatedData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to update staff profile");
                return;
            }

            toast.success("Profile updated successfully");
            setStaff({ ...staff, ...updatedData } as StaffProfile);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    const getAvailabilityStatus = () => {
        if (!staff?.availability)
            return { status: "Not Set", color: "bg-gray-500" };

        try {
            const availability =
                typeof staff.availability === "string"
                    ? JSON.parse(staff.availability)
                    : staff.availability;

            if (availability?.available === true) {
                return { status: "Available", color: "bg-green-500" };
            } else if (availability?.available === false) {
                return { status: "Unavailable", color: "bg-red-500" };
            } else if (availability?.limited === true) {
                return { status: "Limited", color: "bg-yellow-500" };
            }
        } catch {
            return { status: "Not Set", color: "bg-gray-500" };
        }
        return { status: "Not Set", color: "bg-gray-500" };
    };

    const getRoleColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case "doctor":
                return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
            case "nurse":
                return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
            case "admin":
                return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
            default:
                return "bg-primary/10 text-primary border-primary/20";
        }
    };

    const availabilityStatus = getAvailabilityStatus();

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

    if (!staff) {
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
                        <Button className="rounded-xl px-8 py-3 text-base">
                            Go to Login
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
                                            {initials.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-foreground">
                                            {staff.full_name}
                                        </h2>
                                        <Badge
                                            className={`px-3 py-1.5 ${getRoleColor(
                                                staff.role
                                            )}`}
                                        >
                                            {staff.role}
                                        </Badge>
                                    </div>

                                    <Separator className="my-2" />

                                    {/* Contact Info */}
                                    <div className="space-y-4 w-full">
                                        <div className="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <div className="text-left">
                                                <p className="text-xs text-muted-foreground">
                                                    Email
                                                </p>
                                                <p className="text-foreground truncate">
                                                    {staff.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-foreground">
                                                {staff.years_of_experience ||
                                                    "0"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Years
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-foreground">
                                                {staff.license_number
                                                    ? "✓"
                                                    : "—"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                License
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-foreground">
                                                {staff.facility_id ? "✓" : "—"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Facility
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Availability Card */}
                        <Card className="border-2 border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-foreground">
                                        Availability
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full ${availabilityStatus.color}`}
                                        />
                                        <span className="text-sm font-medium">
                                            {availabilityStatus.status}
                                        </span>
                                    </div>
                                </div>
                                {staff.availability &&
                                    typeof staff.availability === "object" && (
                                        <div className="space-y-3">
                                            {staff.availability.schedule && (
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground mb-1">
                                                        Schedule
                                                    </p>
                                                    <p className="text-foreground font-medium">
                                                        {
                                                            staff.availability
                                                                .schedule
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            {staff.availability.notes && (
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground mb-1">
                                                        Notes
                                                    </p>
                                                    <p className="text-foreground">
                                                        {
                                                            staff.availability
                                                                .notes
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                <Button
                                    variant="outline"
                                    className="w-full mt-4 rounded-lg gap-2"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Clock className="w-4 h-4" />
                                    Update Availability
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Professional Information */}
                        <Card className="border-2 border-border/50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Briefcase className="w-5 h-5" />
                                    Professional Information
                                </CardTitle>
                                <CardDescription>
                                    Your professional details and qualifications
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
                                            {staff.specialization ||
                                                "Not specified"}
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
                                                {staff.years_of_experience ||
                                                    "0"}
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
                                            {staff.license_number ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card className="border-2 border-border/50 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <UserCircle className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-foreground">
                                        Account Details
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Facility ID
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {staff.facility_id ||
                                                "Not assigned"}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Member Since
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {new Date(
                                                staff.created_at
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Profile ID
                                        </p>
                                        <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                            {staff.id}
                                        </code>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="border-2 border-border/50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-foreground">
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>
                                    Manage your profile and account settings
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
                                    <Button
                                        variant="outline"
                                        className="rounded-xl h-14 border-border hover:bg-muted/50 gap-2 px-4"
                                    >
                                        <Shield className="w-5 h-5" />
                                        <span className="text-sm">
                                            Security
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl h-14 border-border hover:bg-muted/50 gap-2 px-4"
                                    >
                                        <Bell className="w-5 h-5" />
                                        <span className="text-sm">
                                            Notifications
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl h-14 border-border hover:bg-muted/50 gap-2 px-4"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span className="text-sm">
                                            Documents
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <EditStaffProfileModal
                    staff={staff}
                    onSave={handleUpdateProfile}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}
