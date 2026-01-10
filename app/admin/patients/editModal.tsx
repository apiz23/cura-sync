"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { User, Phone, Activity, Mail, Calendar, Shield } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const [role, setRole] = useState(patient.role ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const PATIENT_STATUSES = ["active", "suspended", "inactive"] as const;

    const [status, setStatus] = useState<"active" | "inactive" | "suspended">(
        patient.status ?? "active"
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
            case "inactive":
                return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
            case "suspended":
                return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
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
                    role,
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
                role,
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
            <SheetContent className="sm:max-w-2xl p-0 overflow-hidden border-2 shadow-2xl">
                <div className="bg-linear-to-r from-primary/5 to-primary/10 p-6">
                    <SheetHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-2xl font-bold text-foreground serif">
                                Edit Patient
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-muted-foreground">
                            Update patient information and status
                        </SheetDescription>
                    </SheetHeader>

                    {/* Patient Info Summary */}
                    <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg mt-4">
                        <div className="relative">
                            {patient.avatar_url ? (
                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-primary/20 to-primary/10">
                                    <Image
                                        src={patient.avatar_url}
                                        alt="Avatar"
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                    <User size={28} className="text-primary" />
                                </div>
                            )}
                            <div
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${
                                    status === "active"
                                        ? "bg-green-500"
                                        : status === "suspended"
                                        ? "bg-yellow-500"
                                        : "bg-gray-400"
                                }`}
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                                {patient.full_name || "Unnamed Patient"}
                            </h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail size={12} />
                                    <span>{patient.email}</span>
                                </div>
                                {patient.phone_number && (
                                    <div className="flex items-center gap-1">
                                        <Phone size={12} />
                                        <span>{patient.phone_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Form Fields */}
                    <div className="space-y-6">
                        <div>
                            <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                                <User size={16} />
                                Personal Information
                            </Label>
                            <div className="space-y-4">
                                <div>
                                    <Label className="block text-sm font-medium text-foreground mb-2">
                                        Full Name *
                                    </Label>
                                    <Input
                                        type="text"
                                        required
                                        className="w-full p-3 bg-background border border-Input rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter patient's full name"
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-foreground mb-2">
                                        Phone Number
                                    </Label>
                                    <div className="relative">
                                        <Phone
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                            size={18}
                                        />
                                        <Input
                                            type="tel"
                                            className="w-full pl-10 p-3 bg-background border border-Input rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                                <Shield size={16} />
                                Account Settings
                            </Label>
                            <div className="space-y-4">
                                <div>
                                    <Label className="block text-sm font-medium text-foreground mb-2">
                                        Role
                                    </Label>
                                    <Input
                                        type="text"
                                        className="w-full p-3 bg-background border border-Input rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200"
                                        value={role}
                                        onChange={(e) =>
                                            setRole(e.target.value)
                                        }
                                        placeholder="Patient, Admin, Staff, etc."
                                    />
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                                        <Activity size={16} />
                                        Status
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PATIENT_STATUSES.map((s) => (
                                            <Button
                                                key={s}
                                                onClick={() => setStatus(s)}
                                                className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    status === s
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-Input hover:bg-muted/30"
                                                }`}
                                            >
                                                <div
                                                    className={`w-2 h-2 rounded-full ${
                                                        s === "active"
                                                            ? "bg-green-500"
                                                            : s === "suspended"
                                                            ? "bg-yellow-500"
                                                            : "bg-gray-400"
                                                    }`}
                                                />
                                                <span className="capitalize">
                                                    {s}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>

                                    <div
                                        className={`mt-3 p-3 rounded-lg border ${getStatusColor(
                                            status
                                        )}`}
                                    >
                                        <p className="text-sm font-medium capitalize">
                                            {status}
                                        </p>
                                        <p className="text-xs mt-1">
                                            {status === "active"
                                                ? "Patient is currently active and receiving care"
                                                : status === "suspended"
                                                ? "Patient access is temporarily suspended"
                                                : "Patient account is inactive"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                                <Calendar size={16} />
                                Account Information
                            </Label>
                            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Patient ID:
                                    </span>
                                    <span className="font-mono text-foreground">
                                        {patient.id}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Email:
                                    </span>
                                    <span className="text-foreground">
                                        {patient.email}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Member Since:
                                    </span>
                                    <span className="text-foreground">
                                        {formatDate(patient.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="flex flex-col sm:flex-row gap-3 border-t">
                        <SheetTrigger asChild>
                            <Button className="px-6 py-3 border border-Input rounded-lg hover:bg-muted/30 transition-all duration-200 w-full sm:w-auto">
                                Cancel
                            </Button>
                        </SheetTrigger>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xs hover:shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
