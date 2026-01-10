"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    RefreshCw,
    User,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ViewPatientModal from "./viewModal";
import EditPatientModal from "./editModal";
import { Button } from "@/components/ui/button";
import AddPatientSheet from "./addPatientSheet";

interface Patient {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    avatar_url: string | null;
    phone_number: string | null;
    created_at: string;
    status?: "active" | "inactive" | "suspended";
    registered_at?: string;
}

export default function PatientManagementPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Patient;
        direction: "asc" | "desc";
    } | null>(null);
    const patientsPerPage = 8;

    const fetchPatients = useCallback(async () => {
        try {
            setLoading(true);

            const facilityId = sessionStorage.getItem("facilityId");

            if (!facilityId) {
                console.error("No facilityId in sessionStorage");
                return;
            }

            const res = await fetch(`/api/patients/facility/${facilityId}`);

            if (!res.ok) {
                throw new Error("Failed to fetch patients");
            }

            const data = await res.json();
            setPatients(data);
        } catch (err) {
            console.error("Error fetching patients:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleSort = (key: keyof Patient) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig?.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
            case "suspended":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const filteredPatients = patients.filter((patient) => {
        const matchesSearch =
            patient.full_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            selectedStatus === "all" || patient.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const sortedPatients = [...filteredPatients].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        const aValue = a[key];
        const bValue = b[key];

        if (aValue === undefined || aValue === null)
            return direction === "asc" ? 1 : -1;
        if (bValue === undefined || bValue === null)
            return direction === "asc" ? -1 : 1;
        if (aValue === bValue) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
            return direction === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (key === "created_at") {
            const aDate = new Date(aValue as string).getTime();
            const bDate = new Date(bValue as string).getTime();
            return direction === "asc" ? aDate - bDate : bDate - aDate;
        }

        return direction === "asc"
            ? aValue < bValue
                ? -1
                : 1
            : aValue < bValue
            ? 1
            : -1;
    });

    const totalPages = Math.ceil(sortedPatients.length / patientsPerPage);
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = sortedPatients.slice(
        indexOfFirstPatient,
        indexOfLastPatient
    );

    const handleUpdatePatient = (updatedPatient: Patient) => {
        setPatients((prev) =>
            prev.map((p) =>
                p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p
            )
        );
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this patient?")) {
            // Add your delete API call here
            console.log("Delete patient:", id);
        }
    };

    return (
        <div className="bg-linear-to-br from-background via-background to-accent/20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Patient Management
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Manage all patient records and information
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => fetchPatients()}
                                className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent/10 flex items-center gap-2 text-foreground transition-all duration-200 shadow-xs hover:shadow-sm"
                                disabled={loading}
                            >
                                <RefreshCw
                                    size={18}
                                    className={loading ? "animate-spin" : ""}
                                />
                                Refresh
                            </Button>
                            <AddPatientSheet onCreated={fetchPatients}>
                                <Button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-all duration-200 shadow-xs hover:shadow-sm">
                                    <UserPlus size={18} />
                                    Add Patient
                                </Button>
                            </AddPatientSheet>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Total Patients
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {patients.length}
                                    </p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <User className="text-primary" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Active Patients
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {
                                            patients.filter(
                                                (p) => p.status === "active"
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Pending
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {
                                            patients.filter(
                                                (p) => p.status === "suspended"
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                    <div className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Inactive
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {
                                            patients.filter(
                                                (p) => p.status === "inactive"
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="bg-card p-4 rounded-xl border shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                        size={20}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search patients by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="appearance-none pl-4 pr-10 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                        <option value="pending">Pending</option>
                                    </select>
                                    <Filter
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                                        size={18}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patients Table */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-muted-foreground">
                                Loading patients...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="bg-muted/50 border-b">
                                        <TableRow>
                                            <TableHead
                                                className="p-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/30 transition-colors duration-200"
                                                onClick={() =>
                                                    handleSort("full_name")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Patient
                                                    {sortConfig?.key ===
                                                        "full_name" && (
                                                        <span className="text-xs">
                                                            {sortConfig.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="p-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/30 transition-colors duration-200"
                                                onClick={() =>
                                                    handleSort("email")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Contact
                                                    {sortConfig?.key ===
                                                        "email" && (
                                                        <span className="text-xs">
                                                            {sortConfig.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="p-4 text-left text-sm font-semibold text-foreground">
                                                Status
                                            </TableHead>
                                            <TableHead
                                                className="p-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/30 transition-colors duration-200"
                                                onClick={() =>
                                                    handleSort("created_at")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Joined
                                                    {sortConfig?.key ===
                                                        "created_at" && (
                                                        <span className="text-xs">
                                                            {sortConfig.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="p-4 text-left text-sm font-semibold text-foreground">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentPatients.map((patient) => (
                                            <TableRow
                                                key={patient.id}
                                                className="border-b hover:bg-muted/10 transition-colors duration-200"
                                            >
                                                <TableCell className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            {patient.avatar_url ? (
                                                                <Image
                                                                    src={
                                                                        patient.avatar_url
                                                                    }
                                                                    width={40}
                                                                    height={40}
                                                                    alt="Avatar"
                                                                    className="rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                                                    <User
                                                                        className="text-primary"
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                                                                    patient.status ===
                                                                    "active"
                                                                        ? "bg-green-500"
                                                                        : patient.status ===
                                                                          "suspended"
                                                                        ? "bg-yellow-500"
                                                                        : "bg-gray-400"
                                                                }`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {patient.full_name ||
                                                                    "Unnamed Patient"}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                ID:{" "}
                                                                {patient.id.slice(
                                                                    0,
                                                                    8
                                                                )}
                                                                ...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Mail
                                                                size={14}
                                                                className="text-muted-foreground"
                                                            />
                                                            <span className="text-foreground">
                                                                {patient.email}
                                                            </span>
                                                        </div>
                                                        {patient.phone_number && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone
                                                                    size={14}
                                                                    className="text-muted-foreground"
                                                                />
                                                                <span className="text-muted-foreground">
                                                                    {
                                                                        patient.phone_number
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-4">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                            patient.status ||
                                                                "inactive"
                                                        )}`}
                                                    >
                                                        {patient.status?.toUpperCase() ||
                                                            "INACTIVE"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar
                                                            size={14}
                                                            className="text-muted-foreground"
                                                        />
                                                        <span className="text-muted-foreground">
                                                            {new Date(
                                                                patient.created_at
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <ViewPatientModal
                                                            patient={patient}
                                                        >
                                                            <Button
                                                                className="p-2 hover:bg-primary/10 rounded-lg transition-colors duration-200 group"
                                                                title="View Details"
                                                            >
                                                                <Eye
                                                                    size={18}
                                                                    className="text-muted-foreground group-hover:text-primary"
                                                                />
                                                            </Button>
                                                        </ViewPatientModal>
                                                        <EditPatientModal
                                                            patient={patient}
                                                            onSave={
                                                                handleUpdatePatient
                                                            }
                                                        >
                                                            <Button
                                                                className="p-2 hover:bg-green-500/10 rounded-lg transition-colors duration-200 group"
                                                                title="Edit"
                                                            >
                                                                <Edit
                                                                    size={18}
                                                                    className="text-muted-foreground group-hover:text-green-600"
                                                                />
                                                            </Button>
                                                        </EditPatientModal>
                                                        <Button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    patient.id
                                                                )
                                                            }
                                                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors duration-200 group"
                                                            title="Delete"
                                                        >
                                                            <Trash2
                                                                size={18}
                                                                className="text-muted-foreground group-hover:text-destructive"
                                                            />
                                                        </Button>
                                                        <div className="relative">
                                                            <Button className="p-2 hover:bg-muted/30 rounded-lg transition-colors duration-200">
                                                                <MoreVertical
                                                                    size={18}
                                                                    className="text-muted-foreground"
                                                                />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {currentPatients.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-muted/30">
                                        <User
                                            className="text-muted-foreground"
                                            size={48}
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        No patients found
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm || selectedStatus !== "all"
                                            ? "Try adjusting your search or filter criteria"
                                            : "No patients have been added yet"}
                                    </p>
                                    <Button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-xs hover:shadow-sm">
                                        Add Your First Patient
                                    </Button>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="border-t px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                                        Showing{" "}
                                        <span className="font-medium text-foreground">
                                            {indexOfFirstPatient + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium text-foreground">
                                            {Math.min(
                                                indexOfLastPatient,
                                                sortedPatients.length
                                            )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium text-foreground">
                                            {sortedPatients.length}
                                        </span>{" "}
                                        patients
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(prev - 1, 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-input bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/30 transition-colors duration-200"
                                        >
                                            <ChevronLeft size={20} />
                                        </Button>
                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1
                                        )
                                            .filter(
                                                (page) =>
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 &&
                                                        page <= currentPage + 1)
                                            )
                                            .map((page, idx, array) => (
                                                <React.Fragment key={page}>
                                                    {idx > 0 &&
                                                        array[idx - 1] !==
                                                            page - 1 && (
                                                            <span className="px-2 text-muted-foreground">
                                                                ...
                                                            </span>
                                                        )}
                                                    <Button
                                                        onClick={() =>
                                                            setCurrentPage(page)
                                                        }
                                                        className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                                                            currentPage === page
                                                                ? "bg-primary text-primary-foreground"
                                                                : "border border-input bg-background hover:bg-muted/30"
                                                        }`}
                                                    >
                                                        {page}
                                                    </Button>
                                                </React.Fragment>
                                            ))}
                                        <Button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        prev + 1,
                                                        totalPages
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="p-2 rounded-lg border border-input bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/30 transition-colors duration-200"
                                        >
                                            <ChevronRight size={20} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
