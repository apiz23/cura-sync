"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    AlertCircle,
    Calendar,
    CalendarClock,
    CalendarDays,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Clock4,
    FileText,
    Filter,
    Loader2,
    RefreshCw,
    Search,
    User,
    XCircle,
} from "lucide-react";

import { useAuth } from "@/components/authprovideradmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AppointmentSheet } from "./AppointmentSheet";
import { Appointment } from "@/app/types";
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

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export default function AppointmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkingInId, setCheckingInId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<Appointment | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    const openAppointmentSheet = useCallback((appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setSheetOpen(true);
    }, []);

    const fetchAppointments = useCallback(async () => {
        if (!user?.facility_id) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/appointments/by-facility?facilityId=${user.facility_id}`,
                { cache: "no-store" }
            );

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || "Failed to load appointments");
            }

            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            const message =
                err instanceof Error ? err.message : "Failed to load appointments";
            setError(message);
            toast.error(message);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [user?.facility_id]);

    useEffect(() => {
        if (!authLoading && user?.facility_id) {
            fetchAppointments();
        }
    }, [authLoading, user?.facility_id, fetchAppointments]);

    useEffect(() => {
        if (authLoading || !user?.role) return;

        const role = String(user.role ?? "").toLowerCase();
        if (role === "doctor" && pathname === "/admin/appointments") {
            router.replace("/admin/consultations");
        }
        if (role !== "doctor" && pathname === "/admin/consultations") {
            router.replace("/admin/appointments");
        }
    }, [authLoading, pathname, router, user?.role]);

    const role = String(user?.role ?? "").toLowerCase();
    const isDoctor = role === "doctor";

    const todayIso = new Date().toISOString().slice(0, 10);

    const canQuickCheckIn = role === "staff" || role === "admin";

    async function handleQuickCheckIn(appointment: Appointment) {
        if (!canQuickCheckIn) return;
        if (appointment.status !== "CONFIRMED") return;

        setCheckingInId(appointment.id);
        try {
            const response = await fetch(`/api/appointments/${appointment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CHECKED_IN" }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error || "Unable to check-in appointment");
            }

            setAppointments((prev) =>
                prev.map((appt) =>
                    appt.id === appointment.id
                        ? ({
                              ...appt,
                              ...(payload && typeof payload === "object" ? payload : {}),
                              status: payload?.status ?? "CHECKED_IN",
                          } as Appointment)
                        : appt
                )
            );

            toast.success("Patient checked in");
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Check-in failed");
        } finally {
            setCheckingInId(null);
        }
    }

    useEffect(() => {
        // Default doctor view to today's date (queue-style workflow).
        if (authLoading || !isDoctor) return;
        if (!dateFilter) setDateFilter(todayIso);
    }, [authLoading, dateFilter, isDoctor, todayIso]);

    const todaysQueue = useMemo(() => {
        if (!isDoctor) return [];
        return [...appointments]
            .filter(
                (a) =>
                    a.appointment_date === todayIso &&
                    (a.status === "CHECKED_IN" || a.status === "CONFIRMED")
            )
            .sort((a, b) => {
                if (a.status !== b.status) {
                    // Checked-in patients should appear first.
                    if (a.status === "CHECKED_IN") return -1;
                    if (b.status === "CHECKED_IN") return 1;
                }
                return a.start_time.localeCompare(b.start_time);
            });
    }, [appointments, isDoctor, todayIso]);

    const filteredAppointments = useMemo(() => {
        let filtered = appointments;

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (appointment) =>
                    appointment.patient_name.toLowerCase().includes(query) ||
                    appointment.reason_for_visit?.toLowerCase().includes(query) ||
                    appointment.id.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (appointment) => appointment.status === statusFilter
            );
        }

        if (dateFilter) {
            filtered = filtered.filter(
                (appointment) => appointment.appointment_date === dateFilter
            );
        }

        return filtered;
    }, [appointments, searchTerm, statusFilter, dateFilter]);

    const sortedAppointments = useMemo(
        () =>
            [...filteredAppointments].sort((a, b) => {
                const dateCompare = b.appointment_date.localeCompare(
                    a.appointment_date
                );
                if (dateCompare !== 0) return dateCompare;
                return a.start_time.localeCompare(b.start_time);
            }),
        [filteredAppointments]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, dateFilter, itemsPerPage]);

    const totalPages = Math.max(
        1,
        Math.ceil(sortedAppointments.length / itemsPerPage)
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAppointments = sortedAppointments.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });

    const getFullDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });

    const formatTime = (time: string) => {
        const [hours = "00", minutes = "00"] = time.split(":");
        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    };

    const getStatusConfig = (status: Appointment["status"]) => {
        switch (status) {
            case "CONFIRMED":
                return {
                    icon: CheckCircle,
                    className:
                        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    dotClassName: "bg-emerald-500",
                    label: "Confirmed",
                };
            case "CHECKED_IN":
                return {
                    icon: CalendarClock,
                    className:
                        "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                    dotClassName: "bg-sky-500",
                    label: "Checked in",
                };
            case "CANCELLED":
                return {
                    icon: XCircle,
                    className: "bg-destructive/10 text-destructive border-destructive/30",
                    dotClassName: "bg-destructive/100",
                    label: "Cancelled",
                };
            case "PENDING":
                return {
                    icon: Clock4,
                    className:
                        "border-amber-500/35 bg-amber-500/15 text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-300",
                    dotClassName: "bg-amber-500 dark:bg-amber-300",
                    label: "Pending",
                };
            case "COMPLETED":
                return {
                    icon: CheckCircle,
                    className:
                        "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
                    dotClassName: "bg-violet-500",
                    label: "Completed",
                };
            default:
                return {
                    icon: AlertCircle,
                    className:
                        "border-border bg-muted text-muted-foreground",
                    dotClassName: "bg-muted-foreground",
                    label: status,
                };
        }
    };

    const columns: ColumnDef<Appointment>[] = [
        {
            id: "index",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="No" className="text-center" />
            ),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {row.index + 1 + startIndex}
                </div>
            ),
        },
        {
            accessorKey: "patient_name",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Patient" />
            ),
            cell: ({ row }) => (
                <button
                    type="button"
                    className="flex items-center gap-3 text-left"
                    onClick={(event) => {
                        event.stopPropagation();
                        openAppointmentSheet(row.original);
                    }}
                >
                    <Avatar className="size-10 border border-border">
                        <AvatarImage
                            src={row.original.patient_avatar ?? undefined}
                            alt={row.original.patient_name}
                        />
                        <AvatarFallback>
                            <User className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-foreground">
                            {row.original.patient_name}
                        </div>
                        <div className="text-base text-muted-foreground">
                            ID: {row.original.id.slice(0, 8)}...
                        </div>
                    </div>
                </button>
            ),
        },
        {
            id: "datetime",
            accessorFn: (appointment) =>
                `${appointment.appointment_date}T${appointment.start_time ?? "00:00"}`,
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Date & Time" />
            ),
            cell: ({ row }) => (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-base font-medium text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(row.original.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-base text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatTime(row.original.start_time)}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "reason_for_visit",
            enableSorting: false,
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Reason" />
            ),
            cell: ({ row }) => (
                <div className="flex max-w-xs items-start gap-2 text-base text-foreground">
                    <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="line-clamp-2">
                        {row.original.reason_for_visit || "No reason provided"}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const status = getStatusConfig(row.original.status);
                const StatusIcon = status.icon;

                return (
                    <Badge
                        variant="outline"
                        className={`gap-2 rounded-lg px-3 py-1.5 text-base font-medium ${status.className}`}
                    >
                        <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                if (!canQuickCheckIn) {
                    return <div className="text-right text-base text-muted-foreground">-</div>;
                }

                const appt = row.original;
                const disabled = appt.status !== "CONFIRMED" || checkingInId === appt.id;

                return (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full px-3 text-base"
                            disabled={disabled}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleQuickCheckIn(appt);
                            }}
                        >
                            {checkingInId === appt.id ? "Checking in..." : "Check-in"}
                        </Button>
                    </div>
                );
            },
        },
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
                            openAppointmentSheet(row.original);
                        }}
                    >
                        View details
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[500px] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-base text-muted-foreground">Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {isDoctor ? "Consultations" : "Appointments"}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {isDoctor
                                ? "See today's queue and complete consultations after check-in"
                                : "Manage and track patient appointments"}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchAppointments}
                        className="gap-2 border-border hover:bg-accent"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {error ? (
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardContent className="flex items-center justify-between gap-4 p-4">
                            <div>
                                <p className="font-medium text-foreground">
                                    Appointment data unavailable
                                </p>
                                <p className="text-base text-muted-foreground">{error}</p>
                            </div>
                            <Button variant="outline" onClick={fetchAppointments}>
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                ) : null}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        {
                            label: "Total Appointments",
                            value: appointments.length,
                            icon: CalendarDays,
                            className: "bg-primary/10 text-primary border-primary/20",
                            helper: "All records",
                        },
                        {
                            label: "Checked in",
                            value: appointments.filter((a) => a.status === "CHECKED_IN").length,
                            icon: CalendarClock,
                            className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                            helper: "Arrived",
                        },
                        {
                            label: "Confirmed",
                            value: appointments.filter((a) => a.status === "CONFIRMED").length,
                            icon: CheckCircle,
                            className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                            helper: "Scheduled",
                        },
                        {
                            label: "Pending",
                            value: appointments.filter((a) => a.status === "PENDING").length,
                            icon: Clock4,
                            className: "border-amber-500/35 bg-amber-500/15 text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-300",
                            helper: "Needs review",
                        },
                    ].map((item) => (
                        <Card key={item.label} className="border-border bg-card">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="mb-1 text-base text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {item.value}
                                        </p>
                                        <p className="mt-1 text-base text-muted-foreground">
                                            {item.helper}
                                        </p>
                                    </div>
                                    <div className={`rounded-full border p-3 ${item.className}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {isDoctor ? (
                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-base font-semibold text-foreground">
                                    Today's queue
                                </p>
                                <p className="mt-1 text-base text-muted-foreground">
                                    Staff check-in patients. Doctors can complete only after check-in.
                                </p>
                            </div>
                            <Badge variant="outline">
                                {todaysQueue.length} item{todaysQueue.length === 1 ? "" : "s"}
                            </Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                            {todaysQueue.length ? (
                                todaysQueue.slice(0, 6).map((appt) => (
                                    <button
                                        key={appt.id}
                                        type="button"
                                        onClick={() => openAppointmentSheet(appt)}
                                        className="flex w-full items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/40 p-3 text-left transition-colors hover:bg-muted/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-base font-medium text-foreground">
                                                {appt.patient_name}
                                            </p>
                                            <p className="truncate text-base text-muted-foreground">
                                                {formatTime(appt.start_time)} · {appt.reason_for_visit || "No reason"}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{appt.status}</Badge>
                                    </button>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed p-4 text-base text-muted-foreground">
                                    No confirmed or checked-in appointments today.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <Card className="border-border bg-card shadow-xs">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search patients, reasons, or appointment IDs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-10 border-border bg-input pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="min-w-[160px]">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10 border-border bg-input">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                        <SelectItem value="CHECKED_IN">Checked in</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="min-w-[160px]">
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="h-10 border-border bg-input"
                                />
                            </div>
                            {(searchTerm || statusFilter !== "all" || dateFilter) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setDateFilter("");
                                    }}
                                    className="h-10"
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-border bg-card shadow-sm pt-0">
                <CardHeader className="border-b border-border bg-sidebar pt-6 px-5 pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-foreground">Appointments</CardTitle>
                            <CardDescription>
                                {filteredAppointments.length} appointments found
                                {searchTerm && ` for "${searchTerm}"`}
                                {statusFilter !== "all" && ` | Status: ${statusFilter}`}
                                {dateFilter && ` | Date: ${getFullDate(dateFilter)}`}
                            </CardDescription>
                            <p className="mt-2 text-base text-muted-foreground">
                                Click any row or the View details pill to open the
                                appointment sheet.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-base">
                            <span className="text-muted-foreground">Show:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => setItemsPerPage(Number(value))}
                            >
                                <SelectTrigger className="h-8 w-20 border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {currentAppointments.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center px-6 pb-12 text-center">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <Calendar className="h-12 w-12 text-muted-foreground/60" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-foreground">
                                No appointments found
                            </h3>
                            <p className="max-w-md text-base text-muted-foreground">
                                {searchTerm || statusFilter !== "all" || dateFilter
                                    ? "No appointments match your filters. Try adjusting your search criteria."
                                    : "This facility does not have appointments recorded yet."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <TableProvider columns={columns} data={currentAppointments}>
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
                                                    openAppointmentSheet(
                                                        row.original as Appointment
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
                            </div>

                            {filteredAppointments.length > itemsPerPage && (
                                <div className="border-t border-border bg-sidebar px-5 py-4">
                                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                        <div className="text-base text-muted-foreground">
                                            Showing{" "}
                                            <span className="font-medium text-foreground">
                                                {startIndex + 1}
                                            </span>{" "}
                                            to{" "}
                                                    <span className="font-medium text-foreground">
                                                        {Math.min(
                                                            startIndex + itemsPerPage,
                                                    sortedAppointments.length
                                                )}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium text-foreground">
                                                {sortedAppointments.length}
                                            </span>{" "}
                                            results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage((page) => Math.max(page - 1, 1))
                                                }
                                                disabled={currentPage === 1}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="min-w-[90px] text-center text-base text-muted-foreground">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage((page) =>
                                                        Math.min(page + 1, totalPages)
                                                    )
                                                }
                                                disabled={currentPage === totalPages}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <AppointmentSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                appointment={selectedAppointment}
                onUpdated={(updated) => {
                    setAppointments((prev) =>
                        prev.map((appointment) =>
                            appointment.id === updated.id ? updated : appointment
                        )
                    );
                }}
            />
        </div>
    );
}
