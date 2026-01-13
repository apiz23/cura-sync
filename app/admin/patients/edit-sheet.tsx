"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { User, Phone, Activity, Mail, Calendar, Shield } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Patient {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    avatar_url: string | null;
    phone_number: string | null;
    created_at: string;
    status?: "active" | "inactive" | "suspended";
}

interface EditPatientModalProps {
    patient: Patient;
    onSave: (updated: Patient) => void;
    children: React.ReactNode;
}

export default function EditPatientModal({
    patient,
    onSave,
    children,
}: EditPatientModalProps) {
    const [name, setName] = useState(patient.full_name ?? "");
    const [phone, setPhone] = useState(patient.phone_number ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const PATIENT_STATUSES = ["active", "suspended", "inactive"] as const;

    const [status, setStatus] = useState<"active" | "inactive" | "suspended">(
        patient.status ?? "active"
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800";
            case "inactive":
                return "text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-800";
            case "suspended":
                return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800";
            default:
                return "text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-800";
        }
    };

    const getStatusIconColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-500";
            case "suspended":
                return "bg-amber-500";
            case "inactive":
                return "bg-gray-400";
            default:
                return "bg-gray-400";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/patients/${patient.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: name,
                    phone_number: phone,
                    status,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update patient");
            }

            onSave({
                ...patient,
                full_name: name,
                phone_number: phone,
                status,
            });
        } catch (error) {
            console.error(error);
            alert("Failed to update patient. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="sm:max-w-2xl w-full p-0 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    {/* Header with linear */}
                    <div className="bg-linear-to-br from-primary/5 via-primary/5 to-primary/10 p-6 border-b border-border/40">
                        <SheetHeader className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-2xl font-bold text-foreground">
                                    Edit Patient Profile
                                </SheetTitle>
                            </div>
                            <SheetDescription className="text-muted-foreground">
                                Update patient information and account settings
                            </SheetDescription>
                        </SheetHeader>

                        {/* Patient Info Summary */}
                        <div className="flex items-center gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/30">
                            <div className="relative">
                                {patient.avatar_url ? (
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-background shadow-sm">
                                        <Image
                                            src={patient.avatar_url}
                                            alt="Avatar"
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 border-2 border-background shadow-sm flex items-center justify-center">
                                        <User
                                            size={28}
                                            className="text-primary"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground">
                                    {patient.full_name || "Unnamed Patient"}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="truncate max-w-[180px]">
                                            {patient.email}
                                        </span>
                                    </div>
                                    {patient.phone_number && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span>{patient.phone_number}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <Label className="text-base font-semibold text-foreground">
                                    Personal Information
                                </Label>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        Full Name *
                                    </Label>
                                    <Input
                                        type="text"
                                        required
                                        className="h-11 rounded-xl border-border/60 focus:border-primary"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter patient's full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        Phone Number
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="tel"
                                            className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            placeholder="+60 212348812"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Settings */}
                        <div className="space-y-4 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <Label className="text-base font-semibold text-foreground">
                                    Account Settings
                                </Label>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Activity className="h-3.5 w-3.5" />
                                        Status
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PATIENT_STATUSES.map((s) => (
                                            <button
                                                type="button"
                                                key={s}
                                                onClick={() => setStatus(s)}
                                                className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                                                    status === s
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-border/60 hover:bg-muted/30"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${getStatusIconColor(
                                                            s
                                                        )}`}
                                                    />
                                                    <span className="text-sm font-medium capitalize">
                                                        {s}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className={`w-fit ${getStatusColor(
                                            status
                                        )} mt-2 px-3 py-1.5 rounded-lg`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${getStatusIconColor(
                                                    status
                                                )}`}
                                            />
                                            <span className="text-sm font-medium capitalize">
                                                {status}
                                            </span>
                                            <span className="text-xs opacity-80">
                                                {status === "active"
                                                    ? "• Active and receiving care"
                                                    : status === "suspended"
                                                    ? "• Access temporarily suspended"
                                                    : "• Account inactive"}
                                            </span>
                                        </div>
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <Label className="text-base font-semibold text-foreground">
                                    Account Information
                                </Label>
                            </div>

                            <Card className="p-4 bg-linear-to-br from-muted/20 to-muted/10 border-border/40 rounded-xl">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Patient ID
                                        </span>
                                        <span className="font-mono text-sm font-medium text-foreground truncate ml-2 max-w-[200px]">
                                            {patient.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Email
                                        </span>
                                        <span className="text-sm font-medium text-foreground truncate ml-2 max-w-[200px]">
                                            {patient.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Member Since
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {formatDate(patient.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Spacer to prevent content from being hidden behind footer */}
                        <div className="h-20" />
                    </form>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 border-t border-border/40 bg-card/95 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-end gap-3 w-full">
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-xl h-11 flex-1 sm:flex-none min-w-[100px] border-border/60 hover:bg-muted/30"
                            >
                                Cancel
                            </Button>
                        </SheetTrigger>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !name.trim()}
                            className="rounded-xl h-11 flex-1 sm:flex-none min-w-[120px] bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
