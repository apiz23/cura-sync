"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
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
    Clock,
    CalendarDays,
    UserCheck,
    MoreVertical,
    FileText,
    Stethoscope,
    Pill,
    LucideIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import MedicationCard from "./medication-card";
import { Medication } from "@/app/types";
import AddMedicationSheet from "./add-medication-sheet";
import { useAuth } from "@/components/authprovideradmin";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Patient {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    avatar_url: string | null;
    phone_number: string | null;
    created_at: string;
    status?: string;
    last_login?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
}

export default function PatientDetailPage() {
    const params = useParams<{ patientId: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [medications, setMedications] = useState<Medication[]>([]);
    const [medLoading, setMedLoading] = useState(false);
    const { staff } = useAuth();

    const staffId = staff?.id ?? null;
    const staffName = staff?.full_name || staff?.email || "Unknown Staff";

    useEffect(() => {
        async function fetchPatient() {
            try {
                const res = await fetch(`/api/patients/${params.patientId}`, {
                    cache: "no-store",
                });

                if (!res.ok) {
                    setPatient(null);
                    return;
                }

                const data = await res.json();
                setPatient(data);
            } catch (err) {
                console.error("Failed to fetch patient", err);
                setPatient(null);
            } finally {
                setLoading(false);
            }
        }

        fetchPatient();
    }, [params.patientId]);

    const fetchMedications = useCallback(async () => {
        setMedLoading(true);
        try {
            const res = await fetch(
                `/api/medications?profile_id=${params.patientId}`,
                { cache: "no-store" }
            );

            if (!res.ok) {
                setMedications([]);
                return;
            }

            const data = await res.json();
            setMedications(data);
        } catch (err) {
            console.error("Failed to fetch medications", err);
            setMedications([]);
        } finally {
            setMedLoading(false);
        }
    }, [params.patientId]);

    useEffect(() => {
        if (activeTab === "medication") {
            fetchMedications();
        }
    }, [activeTab, fetchMedications]);

    if (loading) {
        return <PatientDetailSkeleton />;
    }

    if (!patient) {
        return notFound();
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Profile Card */}
                <Card className="p-6 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl flex-1 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="relative group">
                                {patient.avatar_url ? (
                                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-background/80 shadow-lg">
                                        <Image
                                            src={patient.avatar_url}
                                            alt={`${
                                                patient.full_name || "Patient"
                                            } avatar`}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 768px) 128px, 128px"
                                        />
                                        {/* linear Overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent" />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-xl bg-linear-to-br from-primary/25 to-primary/10 border-2 border-background/80 shadow-lg flex items-center justify-center">
                                        <UserCircle
                                            size={64}
                                            className="text-primary/80"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {patient.full_name || "Unnamed Patient"}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge
                                            variant="secondary"
                                            className="rounded-lg px-3 py-1"
                                        >
                                            <Stethoscope className="h-3 w-3 mr-1.5" />
                                            {patient.role || "Patient"}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            Member since{" "}
                                            {new Date(
                                                patient.created_at
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl"
                                >
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <ContactItem
                                    icon={Mail}
                                    label="Email"
                                    value={patient.email}
                                    copyable
                                />
                                <ContactItem
                                    icon={Phone}
                                    label="Phone"
                                    value={
                                        patient.phone_number || "Not provided"
                                    }
                                    copyable={!!patient.phone_number}
                                />
                                {patient.date_of_birth && (
                                    <ContactItem
                                        icon={CalendarDays}
                                        label="Date of Birth"
                                        value={patient.date_of_birth}
                                    />
                                )}
                                {patient.gender && (
                                    <ContactItem
                                        icon={UserCheck}
                                        label="Gender"
                                        value={patient.gender}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Patient ID Card */}
            <Card className="p-5 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Hash className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                        Patient ID
                    </h3>
                </div>
                <CopyableId value={patient.id} />
            </Card>

            {/* Tabs Section */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList className="bg-muted/30 p-1 rounded-xl w-full md:w-auto">
                    <TabsTrigger
                        value="overview"
                        className="rounded-lg data-[state=active]:bg-background"
                    >
                        <User className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="medical"
                        className="rounded-lg data-[state=active]:bg-background"
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Medical History
                    </TabsTrigger>
                    <TabsTrigger
                        value="medication"
                        className="rounded-lg data-[state=active]:bg-background"
                    >
                        <Pill className="h-4 w-4 mr-2" />
                        Medication
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="rounded-lg data-[state=active]:bg-background"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information Card */}
                        <Card className="p-5 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <UserCircle className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    Personal Information
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <InfoRow
                                    label="Full Name"
                                    value={patient.full_name}
                                />
                                <InfoRow label="Email" value={patient.email} />
                                <InfoRow
                                    label="Phone"
                                    value={patient.phone_number}
                                />
                                <InfoRow
                                    label="Date of Birth"
                                    value={patient.date_of_birth}
                                />
                                <InfoRow
                                    label="Gender"
                                    value={patient.gender}
                                />
                                {patient.address && (
                                    <div className="pt-2 border-t border-border/30">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Address
                                        </p>
                                        <p className="text-sm">
                                            {patient.address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Account Information Card */}
                        <Card className="p-5 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    Account Information
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <InfoRow
                                    label="Status"
                                    value={patient.status?.toUpperCase()}
                                />
                                <InfoRow label="Role" value={patient.role} />
                                <InfoRow
                                    label="Member Since"
                                    value={new Date(
                                        patient.created_at
                                    ).toLocaleDateString()}
                                />
                                {patient.last_login && (
                                    <InfoRow
                                        label="Last Login"
                                        value={new Date(
                                            patient.last_login
                                        ).toLocaleString()}
                                    />
                                )}
                                <InfoRow
                                    label="Patient ID"
                                    value={patient.id.slice(0, 8) + "..."}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Timeline Card */}
                    <Card className="p-5 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">
                                Timeline
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <TimelineItem
                                date={new Date(patient.created_at)}
                                title="Account Created"
                                description="Patient account was created in the system"
                                icon={<User className="h-4 w-4" />}
                            />
                            {patient.last_login && (
                                <TimelineItem
                                    date={new Date(patient.last_login)}
                                    title="Last Login"
                                    description="Patient last accessed their account"
                                    icon={<Activity className="h-4 w-4" />}
                                />
                            )}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="medical">
                    <Card className="p-5 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl shadow-sm">
                        <div className="text-center py-12">
                            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Medical History
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Medical records and history will be displayed
                                here once available
                            </p>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="medication" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">
                                Medications
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Active and historical medications for this
                                patient
                            </p>
                        </div>
                        {staffId && (
                            <AddMedicationSheet
                                profileId={patient.id}
                                doctorName={staffName}
                                onSuccess={fetchMedications}
                            >
                                <Button className="rounded-xl gap-2">
                                    <Pill className="h-4 w-4" />
                                    Add Medication
                                </Button>
                            </AddMedicationSheet>
                        )}
                    </div>

                    <ScrollArea className="max-h-[40vh]">
                        {medLoading ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <Card key={i} className="p-5 rounded-2xl">
                                        <Skeleton className="h-6 w-32 mb-4" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </Card>
                                ))}
                            </div>
                        ) : medications.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {medications.map((medication) => (
                                    <MedicationCard
                                        key={medication.id}
                                        medication={medication}
                                        onUpdate={fetchMedications}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl shadow-sm">
                                <div className="text-center py-6">
                                    <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">
                                        No Medications Found
                                    </h3>
                                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                        This patient doesn{"'"}t have any
                                        medications recorded yet.
                                    </p>
                                    <AddMedicationSheet
                                        profileId={patient.id}
                                        doctorName={staffName}
                                        onSuccess={fetchMedications}
                                    >
                                        <Button className="rounded-xl gap-2">
                                            <Pill className="h-4 w-4" />
                                            Add First Medication
                                        </Button>
                                    </AddMedicationSheet>
                                </div>
                            </Card>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="documents">
                    <Card className="p-5 border-border/40 bg-linear-to-br from-card to-muted/20 rounded-2xl shadow-sm">
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Documents
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Patient documents and files will appear here
                                once uploaded
                            </p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

/* ---------------- Components ---------------- */

function PatientDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Profile Skeleton */}
            <Card className="p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-6">
                    <Skeleton className="w-32 h-32 rounded-xl" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-64" />
                        <div className="flex gap-3">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-36" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* ID Card Skeleton */}
            <Skeleton className="h-24 w-full rounded-2xl" />

            {/* Tabs Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-full md:w-96 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

function ContactItem({
    icon: Icon,
    label,
    value,
    copyable = false,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    copyable?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (copyable && value && value !== "Not provided") {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
            </div>
            {copyable && value !== "Not provided" && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8 rounded-lg hover:bg-primary/5"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                </Button>
            )}
        </div>
    );
}

function CopyableId({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    return (
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/40">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Hash className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground mb-1">
                        Unique Identifier
                    </p>
                    <code className="text-sm font-mono font-medium">
                        {value}
                    </code>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    navigator.clipboard.writeText(value);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
                className="rounded-lg gap-2 hover:bg-primary/5"
            >
                {copied ? (
                    <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                    </>
                ) : (
                    <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy ID
                    </>
                )}
            </Button>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;

    return (
        <div className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

function TimelineItem({
    date,
    title,
    description,
    icon,
}: {
    date: Date;
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <div className="text-primary">{icon}</div>
                </div>
                <div className="flex-1 w-px bg-border my-2"></div>
            </div>
            <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground">{title}</h4>
                    <span className="text-xs text-muted-foreground">
                        {date.toLocaleDateString()} at{" "}
                        {date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
