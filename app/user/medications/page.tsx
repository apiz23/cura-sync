"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Pill,
    Clock,
    Calendar,
    AlertCircle,
    Filter,
    Eye,
    Edit,
    MoreHorizontal,
    CheckCircle,
    ChevronRightIcon,
} from "lucide-react";
import { Medication } from "@/app/types";
import AddMedicationDialog from "./add-medication-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditMedicationSheet from "./edit-medication-sheet";
import MedicationDetailsSheet from "./medication-details-sheet";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export default function MedicationPage() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedMedication, setSelectedMedication] =
        useState<Medication | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { user, isLoaded } = useUser();

    async function fetchMedications(profileId: string) {
        try {
            const res = await fetch(
                `/api/medications?profile_id=${profileId}`,
                { cache: "no-store" }
            );

            const data = await res.json();

            if (!Array.isArray(data)) {
                console.error("Expected array, got:", data);
                setMedications([]);
                return;
            }

            setMedications(data);
        } catch (error) {
            console.error("Failed to fetch medications:", error);
            setMedications([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!isLoaded || !user) return;
        fetchMedications(user.id);
    }, [isLoaded, user]);

    const meds = Array.isArray(medications) ? medications : [];

    const filteredMeds = meds.filter((med) => {
        if (filterStatus === "all") return true;
        if (filterStatus === "active") return med.status === "ACTIVE";
        if (filterStatus === "completed") return med.status === "COMPLETED";
        if (filterStatus === "stopped") return med.status === "STOPPED";
        if (filterStatus === "expired") {
            if (!med.end_date) return false;
            return new Date(med.end_date) < new Date();
        }
        return true;
    });

    const today = new Date();
    const todayMeds = meds.filter((med) => {
        const startDate = new Date(med.start_date);
        const endDate = med.end_date ? new Date(med.end_date) : null;
        return startDate <= today && (!endDate || endDate >= today);
    });

    const activeMeds = meds.filter((med) => med.status === "ACTIVE");

    const expiredMeds = meds.filter((med) => {
        if (!med.end_date) return false;
        const endDate = new Date(med.end_date);
        return endDate < today;
    });

    const getStatusConfig = (status: string) => {
        const configs = {
            COMPLETED: {
                color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                icon: <CheckCircle className="h-3.5 w-3.5" />,
                label: "Completed",
                dotColor: "bg-emerald-500",
            },
            ACTIVE: {
                color: "bg-blue-500/10 text-blue-700 border-blue-200",
                icon: <Clock className="h-3.5 w-3.5" />,
                label: "Active",
                dotColor: "bg-blue-500",
            },
            STOPPED: {
                color: "bg-amber-500/10 text-amber-700 border-amber-200",
                icon: <AlertCircle className="h-3.5 w-3.5" />,
                label: "Stopped",
                dotColor: "bg-amber-500",
            },
            default: {
                color: "bg-gray-500/10 text-gray-700 border-gray-200",
                icon: <Pill className="h-3.5 w-3.5" />,
                label: "Unknown",
                dotColor: "bg-gray-500",
            },
        };

        return configs[status as keyof typeof configs] || configs.default;
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    async function markAsTaken(medicationId: string) {
        try {
            const res = await fetch(`/api/medications/${medicationId}/logs`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Failed to log intake");

            fetchMedications(user!.id);
        } catch (error) {
            console.error("Failed to mark as taken:", error);
        }
    }

    async function markAsStopped(medicationId: string) {
        try {
            await fetch(`/api/medications/${medicationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "STOPPED" }),
            });
            fetchMedications(user!.id);
        } catch (error) {
            console.error("Failed to mark as stopped:", error);
        }
    }

    // Define columns for the table
    const columns: ColumnDef<Medication>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Medication" />
            ),
            cell: ({ row }) => {
                const statusConfig = getStatusConfig(row.original.status);
                return (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="size-8">
                                <AvatarFallback className={statusConfig.color}>
                                    <Pill className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className="absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background"
                                style={{
                                    backgroundColor: statusConfig.dotColor,
                                }}
                            />
                        </div>
                        <div>
                            <div className="font-semibold text-sm">
                                {row.original.name}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <span>{row.original.dosage}</span>
                                <ChevronRightIcon size={12} />
                                <span>{row.original.frequency}</span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "schedule",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Schedule" />
            ),
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium text-sm">
                        {row.original.frequency}
                    </div>
                    {row.original.schedule && (
                        <div className="text-xs text-muted-foreground">
                            {row.original.schedule}
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: "dates",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Dates" />
            ),
            cell: ({ row }) => {
                const isExpired = row.original.end_date
                    ? new Date(row.original.end_date) < new Date()
                    : false;

                return (
                    <div className="space-y-1">
                        <div className="text-sm">
                            <span className="text-muted-foreground">
                                Start:{" "}
                            </span>
                            {formatShortDate(row.original.start_date)}
                        </div>
                        {row.original.end_date && (
                            <div
                                className={`text-xs ${
                                    isExpired
                                        ? "text-amber-600 font-medium"
                                        : "text-muted-foreground"
                                }`}
                            >
                                <span className="text-muted-foreground">
                                    End:{" "}
                                </span>
                                {formatShortDate(row.original.end_date)}
                                {isExpired && " (Expired)"}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const statusConfig = getStatusConfig(row.original.status);
                const isActive = row.original.status === "ACTIVE";

                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            className={`flex items-center gap-1.5 px-2.5 py-1 border ${statusConfig.color} text-xs font-normal`}
                            variant="outline"
                        >
                            <div
                                className={`h-2 w-2 rounded-full ${statusConfig.dotColor}`}
                            />
                            {statusConfig.label}
                        </Badge>
                        {isActive && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                                onClick={() => markAsTaken(row.original.id)}
                            >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span className="text-xs">Take</span>
                            </Button>
                        )}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Actions" />
            ),
            cell: ({ row }) => {
                const isActive = row.original.status === "ACTIVE";

                return (
                    <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => {
                                        setSelectedMedication(row.original);
                                        setDetailsOpen(true);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => {
                                        setSelectedMedication(row.original);
                                        setEditOpen(true);
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Medication
                                </DropdownMenuItem>
                                {isActive && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-amber-700"
                                            onClick={() =>
                                                markAsStopped(row.original.id)
                                            }
                                        >
                                            <AlertCircle className="h-4 w-4" />
                                            Stop Medication
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>

                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                                <Pill className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    Medication Manager
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Track, manage, and stay compliant with your
                                    medications
                                </p>
                            </div>
                        </div>
                    </div>

                    <AddMedicationDialog
                        onSuccess={() => fetchMedications(user!.id)}
                    >
                        <Button
                            size="lg"
                            className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                        >
                            <Plus className="h-5 w-5" />
                            Add Medication
                        </Button>
                    </AddMedicationDialog>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Medications
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {meds.length}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Pill className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Active
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {activeMeds.length}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-blue-500/10">
                                    <Clock className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">
                                {todayMeds.length} due today
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Completed
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {
                                            meds.filter(
                                                (m) => m.status === "COMPLETED"
                                            ).length
                                        }
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-emerald-500/10">
                                    <Calendar className="h-6 w-6 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-500/10 hover:border-amber-500/20 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Needs Review
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {expiredMeds.length}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-amber-500/10">
                                    <AlertCircle className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                            {expiredMeds.length > 0 && (
                                <div className="mt-3 text-xs font-medium text-amber-600">
                                    {expiredMeds.length} expired
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Medications Table */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Your Medications
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filteredMeds.length} of {meds.length}{" "}
                                medications shown
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select
                                    value={filterStatus}
                                    onValueChange={setFilterStatus}
                                >
                                    <SelectTrigger className="w-[180px] bg-transparent text-sm">
                                        <SelectValue placeholder="All Medications" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Medications
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="stopped">
                                            Stopped
                                        </SelectItem>
                                        <SelectItem value="expired">
                                            Expired
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="px-3 py-1.5"
                                >
                                    {meds.length} total
                                </Badge>
                                <Badge className="px-3 py-1.5 bg-primary">
                                    {activeMeds.length} active
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {meds.length === 0 ? (
                        <Card className="border-2 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="p-4 rounded-full bg-muted mb-4">
                                    <Pill className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    No medications yet
                                </h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Start by adding your first medication to
                                    track your health journey. Track dosage,
                                    schedule, and progress all in one place.
                                </p>
                                <AddMedicationDialog
                                    onSuccess={() => fetchMedications(user!.id)}
                                >
                                    <Button size="lg" variant="default">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Medication
                                    </Button>
                                </AddMedicationDialog>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <TableProvider
                                columns={columns}
                                data={filteredMeds}
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
                    )}
                </div>

                {/* Sheets */}
                {selectedMedication && (
                    <>
                        <EditMedicationSheet
                            open={editOpen}
                            onOpenChange={setEditOpen}
                            medication={selectedMedication}
                            onUpdated={() => {
                                fetchMedications(user!.id);
                                setEditOpen(false);
                            }}
                        />
                        <MedicationDetailsSheet
                            open={detailsOpen}
                            onOpenChange={setDetailsOpen}
                            medication={selectedMedication}
                            onUpdate={() => fetchMedications(user!.id)}
                        />
                    </>
                )}

                {/* Footer Note & Today's Reminder */}
                {(todayMeds.length > 0 || expiredMeds.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {todayMeds.length > 0 && (
                            <div className="rounded-xl bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 p-5">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm mb-2">
                                            Today{"'"}s Schedule
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            You have {todayMeds.length}{" "}
                                            medication
                                            {todayMeds.length > 1
                                                ? "s"
                                                : ""}{" "}
                                            scheduled for today. Don{"'"}t
                                            forget to take them as prescribed.
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {todayMeds
                                                .slice(0, 3)
                                                .map((med, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {med.name}
                                                    </Badge>
                                                ))}
                                            {todayMeds.length > 3 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    +{todayMeds.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {expiredMeds.length > 0 && (
                            <div className="rounded-xl bg-linear-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20 p-5">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm mb-2 text-amber-700">
                                            Review Needed
                                        </p>
                                        <p className="text-sm text-amber-600/80">
                                            {expiredMeds.length} medication
                                            {expiredMeds.length > 1
                                                ? "s have"
                                                : " has"}{" "}
                                            expired. Please review and update
                                            their status.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
