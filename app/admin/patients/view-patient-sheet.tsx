"use client";

import Link from "next/link";
import {
    Activity,
    AlertCircle,
    Calendar,
    Heart,
    Mail,
    Phone,
    User,
    UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { Patient } from "./page";

type ViewPatientSheetProps = {
    patient: Patient | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function formatDate(dateString?: string) {
    if (!dateString) return "Not available";

    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getAge(dateOfBirth?: string) {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

function calculateBMI(height?: number, weight?: number) {
    if (!height || !weight) return null;
    const bmi = weight / (height / 100) ** 2;
    return bmi.toFixed(1);
}

function getPatientStatus(patient: Patient) {
    const lastVisit = patient.last_visit ? new Date(patient.last_visit) : null;
    const now = new Date();
    const daysSince = lastVisit
        ? Math.floor(
              (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 365;

    if (daysSince < 30) {
        return {
            label: "Active",
            classes: "bg-green-500/10 text-green-700 border-green-200",
        };
    }

    if (daysSince < 90) {
        return {
            label: "Regular",
            classes: "bg-blue-500/10 text-blue-700 border-blue-200",
        };
    }

    if (daysSince < 180) {
        return {
            label: "Inactive",
            classes: "bg-amber-500/10 text-amber-700 border-amber-200",
        };
    }

    return {
        label: "Archived",
        classes: "bg-muted text-muted-foreground border-border",
    };
}

export default function ViewPatientSheet({
    patient,
    open,
    onOpenChange,
}: ViewPatientSheetProps) {
    if (!patient) return null;

    const age = getAge(patient.date_of_birth);
    const bmi = calculateBMI(patient.height_cm, patient.weight_kg);
    const status = getPatientStatus(patient);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
                <SheetHeader className="border-b bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-6">
                    <div className="flex items-start gap-4 pr-8">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={patient.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {patient.full_name?.charAt(0).toUpperCase() || "P"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <SheetTitle className="text-2xl">
                                {patient.full_name}
                            </SheetTitle>
                            <SheetDescription>
                                Quick patient summary for admin review.
                            </SheetDescription>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={status.classes}>
                                    {status.label}
                                </Badge>
                                {patient.gender && (
                                    <Badge variant="outline">
                                        {patient.gender}
                                    </Badge>
                                )}
                                {age !== null && (
                                    <Badge variant="outline">{age} years</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 p-6">
                    <Card>
                        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </p>
                                <p className="font-medium">{patient.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone
                                </p>
                                <p className="font-medium">
                                    {patient.phone_number || "Not provided"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date of Birth
                                </p>
                                <p className="font-medium">
                                    {formatDate(patient.date_of_birth)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Patient ID
                                </p>
                                <p className="font-mono text-sm">{patient.id}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    Blood Type
                                </p>
                                <p className="font-medium">
                                    {patient.blood_type || "Not provided"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    BMI
                                </p>
                                <p className="font-medium">{bmi || "Not available"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Height / Weight
                                </p>
                                <p className="font-medium">
                                    {patient.height_cm ? `${patient.height_cm} cm` : "N/A"}
                                    {" / "}
                                    {patient.weight_kg ? `${patient.weight_kg} kg` : "N/A"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Last Visit
                                </p>
                                <p className="font-medium">
                                    {formatDate(patient.last_visit)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {(patient.allergies ||
                        patient.chronic_conditions ||
                        patient.emergency_contact) && (
                        <Card>
                            <CardContent className="space-y-4 p-5">
                                {patient.allergies && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                            Allergies
                                        </p>
                                        <p className="font-medium">{patient.allergies}</p>
                                    </div>
                                )}
                                {patient.chronic_conditions && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Chronic Conditions
                                        </p>
                                        <p className="font-medium">
                                            {patient.chronic_conditions}
                                        </p>
                                    </div>
                                )}
                                {patient.emergency_contact && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <UserCircle className="h-4 w-4" />
                                            Emergency Contact
                                        </p>
                                        <p className="font-medium">
                                            {patient.emergency_contact}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button asChild className="flex-1">
                            <Link href={`/admin/patients/${patient.id}`}>
                                Open Full Profile
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
