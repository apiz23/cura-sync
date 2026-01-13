"use client";

import { useCallback, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import {
    Calendar,
    Clock,
    User,
    Search,
    CheckCircle,
    XCircle,
    Clock4,
    Eye,
    CalendarDays,
    Building2,
    Loader2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AppointmentSheet } from "./AppointmentSheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Appointment } from "@/app/types";
import { useAuth } from "@/components/authprovideradmin";
import Image from "next/image";
import PageTitle from "@/components/page-title";

type AppointmentRow = {
    id: string;
    profile_id: string | null;
    facility_id: string | null;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    patient_avatar?: string | null;
    reason_for_visit: string | null;
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<
        Appointment[]
    >([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<Appointment | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { staff, loading: authLoading } = useAuth();

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);

            if (!staff?.facility_id) {
                toast.error("No facility linked to this staff account");
                return;
            }

            const { data, error } = await supabase
                .from("cura_appointments")
                .select(
                    `
                    id,
                    profile_id,
                    facility_id,
                    appointment_date,
                    start_time,
                    end_time,
                    status,
                    reason_for_visit
                `
                )
                .eq("facility_id", staff.facility_id)
                .order("appointment_date", { ascending: false })
                .order("start_time", { ascending: true });

            if (error) throw error;

            const rows = (data ?? []) as AppointmentRow[];

            const mapped: Appointment[] = await Promise.all(
                rows.map(async (appt) => {
                    let patientName = "Unknown Patient";
                    let avatarUrl: string | null = null;

                    if (appt.profile_id) {
                        try {
                            const res = await fetch(
                                `/api/user/profile/${appt.profile_id}`
                            );

                            if (res.ok) {
                                const profile = await res.json();
                                patientName = profile.full_name ?? patientName;
                                avatarUrl = profile.avatar_url;
                            }
                        } catch {}
                    }

                    return {
                        id: appt.id,
                        profile_id: appt.profile_id,
                        facility_id: appt.facility_id,
                        appointment_date: appt.appointment_date,
                        start_time: appt.start_time,
                        end_time: appt.end_time,
                        status: appt.status,
                        reason_for_visit: appt.reason_for_visit,
                        patient_name: patientName,
                        patient_avatar: avatarUrl,
                        facility_name: "Current Facility",
                    };
                })
            );

            setAppointments(mapped);
            setFilteredAppointments(mapped);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    }, [staff]);

    useEffect(() => {
        if (!authLoading && staff) {
            fetchAppointments();
        }
    }, [authLoading, staff, fetchAppointments]);

    useEffect(() => {
        let filtered = appointments;

        if (searchTerm) {
            filtered = filtered.filter(
                (a) =>
                    a.patient_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    a.reason_for_visit
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    a.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((a) => a.status === statusFilter);
        }

        if (dateFilter) {
            filtered = filtered.filter(
                (a) => a.appointment_date === dateFilter
            );
        }

        setFilteredAppointments(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, dateFilter, appointments]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusIcon = (status: Appointment["status"]) => {
        switch (status) {
            case "CONFIRMED":
                return <CheckCircle className="w-3 h-3" />;
            case "CANCELLED":
                return <XCircle className="w-3 h-3" />;
            case "PENDING":
                return <Clock4 className="w-3 h-3" />;
            case "COMPLETED":
                return <CheckCircle className="w-3 h-3" />;
        }
    };

    const getStatusColor = (status: Appointment["status"]) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-500/10 text-green-600 border-green-200";
            case "CANCELLED":
                return "bg-red-500/10 text-red-600 border-red-200";
            case "PENDING":
                return "bg-amber-500/10 text-amber-600 border-amber-200";
            case "COMPLETED":
                return "bg-blue-500/10 text-blue-600 border-blue-200";
        }
    };

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAppointments = filteredAppointments.slice(
        startIndex,
        endIndex
    );

    if (loading) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    Loading appointments...
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <PageTitle title={"Apppointment"} />
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total",
                        value: appointments.length,
                        icon: CalendarDays,
                        color: "bg-primary/10 text-primary",
                    },
                    {
                        label: "Confirmed",
                        value: appointments.filter(
                            (a) => a.status === "CONFIRMED"
                        ).length,
                        icon: CheckCircle,
                        color: "bg-green-500/10 text-green-500",
                    },
                    {
                        label: "Pending",
                        value: appointments.filter(
                            (a) => a.status === "PENDING"
                        ).length,
                        icon: Clock4,
                        color: "bg-amber-500/10 text-amber-500",
                    },
                    {
                        label: "Cancelled",
                        value: appointments.filter(
                            (a) => a.status === "CANCELLED"
                        ).length,
                        icon: XCircle,
                        color: "bg-red-500/10 text-red-500",
                    },
                ].map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search appointments..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="PENDING">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="CONFIRMED">
                                        Confirmed
                                    </SelectItem>
                                    <SelectItem value="COMPLETED">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="CANCELLED">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Appointment List</CardTitle>
                            <CardDescription>
                                Showing {startIndex + 1}-
                                {Math.min(
                                    endIndex,
                                    filteredAppointments.length
                                )}{" "}
                                of {filteredAppointments.length} appointments
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Rows per page:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={() => {}}
                            >
                                <SelectTrigger className="w-20 h-8">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">
                                        Patient
                                    </TableHead>
                                    <TableHead className="w-[150px]">
                                        Date
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        Time
                                    </TableHead>
                                    <TableHead className="w-[200px]">
                                        Facility
                                    </TableHead>
                                    <TableHead className="w-[100px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right w-[100px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentAppointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium">
                                                    No appointments found
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Try adjusting your filters
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentAppointments.map((appt) => (
                                        <TableRow
                                            key={appt.id}
                                            className="group"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                                        {appt.patient_avatar ? (
                                                            <Image
                                                                src={
                                                                    appt.patient_avatar
                                                                }
                                                                alt={
                                                                    appt.patient_name
                                                                }
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    <p className="font-medium text-foreground">
                                                        {appt.patient_name}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                        {formatDate(
                                                            appt.appointment_date
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                        {formatTime(
                                                            appt.start_time
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {appt.facility_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`gap-1.5 px-2.5 py-1 ${getStatusColor(
                                                        appt.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(appt.status)}
                                                    {appt.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        appt.status
                                                            .slice(1)
                                                            .toLowerCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            setSelectedAppointment(
                                                                appt
                                                            );
                                                            setSheetOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600">
                                                                Cancel
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                Reschedule
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                Send Reminder
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {filteredAppointments.length > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    currentPage === pageNum
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() =>
                                                    setCurrentPage(pageNum)
                                                }
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    }
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sheet */}
            <AppointmentSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                appointment={selectedAppointment}
                onUpdated={(updated) => {
                    setAppointments((prev) =>
                        prev.map((a) => (a.id === updated.id ? updated : a))
                    );
                    setFilteredAppointments((prev) =>
                        prev.map((a) => (a.id === updated.id ? updated : a))
                    );
                }}
            />
        </div>
    );
}
