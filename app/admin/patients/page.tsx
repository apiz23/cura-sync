"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Activity,
    AlertCircle,
    Calendar,
    Filter,
    Heart,
    Mail,
    Phone,
    RefreshCw,
    Search,
    ChevronRight,
    User,
    UserPlus,
    Users,
    X,
} from "lucide-react";

import { useAuth } from "@/components/authprovideradmin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ColumnDef } from "@/components/kibo-ui/table";
import {
    TableBody,
    TableCell,
    TableColumnHeader,
    TableHead,
    TableHeader,
    TableHeaderGroup,
    TableProvider,
    TableRow,
} from "@/components/kibo-ui/table";
import AddPatientSheet from "./addPatientSheet";
import {
    calculatePatientAge,
    calculatePatientBmi,
} from "@/lib/patient-profile";

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
    last_visit?: string;
}

type RecordStatus = "complete" | "partial" | "basic";

export default function PatientListPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [facilityId, setFacilityId] = useState<string | null>(null);
    const [recordFilter, setRecordFilter] = useState<RecordStatus | "all">("all");
    const [genderFilter, setGenderFilter] = useState("all");

    const fetchPatients = useCallback(async () => {
        if (!facilityId) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/patients/by-facility?facilityId=${facilityId}`,
                { cache: "no-store" }
            );
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || "Failed to fetch patients");
            }

            setPatients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error ? err.message : "Failed to fetch patients"
            );
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    }, [facilityId]);

    useEffect(() => {
        if (!authLoading && user?.facility_id) {
            setFacilityId(user.facility_id);
        }
    }, [authLoading, user?.facility_id]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const getRecordCompletion = (patient: Patient) => {
        const completedFields = [
            patient.date_of_birth,
            patient.gender,
            patient.blood_type,
            patient.emergency_contact,
            patient.allergies,
            patient.chronic_conditions,
        ].filter(Boolean).length;

        const percentage = Math.round((completedFields / 6) * 100);
        let status: RecordStatus = "basic";

        if (percentage >= 67) status = "complete";
        else if (percentage > 0) status = "partial";

        return { percentage, status };
    };

    const filteredPatients = useMemo(() => {
        let result = patients.filter((patient) => {
            const query = searchQuery.toLowerCase();
            return (
                patient.full_name.toLowerCase().includes(query) ||
                patient.email.toLowerCase().includes(query) ||
                patient.phone_number?.toLowerCase().includes(query) ||
                patient.blood_type?.toLowerCase().includes(query)
            );
        });

        if (recordFilter !== "all") {
            result = result.filter(
                (patient) => getRecordCompletion(patient).status === recordFilter
            );
        }

        if (genderFilter === "male" || genderFilter === "female") {
            result = result.filter(
                (patient) => patient.gender?.toLowerCase() === genderFilter
            );
        }

        return result;
    }, [patients, searchQuery, recordFilter, genderFilter]);

    const averageAge = useMemo(() => {
        const ages = patients
            .map((patient) => calculatePatientAge(patient.date_of_birth))
            .filter((age): age is number => age !== null);

        if (!ages.length) return 0;
        return Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);
    }, [patients]);

    const openPatientProfile = (patientId: string) => {
        router.push(`/admin/patients/${patientId}`);
    };

    const columns: ColumnDef<Patient>[] = [
        {
            id: "index",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="No" className="text-center" />
            ),
            cell: ({ row }) => (
                <div className="text-center font-medium">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "full_name",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Patient" />
            ),
            cell: ({ row }) => {
                const age = calculatePatientAge(row.original.date_of_birth);
                return (
                    <button
                        type="button"
                        className="flex items-center gap-3 text-left"
                        onClick={(event) => {
                            event.stopPropagation();
                            openPatientProfile(row.original.id);
                        }}
                    >
                        <Avatar className="size-10 border border-border">
                            <AvatarImage src={row.original.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {row.original.full_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-base text-foreground">
                                {row.original.full_name}
                            </div>
                            <div className="text-base text-muted-foreground">
                                ID: {row.original.id.slice(0, 8)}...
                                {age !== null ? ` | ${age} years` : ""}
                            </div>
                        </div>
                    </button>
                );
            },
        },
        {
            id: "contact",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Contact" />
            ),
            cell: ({ row }) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-base">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{row.original.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-base text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{row.original.phone_number || "No phone recorded"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-base text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>
                            Emergency contact:{" "}
                            {row.original.emergency_contact || "Missing"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            id: "health",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Health Profile" />
            ),
            cell: ({ row }) => {
                const bmi = calculatePatientBmi(
                    row.original.height_cm,
                    row.original.weight_kg
                );

                return (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                                Blood: {row.original.blood_type || "Not added"}
                            </Badge>
                            <Badge variant="outline">
                                Gender: {row.original.gender || "Not added"}
                            </Badge>
                        </div>
                        {bmi ? (
                            <div className="text-base text-muted-foreground">
                                BMI: <span className="font-medium text-foreground">{bmi}</span>
                            </div>
                        ) : (
                            <div className="text-base text-muted-foreground">
                                BMI unavailable
                            </div>
                        )}
                        <div className="text-base text-muted-foreground">
                            Conditions: {row.original.chronic_conditions || "None recorded"}
                        </div>
                    </div>
                );
            },
        },
        // {
        //     id: "record",
        //     header: ({ column }) => (
        //         <TableColumnHeader column={column} title="Record Status" />
        //     ),
        //     cell: ({ row }) => {
        //         const completion = getRecordCompletion(row.original);
        //         const statusLabel =
        //             completion.status === "complete"
        //                 ? "Complete"
        //                 : completion.status === "partial"
        //                   ? "Partial"
        //                   : "Basic";

        //         return (
        //             <div className="space-y-2">
        //                 <Badge variant="outline" className="text-base">
        //                     {statusLabel}
        //                 </Badge>
        //                 <div className="space-y-1">
        //                     <div className="flex items-center justify-between text-base">
        //                         <span className="text-muted-foreground">
        //                             Completion
        //                         </span>
        //                         <span className="font-medium text-foreground">
        //                             {completion.percentage}%
        //                         </span>
        //                     </div>
        //                     <Progress value={completion.percentage} className="h-1.5" />
        //                 </div>
        //                 <div className="text-base text-muted-foreground">
        //                     Registered: {formatDate(row.original.created_at)}
        //                 </div>
        //             </div>
        //         );
        //     },
        // },
        {
            id: "open",
            header: () => <div className="text-right">Open</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-base font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            openPatientProfile(row.original.id);
                        }}
                    >
                        Open profile
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    if (!facilityId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="max-w-md border-none shadow-lg">
                    <CardContent className="space-y-4 p-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="mb-2 text-xl font-semibold">Access Required</h3>
                            <p className="text-muted-foreground">
                                Sign in as facility staff to manage patients
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2.5">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                    Patient Management
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    Manage patient records and review profile completeness.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={fetchPatients}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <AddPatientSheet onCreated={fetchPatients}>
                            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                                <UserPlus className="h-4 w-4" />
                                Add Patient
                            </Button>
                        </AddPatientSheet>
                    </div>
                </div>

                {error ? (
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardContent className="flex items-center justify-between gap-4 p-4">
                            <div>
                                <p className="font-medium text-foreground">
                                    Patient data unavailable
                                </p>
                                <p className="text-base text-muted-foreground">{error}</p>
                            </div>
                            <Button variant="outline" onClick={fetchPatients}>
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                ) : null}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <MetricCard
                        label="Total Patients"
                        value={patients.length}
                        icon={Users}
                        helper="Registered records"
                    />
                    <MetricCard
                        label="Emergency Contacts"
                        value={patients.filter((p) => !!p.emergency_contact).length}
                        icon={AlertCircle}
                        helper="Patients with emergency details"
                    />
                    <MetricCard
                        label="Average Age"
                        value={averageAge}
                        icon={Calendar}
                        helper="Based on recorded dates of birth"
                    />
                    <MetricCard
                        label="Complete Records"
                        value={
                            patients.filter(
                                (patient) => getRecordCompletion(patient).status === "complete"
                            ).length
                        }
                        icon={Activity}
                        helper="Profiles with richer health information"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold">Patient Directory</h2>
                            <p className="text-base text-muted-foreground">
                                {filteredPatients.length} patients found
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>
                             <p className="text-base text-muted-foreground">
                                Click any row to open the full patient profile.
                             </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search patients by name, email, phone..."
                                className="h-10 rounded-xl pl-12"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <Select value={recordFilter} onValueChange={(value) => setRecordFilter(value as RecordStatus | "all")}>
                            <SelectTrigger className="h-10 rounded-xl">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by record status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Records</SelectItem>
                                <SelectItem value="complete">Complete</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger className="h-10 rounded-xl">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Genders</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            ))}
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <User className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">No patients found</h3>
                            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                                {searchQuery
                                    ? `No patients match "${searchQuery}". Try a different search.`
                                    : "No patients are currently registered to your facility."}
                            </p>
                            <div className="flex justify-center gap-3">
                                {searchQuery && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery("")}
                                        className="gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear Search
                                    </Button>
                                )}
                                <AddPatientSheet onCreated={fetchPatients}>
                                    <Button className="gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Add Patient
                                    </Button>
                                </AddPatientSheet>
                            </div>
                        </div>
                    ) : (
                        <TableProvider columns={columns} data={filteredPatients}>
                            <TableHeader>
                                {({ headerGroup }) => (
                                    <TableHeaderGroup
                                        headerGroup={headerGroup}
                                        key={headerGroup.id}
                                    >
                                        {({ header }) => (
                                            <TableHead header={header} key={header.id} />
                                        )}
                                    </TableHeaderGroup>
                                )}
                            </TableHeader>
                            <TableBody>
                                {({ row }) => (
                                    <TableRow
                                        key={row.id}
                                        row={row}
                                        onClick={() =>
                                            openPatientProfile(
                                                (row.original as Patient).id
                                            )
                                        }
                                        className="cursor-pointer transition-colors hover:bg-muted/40"
                                    >
                                        {({ cell }) => (
                                            <TableCell cell={cell} key={cell.id} />
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </TableProvider>
                    )}
                </div>

                {filteredPatients.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="border-border bg-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <Heart className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 font-semibold">Blood types recorded</h4>
                                        <p className="text-2xl font-bold text-foreground">
                                            {patients.filter((patient) => !!patient.blood_type).length}
                                        </p>
                                        <p className="text-base text-muted-foreground">
                                            Patients with blood type on file
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-muted p-3">
                                        <Mail className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 font-semibold">Email coverage</h4>
                                        <p className="text-2xl font-bold text-foreground">
                                            {patients.length}
                                        </p>
                                        <p className="text-base text-muted-foreground">
                                            Every patient record includes an email
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-destructive/10 p-3">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 font-semibold">Missing emergency contact</h4>
                                        <p className="text-2xl font-bold text-foreground">
                                            {
                                                patients.filter((patient) => !patient.emergency_contact)
                                                    .length
                                            }
                                        </p>
                                        <p className="text-base text-muted-foreground">
                                            Profiles needing a safer emergency record
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

        </div>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    helper,
}: {
    label: string;
    value: number;
    icon: typeof Users;
    helper: string;
}) {
    return (
        <Card className="border-2 border-primary/10 transition-all hover:border-primary/20">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-base font-medium text-muted-foreground">{label}</p>
                        <h3 className="mt-2 text-3xl font-bold">{value}</h3>
                        <p className="mt-2 text-base text-muted-foreground">{helper}</p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
