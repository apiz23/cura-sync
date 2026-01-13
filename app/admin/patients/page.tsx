"use client";

import { useState, useMemo, useEffect } from "react";
import supabase from "@/lib/supabase";
import {
    Search,
    Filter,
    Calendar,
    Users,
    X,
    Phone,
    Mail,
    Eye,
    Edit,
    UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import PageTitle from "@/components/page-title";
import EditPatientModal from "./edit-sheet";
import AddPatientSheet from "./addPatientSheet";
export interface Patient {
    id: string;
    profile_id: string;
    email: string;
    full_name: string;
    phone_number?: string;
    avatar_url?: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    height_cm?: number;
    weight_kg?: number;
    allergies?: string;
    chronic_conditions?: string;
    emergency_contact?: string;
    age?: number;
    created_at?: string;
}

interface CuraPatientProfile {
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    height_cm?: number;
    weight_kg?: number;
    allergies?: string;
    chronic_conditions?: string;
    emergency_contact?: string;
}

interface CuraProfileRow {
    id: string;
    email: string;
    full_name?: string;
    phone_number?: string;
    avatar_url?: string;
    created_at?: string;
    cura_patient_profiles?: CuraPatientProfile[];
}

export default function PatientListPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [facilityId, setFacilityId] = useState<string | null>(null);
    const [authData, setAuthData] = useState<Record<string, unknown> | null>(
        null
    );

    // Fetch patients function
    const fetchPatients = async () => {
        if (!facilityId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            // Fetch patients registered to this facility
            const {
                data: patientFacilitiesData,
                error: patientFacilitiesError,
            } = await supabase
                .from("cura_patient_facilities")
                .select("profile_id, status, registered_at")
                .eq("facility_id", facilityId)
                .eq("status", "active");

            if (patientFacilitiesError) throw patientFacilitiesError;

            // Get patient IDs
            const patientIds =
                patientFacilitiesData?.map((pf) => pf.profile_id) || [];

            if (patientIds.length === 0) {
                setPatients([]);
                setIsLoading(false);
                return;
            }

            // Fetch patient profiles and their details
            const { data: profilesData, error: profilesError } = await supabase
                .from("cura_profiles")
                .select(
                    `
                    id,
                    email,
                    full_name,
                    phone_number,
                    avatar_url,
                    created_at,
                    cura_patient_profiles (
                        date_of_birth,
                        gender,
                        blood_type,
                        height_cm,
                        weight_kg,
                        allergies,
                        chronic_conditions,
                        emergency_contact
                    )
                `
                )
                .in("id", patientIds)
                .eq("role", "patient");

            if (profilesError) throw profilesError;

            // Format the data
            const formattedPatients = (profilesData || []).map(
                (profile: CuraProfileRow) => {
                    const patientProfile =
                        profile.cura_patient_profiles?.[0] || {};

                    // Calculate age if date of birth exists
                    let age;
                    if (patientProfile.date_of_birth) {
                        const birthDate = new Date(
                            patientProfile.date_of_birth
                        );
                        const today = new Date();
                        age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff =
                            today.getMonth() - birthDate.getMonth();
                        if (
                            monthDiff < 0 ||
                            (monthDiff === 0 &&
                                today.getDate() < birthDate.getDate())
                        ) {
                            age--;
                        }
                    }

                    return {
                        id: profile.id,
                        profile_id: profile.id,
                        email: profile.email,
                        full_name: profile.full_name || "Unknown Patient",
                        phone_number: profile.phone_number,
                        avatar_url: profile.avatar_url,
                        date_of_birth: patientProfile.date_of_birth,
                        gender: patientProfile.gender,
                        blood_type: patientProfile.blood_type,
                        height_cm: patientProfile.height_cm,
                        weight_kg: patientProfile.weight_kg,
                        allergies: patientProfile.allergies,
                        chronic_conditions: patientProfile.chronic_conditions,
                        emergency_contact: patientProfile.emergency_contact,
                        age,
                        created_at: profile.created_at,
                    };
                }
            );

            setPatients(formattedPatients);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePatientUpdate = (
        updatedPatient: Partial<Patient> & { id: string }
    ) => {
        setPatients((prev) =>
            prev.map((p) =>
                p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p
            )
        );
    };

    useEffect(() => {
        // Get facility ID and auth data from session storage
        const storedFacilityId = sessionStorage.getItem("facilityId");
        const storedAuthData = sessionStorage.getItem("cura-auth");

        if (storedFacilityId) {
            setFacilityId(storedFacilityId);
        }

        if (storedAuthData) {
            try {
                setAuthData(JSON.parse(storedAuthData));
            } catch (e) {
                console.error("Error parsing auth data:", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchPatients = async () => {
            if (!facilityId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                const { data: patientFacilitiesData, error } = await supabase
                    .from("cura_patient_facilities")
                    .select("profile_id")
                    .eq("facility_id", facilityId)
                    .eq("status", "active");

                if (error) throw error;

                const patientIds =
                    patientFacilitiesData?.map((pf) => pf.profile_id) || [];

                if (patientIds.length === 0) {
                    setPatients([]);
                    return;
                }

                const { data: profilesData, error: profilesError } =
                    await supabase
                        .from("cura_profiles")
                        .select(
                            `
                        id,
                        email,
                        full_name,
                        phone_number,
                        avatar_url,
                        created_at,
                        cura_patient_profiles (
                            date_of_birth,
                            gender,
                            blood_type,
                            height_cm,
                            weight_kg,
                            allergies,
                            chronic_conditions,
                            emergency_contact
                        )
                    `
                        )
                        .in("id", patientIds)
                        .eq("role", "patient");

                if (profilesError) throw profilesError;

                const formattedPatients: Patient[] = (profilesData || []).map(
                    (profile: CuraProfileRow) => {
                        const patientProfile =
                            profile.cura_patient_profiles?.[0] || {};

                        let age: number | undefined;
                        if (patientProfile.date_of_birth) {
                            const birthDate = new Date(
                                patientProfile.date_of_birth
                            );
                            const today = new Date();
                            age = today.getFullYear() - birthDate.getFullYear();
                            if (
                                today.getMonth() < birthDate.getMonth() ||
                                (today.getMonth() === birthDate.getMonth() &&
                                    today.getDate() < birthDate.getDate())
                            ) {
                                age--;
                            }
                        }

                        return {
                            id: profile.id,
                            profile_id: profile.id,
                            email: profile.email,
                            full_name: profile.full_name || "Unknown Patient",
                            phone_number: profile.phone_number,
                            avatar_url: profile.avatar_url,
                            date_of_birth: patientProfile.date_of_birth,
                            gender: patientProfile.gender,
                            blood_type: patientProfile.blood_type,
                            height_cm: patientProfile.height_cm,
                            weight_kg: patientProfile.weight_kg,
                            allergies: patientProfile.allergies,
                            chronic_conditions:
                                patientProfile.chronic_conditions,
                            emergency_contact: patientProfile.emergency_contact,
                            age,
                            created_at: profile.created_at,
                        };
                    }
                );

                setPatients(formattedPatients);
            } catch (err) {
                console.error("Error fetching patients:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatients();
    }, [facilityId]);

    const filteredPatients = useMemo(() => {
        return patients.filter(
            (p) =>
                (p.full_name || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (p.email || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (p.phone_number || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (p.blood_type || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, patients]);

    const calculateBMI = (height_cm?: number, weight_kg?: number) => {
        if (!height_cm || !weight_kg) return null;
        const heightM = height_cm / 100;
        return (weight_kg / (heightM * heightM)).toFixed(1);
    };

    if (!facilityId || !authData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md border-none shadow-2xl">
                    <CardContent className="p-8">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold">
                                    Access Denied
                                </h3>
                                <p className="text-muted-foreground">
                                    Please sign in as a facility staff member to
                                    view patients
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-background to-muted/20 p-4 md:p-6">
            <PageTitle title={"Patients Management"} />
            <div className="mx-auto space-y-8">
                {/* Search Section */}
                <div className="mb-8 space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3">
                            Patient Records
                        </h2>
                        <p className="text-muted-foreground">
                            Manage and view patient information for your
                            facility
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-12">
                        <div className="md:col-span-8 lg:col-span-9">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search patients by name, email, phone, or blood type..."
                                    className="pl-12 h-14 text-base rounded-xl border-border/60 focus:border-primary"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-4 lg:col-span-3 flex gap-2">
                            <Button
                                variant="outline"
                                className="h-14 flex-1 rounded-xl gap-2 border-border/60"
                                onClick={() =>
                                    setViewMode(
                                        viewMode === "grid" ? "list" : "grid"
                                    )
                                }
                            >
                                <Filter className="h-4 w-4" />
                                {viewMode === "grid"
                                    ? "List View"
                                    : "Grid View"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">
                                Registered Patients
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {filteredPatients.length}{" "}
                                {filteredPatients.length === 1
                                    ? "patient"
                                    : "patients"}{" "}
                                found
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>
                        </div>

                        {/* ADD PATIENT */}
                        <AddPatientSheet onCreated={fetchPatients}>
                            <Button className="rounded-xl gap-2">
                                <UserPlus className="w-4 h-4" />
                                Add Patient
                            </Button>
                        </AddPatientSheet>
                    </div>

                    {/* Quick Stats */}
                    {filteredPatients.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Patients
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {filteredPatients.length}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-200/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Male Patients
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {
                                                    filteredPatients.filter(
                                                        (p) =>
                                                            p.gender?.toLowerCase() ===
                                                            "male"
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <Users className="h-4 w-4 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-pink-500/5 to-pink-500/10 border-pink-200/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Female Patients
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {
                                                    filteredPatients.filter(
                                                        (p) =>
                                                            p.gender?.toLowerCase() ===
                                                            "female"
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                        <div className="p-2 bg-pink-500/10 rounded-lg">
                                            <Users className="h-4 w-4 text-pink-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-200/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Avg. Age
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {filteredPatients.filter(
                                                    (p) => p.age
                                                ).length > 0
                                                    ? Math.round(
                                                          filteredPatients
                                                              .filter(
                                                                  (p) => p.age
                                                              )
                                                              .reduce(
                                                                  (acc, p) =>
                                                                      acc +
                                                                      (p.age ||
                                                                          0),
                                                                  0
                                                              ) /
                                                              filteredPatients.filter(
                                                                  (p) => p.age
                                                              ).length
                                                      )
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-amber-500/10 rounded-lg">
                                            <Calendar className="h-4 w-4 text-amber-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Results */}
                {isLoading ? (
                    <div
                        className={`grid ${
                            viewMode === "grid"
                                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                : "grid-cols-1 gap-4"
                        }`}
                    >
                        {[...Array(6)].map((_, i) => (
                            <Card
                                key={i}
                                className="overflow-hidden border-border/40"
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                                        <Skeleton className="h-4 w-1/2 rounded-lg" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                        </div>
                                        <Skeleton className="h-24 w-full rounded-lg" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <Card className="border-dashed border-border/60 bg-gradient-to-br from-background to-muted/10">
                        <CardContent className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                No patients found
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {searchQuery
                                    ? `No results for "${searchQuery}". Try different keywords.`
                                    : "No patients have booked appointments at your facility yet."}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery("")}
                                    className="gap-2 rounded-xl"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Search
                                </Button>
                            )}
                            <AddPatientSheet onCreated={fetchPatients}>
                                <Button className="gap-2 rounded-xl">
                                    <UserPlus className="w-4 h-4" />
                                    Add First Patient
                                </Button>
                            </AddPatientSheet>
                        </CardContent>
                    </Card>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => (
                            <Card
                                key={patient.id}
                                className="group hover:shadow-xl transition-all duration-300 border-border/40 bg-gradient-to-br from-card to-muted/5 overflow-hidden"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-bold">
                                            {patient.full_name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg line-clamp-1">
                                                {patient.full_name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {patient.age
                                                    ? `${patient.age} years old`
                                                    : "Age not set"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {patient.gender && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {patient.gender}
                                            </Badge>
                                        )}
                                        {patient.blood_type && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs bg-red-500/10 text-red-700"
                                            >
                                                {patient.blood_type}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {patient.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="line-clamp-1">
                                                {patient.email}
                                            </span>
                                        </div>
                                    )}

                                    {patient.phone_number && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span>{patient.phone_number}</span>
                                        </div>
                                    )}

                                    {(patient.height_cm ||
                                        patient.weight_kg) && (
                                        <div className="flex gap-4 text-sm">
                                            {patient.height_cm && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        Height:{" "}
                                                    </span>
                                                    <span className="font-medium">
                                                        {patient.height_cm} cm
                                                    </span>
                                                </div>
                                            )}
                                            {patient.weight_kg && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        Weight:{" "}
                                                    </span>
                                                    <span className="font-medium">
                                                        {patient.weight_kg} kg
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {patient.allergies && (
                                        <div className="text-sm">
                                            <span className="text-red-600 font-medium">
                                                ⚠️ Allergies:{" "}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {patient.allergies}
                                            </span>
                                        </div>
                                    )}

                                    {patient.chronic_conditions && (
                                        <div className="text-sm">
                                            <span className="text-amber-600 font-medium">
                                                Conditions:{" "}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {patient.chronic_conditions}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-4 border-t border-border/30">
                                    <div className="flex gap-3 w-full">
                                        {/* View */}
                                        <Link
                                            href={`/admin/patients/${patient.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                className="w-full rounded-lg gap-2"
                                                variant="outline"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Button>
                                        </Link>

                                        {/* Edit */}
                                        <EditPatientModal
                                            patient={{
                                                id: patient.id,
                                                email: patient.email,
                                                full_name: patient.full_name,
                                                role: "patient",
                                                avatar_url:
                                                    patient.avatar_url ??
                                                    undefined,
                                                phone_number:
                                                    patient.phone_number ??
                                                    undefined,
                                                created_at: patient.created_at!,
                                                status: "active",
                                            }}
                                            onSave={handlePatientUpdate}
                                        >
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-lg"
                                                title="Edit patient"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </EditPatientModal>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPatients.map((patient) => (
                            <Card
                                key={patient.id}
                                className="hover:shadow-md transition-shadow border-border/40 bg-gradient-to-br from-card to-muted/5"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="md:w-1/4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold">
                                                    {patient.full_name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold line-clamp-1">
                                                        {patient.full_name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {patient.age
                                                            ? `${patient.age} yrs`
                                                            : "N/A"}{" "}
                                                        •{" "}
                                                        {patient.gender ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-1/4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="line-clamp-1">
                                                        {patient.email}
                                                    </span>
                                                </div>
                                                {patient.phone_number && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                                        <span>
                                                            {
                                                                patient.phone_number
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:w-1/4">
                                            <div className="flex flex-wrap gap-2">
                                                {patient.blood_type && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-red-500/10 text-red-700"
                                                    >
                                                        {patient.blood_type}
                                                    </Badge>
                                                )}
                                                {patient.height_cm &&
                                                    patient.weight_kg && (
                                                        <Badge variant="outline">
                                                            BMI:{" "}
                                                            {calculateBMI(
                                                                patient.height_cm,
                                                                patient.weight_kg
                                                            )}
                                                        </Badge>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="md:w-1/4">
                                            <Link
                                                href={`/admin/patients/${patient.id}`}
                                            >
                                                <Button
                                                    className="w-full rounded-lg gap-2"
                                                    variant="outline"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                            <EditPatientModal
                                                patient={{
                                                    id: patient.id,
                                                    email: patient.email,
                                                    full_name:
                                                        patient.full_name,
                                                    role: "patient",
                                                    avatar_url:
                                                        patient.avatar_url ??
                                                        undefined,
                                                    phone_number:
                                                        patient.phone_number ??
                                                        undefined,
                                                    created_at:
                                                        patient.created_at!,
                                                    status: "active",
                                                }}
                                                onSave={handlePatientUpdate}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    title="Edit patient"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </EditPatientModal>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
