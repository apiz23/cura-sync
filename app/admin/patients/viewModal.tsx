"use client";

import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Activity,
    UserCircle,
    Hash,
    Copy,
    Check,
} from "lucide-react";

interface Patient {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    avatar_url: string | null;
    phone_number: string | null;
    created_at: string;
    status?: string;
}

export default function ViewPatientModal({
    patient,
    children,
}: {
    patient: Patient;
    children: React.ReactNode;
}) {
    const [copiedId, setCopiedId] = React.useState(false);

    const getStatusColor = (status: string = "active") => {
        switch (status.toLowerCase()) {
            case "active":
                return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
            case "inactive":
                return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
            case "pending":
                return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="sm:max-w-2xl p-0 overflow-hidden border-2 shadow-2xl">
                {/* Header with linear */}
                <div className="bg-linear-to-r from-primary/10 via-primary/5 to-primary/5 p-6">
                    <SheetHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-2xl font-bold text-foreground serif">
                                Patient Details
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-muted-foreground">
                            Comprehensive information for{" "}
                            {patient.full_name || "the patient"}
                        </SheetDescription>
                    </SheetHeader>

                    {/* Patient Profile Summary */}
                    <div className="flex items-start gap-6 mt-6">
                        {/* Avatar Section */}
                        <div className="relative">
                            {patient.avatar_url ? (
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
                                    <Image
                                        src={patient.avatar_url}
                                        alt="Patient Avatar"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/10 border-4 border-background shadow-lg flex items-center justify-center">
                                    <UserCircle
                                        size={48}
                                        className="text-primary"
                                    />
                                </div>
                            )}
                            <div
                                className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-3 border-background flex items-center justify-center ${
                                    patient.status === "active"
                                        ? "bg-green-500"
                                        : patient.status === "pending"
                                        ? "bg-yellow-500"
                                        : "bg-gray-400"
                                }`}
                            >
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-1">
                                        {patient.full_name || "Unnamed Patient"}
                                    </h2>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                patient.status
                                            )}`}
                                        >
                                            {patient.status?.toUpperCase() ||
                                                "ACTIVE"}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {patient.role || "Patient"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Mail
                                        size={16}
                                        className="text-muted-foreground"
                                    />
                                    <span className="text-foreground text-sm">
                                        {patient.email}
                                    </span>
                                </div>
                                {patient.phone_number && (
                                    <div className="flex items-center gap-2">
                                        <Phone
                                            size={16}
                                            className="text-muted-foreground"
                                        />
                                        <span className="text-foreground text-sm">
                                            {patient.phone_number}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6">
                    {/* ID Section */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Hash
                                    size={16}
                                    className="text-muted-foreground"
                                />
                                <span className="text-sm font-medium text-foreground">
                                    Patient ID
                                </span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(patient.id)}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                                {copiedId ? (
                                    <>
                                        <Check size={12} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={12} />
                                        Copy ID
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="font-mono text-sm bg-background p-2 rounded border">
                            {patient.id}
                        </p>
                    </div>

                    {/* Detailed Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <User size={18} />
                                Personal Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Full Name
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {patient.full_name || "Not specified"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Email
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {patient.email}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Phone
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {patient.phone_number || "Not provided"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Shield size={18} />
                                Account Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Status
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                            patient.status
                                        )}`}
                                    >
                                        {patient.status?.toUpperCase() ||
                                            "ACTIVE"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Role
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {patient.role || "Patient"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Member Since
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {new Date(
                                            patient.created_at
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Calendar size={18} />
                            Timeline
                        </h3>
                        <div className="bg-muted/20 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calendar
                                        size={20}
                                        className="text-primary"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">
                                        Account Created
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(patient.created_at)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Patient has been registered for{" "}
                                        {Math.floor(
                                            (Date.now() -
                                                new Date(
                                                    patient.created_at
                                                ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                        )}{" "}
                                        days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t pt-6">
                        <h3 className="text-sm font-medium text-foreground mb-3">
                            Quick Actions
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                                <Mail size={14} className="inline mr-2" />
                                Send Message
                            </button>
                            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                                <Activity size={14} className="inline mr-2" />
                                View Activity
                            </button>
                            <button className="px-4 py-2 border border-input rounded-lg hover:bg-muted/30 transition-colors text-sm">
                                <User size={14} className="inline mr-2" />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
