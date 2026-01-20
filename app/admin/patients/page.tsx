"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    User,
    X,
    Phone,
    Mail,
    Calendar,
    MoreVertical,
    RefreshCw,
    Activity,
    AlertCircle,
    FileText,
    Heart,
    Bell,
    ChevronRightIcon,
    UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AddPatientSheet from "./addPatientSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

export default function PatientListPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [facilityId, setFacilityId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");

    const fetchPatients = useCallback(async () => {
        if (!facilityId) return;

        try {
            setIsLoading(true);
            const res = await fetch(
                `/api/patients/by-facility?facilityId=${facilityId}`
            );
            if (!res.ok) throw new Error("Failed to fetch patients");
            const data = await res.json();
            setPatients(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [facilityId]);

    useEffect(() => {
        const storedFacilityId = sessionStorage.getItem("facilityId");
        if (storedFacilityId) setFacilityId(storedFacilityId);
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const filteredPatients = useMemo(() => {
        let result = patients.filter(
            (p) =>
                p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.phone_number
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                p.blood_type?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Apply status filter
        if (statusFilter === "active") {
            result = result.filter((p) => {
                const lastVisit = p.last_visit ? new Date(p.last_visit) : null;
                const now = new Date();
                const daysSince = lastVisit
                    ? Math.floor(
                          (now.getTime() - lastVisit.getTime()) /
                              (1000 * 60 * 60 * 24)
                      )
                    : 365;
                return daysSince < 90;
            });
        } else if (statusFilter === "inactive") {
            result = result.filter((p) => {
                const lastVisit = p.last_visit ? new Date(p.last_visit) : null;
                const now = new Date();
                const daysSince = lastVisit
                    ? Math.floor(
                          (now.getTime() - lastVisit.getTime()) /
                              (1000 * 60 * 60 * 24)
                      )
                    : 365;
                return daysSince >= 90 && daysSince < 180;
            });
        } else if (statusFilter === "archived") {
            result = result.filter((p) => {
                const lastVisit = p.last_visit ? new Date(p.last_visit) : null;
                const now = new Date();
                const daysSince = lastVisit
                    ? Math.floor(
                          (now.getTime() - lastVisit.getTime()) /
                              (1000 * 60 * 60 * 24)
                      )
                    : 365;
                return daysSince >= 180;
            });
        }

        // Apply gender filter
        if (genderFilter === "male" || genderFilter === "female") {
            result = result.filter(
                (p) => p.gender?.toLowerCase() === genderFilter
            );
        }

        return result;
    }, [searchQuery, patients, statusFilter, genderFilter]);

    const calculateBMI = (height?: number, weight?: number) => {
        if (!height || !weight) return null;
        const bmi = weight / (height / 100) ** 2;
        return bmi.toFixed(1);
    };

    const getGenderConfig = (gender?: string) => {
        switch (gender?.toLowerCase()) {
            case "male":
                return {
                    bg: "bg-blue-500/10",
                    text: "text-blue-700",
                    border: "border-blue-200",
                    dot: "bg-blue-500",
                    icon: "👨",
                };
            case "female":
                return {
                    bg: "bg-pink-500/10",
                    text: "text-pink-700",
                    border: "border-pink-200",
                    dot: "bg-pink-500",
                    icon: "👩",
                };
            default:
                return {
                    bg: "bg-gray-500/10",
                    text: "text-gray-700",
                    border: "border-gray-200",
                    dot: "bg-gray-500",
                    icon: "👤",
                };
        }
    };

    const getPatientStatus = (patient: Patient) => {
        const lastVisit = patient.last_visit
            ? new Date(patient.last_visit)
            : null;
        const now = new Date();
        const daysSince = lastVisit
            ? Math.floor(
                  (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
              )
            : 365;

        if (daysSince < 30)
            return {
                status: "active",
                color: "bg-green-500",
                text: "text-green-700",
                bg: "bg-green-50",
            };
        if (daysSince < 90)
            return {
                status: "regular",
                color: "bg-blue-500",
                text: "text-blue-700",
                bg: "bg-blue-50",
            };
        if (daysSince < 180)
            return {
                status: "inactive",
                color: "bg-amber-500",
                text: "text-amber-700",
                bg: "bg-amber-50",
            };
        return {
            status: "archived",
            color: "bg-gray-500",
            text: "text-gray-700",
            bg: "bg-gray-50",
        };
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleViewPatient = (patient: Patient) => {
        // Open patient view sheet/dialog
        console.log("View patient:", patient.id);
        // You can implement your sheet opening logic here
        // Example: setSelectedPatient(patient); setViewOpen(true);
    };

    // Define columns for the table
    const columns: ColumnDef<Patient>[] = [
        {
            id: "index",
            header: ({ column }) => (
                <TableColumnHeader
                    column={column}
                    title="No"
                    className="text-center"
                />
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
                const genderConfig = getGenderConfig(row.original.gender);
                const status = getPatientStatus(row.original);
                const age = getAge(row.original.date_of_birth);

                return (
                    <div
                        className="flex items-center gap-3 cursor-pointer group/patient"
                        onClick={() => handleViewPatient(row.original)}
                    >
                        <div className="relative">
                            <Avatar className="size-10 border-2">
                                <AvatarImage src={row.original.avatar_url} />
                                <AvatarFallback className={genderConfig.bg}>
                                    {row.original.full_name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className="absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background"
                                style={{
                                    backgroundColor: status.color,
                                }}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-semibold text-sm group-hover/patient:text-primary transition-colors">
                                    {row.original.full_name}
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 ${genderConfig.bg} ${genderConfig.text} ${genderConfig.border}`}
                                >
                                    {genderConfig.icon}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <span>
                                    ID: {row.original.id.slice(0, 8)}...
                                </span>
                                {age && (
                                    <>
                                        <ChevronRightIcon size={12} />
                                        <span>{age} years</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
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
                    <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm truncate">
                            {row.original.email}
                        </span>
                    </div>
                    {row.original.phone_number && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                                {row.original.phone_number}
                            </span>
                        </div>
                    )}
                    {row.original.emergency_contact && (
                        <div className="flex items-center gap-2 text-xs text-amber-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>
                                Emergency: {row.original.emergency_contact}
                            </span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: "health",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Health Profile" />
            ),
            cell: ({ row }) => {
                const bmi = calculateBMI(
                    row.original.height_cm,
                    row.original.weight_kg
                );

                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            {row.original.blood_type && (
                                <Badge variant="outline" className="text-xs">
                                    Blood: {row.original.blood_type}
                                </Badge>
                            )}
                        </div>
                        {bmi && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        BMI:{" "}
                                    </span>
                                    <span className="font-medium">{bmi}</span>
                                </div>
                                <Progress
                                    value={Math.min(Number(bmi) * 3, 100)}
                                    className="h-1.5"
                                />
                            </div>
                        )}
                        {row.original.chronic_conditions && (
                            <div className="text-xs text-muted-foreground truncate">
                                Conditions: {row.original.chronic_conditions}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            id: "status",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Status & Activity" />
            ),
            cell: ({ row }) => {
                const status = getPatientStatus(row.original);

                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${status.color}`}
                            />
                            <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 ${status.bg} ${status.text}`}
                            >
                                {status.status.charAt(0).toUpperCase() +
                                    status.status.slice(1)}
                            </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Last visit: {formatDate(row.original.last_visit)}
                        </div>
                        {row.original.created_at && (
                            <div className="text-xs text-muted-foreground">
                                Registered:{" "}
                                {formatDate(row.original.created_at)}
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    if (!facilityId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md border-none shadow-lg">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">
                                Access Required
                            </h3>
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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    Patient Management
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Manage patient records, appointments, and
                                    health data
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={fetchPatients}
                            className="gap-2 hover:bg-accent"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                        <AddPatientSheet onCreated={fetchPatients}>
                            <Button
                                size="lg"
                                className="gap-2 shadow-lg shadow-primary/20"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Patient
                            </Button>
                        </AddPatientSheet>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Patients
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {patients.length}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-primary/10">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-500/10 hover:border-green-500/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Active Patients
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {
                                            patients.filter(
                                                (p) =>
                                                    getPatientStatus(p)
                                                        .status === "active"
                                            ).length
                                        }
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-green-500/10">
                                    <Activity className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500/10 hover:border-blue-500/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Avg Age
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {patients.length > 0
                                            ? Math.round(
                                                  patients.reduce(
                                                      (sum, p) =>
                                                          sum +
                                                          (getAge(
                                                              p.date_of_birth
                                                          ) || 0),
                                                      0
                                                  ) / patients.length
                                              )
                                            : 0}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-blue-500/10">
                                    <Calendar className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-500/10 hover:border-amber-500/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Needs Follow-up
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {
                                            patients.filter(
                                                (p) =>
                                                    getPatientStatus(p)
                                                        .status === "inactive"
                                            ).length
                                        }
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-amber-500/10">
                                    <AlertCircle className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold">
                                Patient Directory
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {filteredPatients.length} patients found
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search patients by name, email, phone..."
                                className="pl-12 h-14 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="h-14 rounded-xl">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                                <SelectItem value="archived">
                                    Archived
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={genderFilter}
                            onValueChange={setGenderFilter}
                        >
                            <SelectTrigger className="h-14 rounded-xl">
                                <Filter className="w-4 h-4 mr-2" />
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

                {/* Patients Table */}
                <div className="rounded-xl border border-border overflow-hidden bg-card">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-4 p-4"
                                >
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            ))}
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                                <User className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                No patients found
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {searchQuery
                                    ? `No patients match "${searchQuery}". Try a different search.`
                                    : "No patients are currently registered to your facility."}
                            </p>
                            <div className="flex gap-3 justify-center">
                                {searchQuery && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery("")}
                                        className="gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear Search
                                    </Button>
                                )}
                                <AddPatientSheet onCreated={fetchPatients}>
                                    <Button className="gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Add Patient
                                    </Button>
                                </AddPatientSheet>
                            </div>
                        </div>
                    ) : (
                        <TableProvider
                            columns={columns}
                            data={filteredPatients}
                        >
                            <TableHeader>
                                {({ headerGroup }) => (
                                    <TableHeaderGroup
                                        headerGroup={headerGroup}
                                        key={headerGroup.id}
                                    >
                                        {({ header }) => (
                                            <TableHead
                                                header={header}
                                                key={header.id}
                                            />
                                        )}
                                    </TableHeaderGroup>
                                )}
                            </TableHeader>
                            <TableBody>
                                {({ row }) => (
                                    <TableRow key={row.id} row={row}>
                                        {({ cell }) => (
                                            <TableCell
                                                cell={cell}
                                                key={cell.id}
                                            />
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </TableProvider>
                    )}
                </div>

                {/* Footer Stats */}
                {filteredPatients.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-linear-to-r from-primary/5 to-primary/10 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-primary/20">
                                        <Heart className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">
                                            Patient Health Insights
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Monitor patient health trends and
                                            provide proactive care
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-linear-to-r from-green-500/5 to-green-500/10 border-green-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-green-500/20">
                                        <Activity className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">
                                            Active Patients
                                        </h4>
                                        <p className="text-2xl font-bold text-green-600">
                                            {
                                                patients.filter(
                                                    (p) =>
                                                        getPatientStatus(p)
                                                            .status === "active"
                                                ).length
                                            }
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Visited in last 30 days
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-linear-to-r from-amber-500/5 to-amber-500/10 border-amber-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-amber-500/20">
                                        <AlertCircle className="h-6 w-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">
                                            Follow-up Needed
                                        </h4>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {
                                                patients.filter(
                                                    (p) =>
                                                        getPatientStatus(p)
                                                            .status ===
                                                        "inactive"
                                                ).length
                                            }
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            No visits in 90+ days
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
