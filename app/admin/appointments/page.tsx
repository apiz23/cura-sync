"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    User,
    Search,
    CheckCircle,
    XCircle,
    Clock4,
    Loader2,
    Filter,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    AlertCircle,
    RefreshCw,
    FileText,
    ChevronRightIcon,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Appointment } from "@/app/types";
import { useAuth } from "@/components/authprovideradmin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

    const { user, loading: authLoading } = useAuth();

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);

            if (!user?.facility_id) return;

            const res = await fetch(
                `/api/appointments/by-facility?facilityId=${user.facility_id}`
            );

            if (!res.ok) throw new Error("Failed to fetch");

            const data: Appointment[] = await res.json();
            console.log(data);
            setAppointments(data);
            setFilteredAppointments(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchAppointments();
        }
    }, [authLoading, user, fetchAppointments]);

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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const getFullDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const displayHour = hour % 12 || 12;
        const formattedMinutes = minutes.padStart(2, "0");
        return `${displayHour}:${formattedMinutes} ${hour >= 12 ? "PM" : "AM"}`;
    };

    const getStatusConfig = (status: Appointment["status"]) => {
        switch (status) {
            case "CONFIRMED":
                return {
                    icon: CheckCircle,
                    bgColor: "bg-green-50",
                    textColor: "text-green-700",
                    borderColor: "border-green-200",
                    dotColor: "bg-green-500",
                    label: "Confirmed",
                };
            case "CANCELLED":
                return {
                    icon: XCircle,
                    bgColor: "bg-red-50",
                    textColor: "text-red-700",
                    borderColor: "border-red-200",
                    dotColor: "bg-red-500",
                    label: "Cancelled",
                };
            case "PENDING":
                return {
                    icon: Clock4,
                    bgColor: "bg-amber-50",
                    textColor: "text-amber-700",
                    borderColor: "border-amber-200",
                    dotColor: "bg-amber-500",
                    label: "Pending",
                };
            case "COMPLETED":
                return {
                    icon: CheckCircle,
                    bgColor: "bg-blue-50",
                    textColor: "text-blue-700",
                    borderColor: "border-blue-200",
                    dotColor: "bg-blue-500",
                    label: "Completed",
                };
        }
    };

    const getPriority = (appt: Appointment) => {
        const today = new Date().toISOString().split("T")[0];
        const isToday = appt.appointment_date === today;
        const isUpcoming = appt.appointment_date > today;
        const isOverdue =
            appt.appointment_date < today && appt.status === "PENDING";

        if (isOverdue) return "high";
        if (isToday) return "medium";
        if (isUpcoming) return "low";
        return "normal";
    };

    const columns: ColumnDef<Appointment>[] = [
        {
            id: "index",
            header: ({ column }) => (
                <TableColumnHeader
                    column={column}
                    title="No"
                    className="text-center"
                />
            ),
            cell: ({ row }) => {
                const index = row.index + 1 + (currentPage - 1) * itemsPerPage;
                return <div className="text-center font-medium">{index}</div>;
            },
        },
        {
            accessorKey: "patient_name",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Patient" />
            ),
            cell: ({ row }) => {
                const priority = getPriority(row.original);
                const statusConfig = getStatusConfig(row.original.status);

                return (
                    <div
                        className="flex items-center gap-3 cursor-pointer group/patient"
                        onClick={() => {
                            setSelectedAppointment(row.original);
                            setSheetOpen(true);
                        }}
                    >
                        <div className="relative">
                            <Avatar className="size-11 border border-border bg-gradient-to-br from-primary/20 to-primary/10">
                                {row.original.patient_avatar ? (
                                    <>
                                        <AvatarImage
                                            src={row.original.patient_avatar}
                                            alt={row.original.patient_name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback>
                                            <User className="w-5 h-5 text-primary" />
                                        </AvatarFallback>
                                    </>
                                ) : (
                                    <AvatarFallback>
                                        <User className="w-5 h-5 text-primary" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div
                                className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full ring-2 ring-background flex items-center justify-center"
                                style={{
                                    backgroundColor: statusConfig.dotColor,
                                }}
                            >
                                {priority === "high" && (
                                    <AlertCircle className="w-2 h-2 text-white" />
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="font-medium text-foreground group-hover/patient:text-primary transition-colors">
                                {row.original.patient_name}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <span className="font-mono">
                                    ID: {row.original.id.slice(0, 8)}...
                                </span>
                                <ChevronRightIcon size={10} />
                                <span>Priority: {priority}</span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "datetime",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Date & Time" />
            ),
            cell: ({ row }) => (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                            {formatDate(row.original.appointment_date)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {formatTime(row.original.start_time)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "reason_for_visit",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Reason" />
            ),
            cell: ({ row }) => (
                <div className="flex items-start gap-2 max-w-xs">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground line-clamp-2">
                        {row.original.reason_for_visit || "No reason provided"}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const statusConfig = getStatusConfig(row.original.status);
                const StatusIcon = statusConfig.icon;
                const priority = getPriority(row.original);

                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`gap-2 px-3 py-1.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} rounded-lg`}
                        >
                            <div
                                className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}
                            />
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusConfig.label}</span>
                        </Badge>
                        {priority === "high" && (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                    </div>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    Loading appointments...
                </p>
            </div>
        );
    }

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAppointments = filteredAppointments.slice(
        startIndex,
        endIndex
    );

    return (
        <div className="space-y-6 p-4 md:p-6 font-sans">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground serif">
                            Appointments
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and track patient appointments
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAppointments()}
                            className="gap-2 border-border hover:bg-accent"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        {
                            label: "Total Appointments",
                            value: appointments.length,
                            icon: CalendarDays,
                            color: "bg-primary/10 text-primary border-primary/20",
                            trend: "All time",
                        },
                        {
                            label: "Confirmed",
                            value: appointments.filter(
                                (a) => a.status === "CONFIRMED"
                            ).length,
                            icon: CheckCircle,
                            color: "bg-green-50 text-green-700 border-green-200",
                            trend: "Active",
                        },
                        {
                            label: "Pending",
                            value: appointments.filter(
                                (a) => a.status === "PENDING"
                            ).length,
                            icon: Clock4,
                            color: "bg-amber-50 text-amber-700 border-amber-200",
                            trend: "Needs attention",
                        },
                        {
                            label: "Cancelled",
                            value: appointments.filter(
                                (a) => a.status === "CANCELLED"
                            ).length,
                            icon: XCircle,
                            color: "bg-red-50 text-red-700 border-red-200",
                            trend: "This month",
                        },
                    ].map((stat) => (
                        <Card
                            key={stat.label}
                            className="border-border bg-card hover:shadow-sm transition-shadow"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stat.trend}
                                        </p>
                                    </div>
                                    <div
                                        className={`p-3 rounded-full ${stat.color}`}
                                    >
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Filters Card */}
            <Card className="border-border bg-card shadow-xs">
                <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search patients, reasons, or appointment IDs..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-9 h-10 border-border bg-input focus:border-ring"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="min-w-[160px]">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="h-10 border-border bg-input">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="border-border bg-popover">
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
                            <div className="min-w-[160px]">
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) =>
                                        setDateFilter(e.target.value)
                                    }
                                    placeholder="Select date"
                                    className="h-10 border-border bg-input"
                                />
                            </div>
                            {(searchTerm ||
                                statusFilter !== "all" ||
                                dateFilter) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setDateFilter("");
                                    }}
                                    className="h-10 hover:bg-accent"
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Appointments Table */}
            <Card className="border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border bg-sidebar">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-foreground">
                                Appointments
                            </CardTitle>
                            <CardDescription>
                                {filteredAppointments.length} appointments found
                                {searchTerm && ` for "${searchTerm}"`}
                                {statusFilter !== "all" &&
                                    ` • Status: ${statusFilter}`}
                                {dateFilter &&
                                    ` • Date: ${getFullDate(dateFilter)}`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">Show:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={() => {}}
                            >
                                <SelectTrigger className="w-20 h-8 border-border">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent className="border-border">
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {currentAppointments.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center py-12">
                            <div className="p-4 bg-muted rounded-full mb-4">
                                <Calendar className="w-12 h-12 text-muted-foreground/60" />
                            </div>
                            <h3 className="font-medium text-foreground text-lg mb-2">
                                No appointments found
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                {searchTerm ||
                                statusFilter !== "all" ||
                                dateFilter
                                    ? "No appointments match your filters. Try adjusting your search criteria."
                                    : "You don't have any appointments scheduled yet."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <TableProvider
                                    columns={columns}
                                    data={currentAppointments}
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
                            </div>

                            {/* Pagination */}
                            {filteredAppointments.length > itemsPerPage && (
                                <div className="border-t border-border px-5 py-4 bg-sidebar">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing{" "}
                                            <span className="font-medium text-foreground">
                                                {startIndex + 1}
                                            </span>{" "}
                                            to{" "}
                                            <span className="font-medium text-foreground">
                                                {Math.min(
                                                    endIndex,
                                                    filteredAppointments.length
                                                )}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium text-foreground">
                                                {filteredAppointments.length}
                                            </span>{" "}
                                            results
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
                                                className="h-8 w-8 p-0 border-border hover:bg-accent"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from(
                                                    {
                                                        length: Math.min(
                                                            5,
                                                            totalPages
                                                        ),
                                                    },
                                                    (_, i) => {
                                                        let pageNum;
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (
                                                            currentPage <= 3
                                                        ) {
                                                            pageNum = i + 1;
                                                        } else if (
                                                            currentPage >=
                                                            totalPages - 2
                                                        ) {
                                                            pageNum =
                                                                totalPages -
                                                                4 +
                                                                i;
                                                        } else {
                                                            pageNum =
                                                                currentPage -
                                                                2 +
                                                                i;
                                                        }

                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={
                                                                    currentPage ===
                                                                    pageNum
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                size="sm"
                                                                className={`h-8 w-8 p-0 font-medium ${
                                                                    currentPage ===
                                                                    pageNum
                                                                        ? "bg-primary text-primary-foreground border-primary"
                                                                        : "border-border hover:bg-accent"
                                                                }`}
                                                                onClick={() =>
                                                                    setCurrentPage(
                                                                        pageNum
                                                                    )
                                                                }
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
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
                                                className="h-8 w-8 p-0 border-border hover:bg-accent"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Appointment Details Sheet */}
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
