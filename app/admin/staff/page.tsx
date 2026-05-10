"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Search,
    Filter,
    Loader2,
    Shield,
    Stethoscope,
    UserCog,
    Mail,
    Calendar,
    ChevronRightIcon,
} from "lucide-react";
import AddStaffSheet from "./add-staff-sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Staff, StaffRole } from "@/app/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/authprovideradmin";
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
import { useRouter } from "next/navigation";

export default function StaffPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const isAdmin = user?.role === "admin";
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");

    async function fetchStaff() {
        setLoading(true);

        try {
            if (authLoading) return;
            const facilityId = user?.facility_id;

            if (!facilityId) {
                toast.error("Facility not selected");
                return;
            }

            const res = await fetch(
                `/api/staff/by-facility?facilityId=${facilityId}`
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to load staff");
            } else {
                setStaff(data.staff);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to load staff");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!authLoading && user) fetchStaff();
    }, [authLoading, user]);

    if (!authLoading && user && !isAdmin) {
        return (
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Only facility administrators can manage staff accounts.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const filteredStaff = staff.filter((s) => {
        const matchSearch =
            s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase());

        const matchRole = roleFilter === "all" || s.role === roleFilter;

        return matchSearch && matchRole;
    });

    const getRoleIcon = (role: StaffRole | null) => {
        switch (role) {
            case "doctor":
                return <Stethoscope className="w-3.5 h-3.5" />;
            case "staff":
                return <Shield className="w-3.5 h-3.5" />;
            case "admin":
                return <UserCog className="w-3.5 h-3.5" />;
            default:
                return <Users className="w-3.5 h-3.5 text-muted-foreground" />;
        }
    };

    const getRoleColor = (role: StaffRole | null) => {
        switch (role) {
            case "doctor":
                return {
                    bg: "bg-blue-100 dark:bg-blue-900",
                    text: "text-blue-800 dark:text-blue-200",
                    dot: "bg-blue-500",
                };
            case "staff":
                return {
                    bg: "bg-emerald-100 dark:bg-emerald-900",
                    text: "text-emerald-800 dark:text-emerald-200",
                    dot: "bg-emerald-500",
                };
            case "admin":
                return {
                    bg: "bg-purple-100 dark:bg-purple-900",
                    text: "text-purple-800 dark:text-purple-200",
                    dot: "bg-purple-500",
                };
            default:
                return {
                    bg: "bg-gray-100 dark:bg-gray-800",
                    text: "text-gray-700 dark:text-gray-300",
                    dot: "bg-gray-500",
                };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const openStaffProfile = (staffId: string) => {
        router.push(`/admin/staff/${staffId}`);
    };

    // Define columns for the table
    const columns: ColumnDef<Staff>[] = [
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
                <TableColumnHeader column={column} title="Staff Member" />
            ),
            cell: ({ row }) => {
                const roleColor = getRoleColor(row.original.role);

                return (
                    <div
                        className="flex items-center gap-3 cursor-pointer group/patient"
                        onClick={() => openStaffProfile(row.original.id)}
                    >
                        <div className="relative">
                            <Avatar className="size-10 bg-linear-to-br from-primary/10 to-primary/20">
                                <AvatarFallback className="text-primary font-semibold">
                                    {row.original.full_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <div className="font-medium text-foreground group-hover/patient:text-primary transition-colors">
                                {row.original.full_name}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">
                                    {row.original.email}
                                </span>
                                <ChevronRightIcon size={10} />
                                <span className="capitalize">
                                    {row.original.role}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "role",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }) => {
                const roleColor = getRoleColor(row.original.role);

                return (
                    <Badge
                        className={`gap-1.5 ${roleColor.bg} ${roleColor.text}`}
                        variant="secondary"
                    >
                        {getRoleIcon(row.original.role)}
                        <span className="capitalize">{row.original.role}</span>
                    </Badge>
                );
            },
        },
        {
            accessorKey: "specialization",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Specialization" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    {row.original.specialization ? (
                        <span className="text-sm">
                            {row.original.specialization}
                        </span>
                    ) : (
                        <span className="text-muted-foreground text-sm">
                            Not specified
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: "joined",
            header: ({ column }) => (
                <TableColumnHeader column={column} title="Joined" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(row.original.created_at)}
                </div>
            ),
        },
        {
            id: "open",
            header: () => <div className="text-right">Open</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            openStaffProfile(row.original.id);
                        }}
                    >
                        Open profile
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Staff Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your hospital staff members and their roles
                    </p>
                </div>
                <AddStaffSheet onSuccess={fetchStaff} />
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Total Staff
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {staff.length}
                                </p>
                            </div>
                            <Users className="w-10 h-10 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    Medical Staff
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {
                                        staff.filter(
                                            (s) =>
                                                s.role === "doctor" ||
                                                s.role === "staff"
                                        ).length
                                    }
                                </p>
                            </div>
                            <Stethoscope className="w-10 h-10 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    Administrators
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {
                                        staff.filter((s) => s.role === "admin")
                                            .length
                                    }
                                </p>
                            </div>
                            <UserCog className="w-10 h-10 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Card */}
            <Card className="border shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="w-5 h-5" />
                                Staff Members
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Click any row to open the full staff profile.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="w-4 h-4" />
                            <span>
                                Showing {filteredStaff.length} of {staff.length}{" "}
                                staff members
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                value={roleFilter}
                                onValueChange={(v: StaffRole | "all") =>
                                    setRoleFilter(v)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Roles
                                    </SelectItem>
                                    <SelectItem value="doctor">
                                        Doctors
                                    </SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">
                                        Administrators
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {search || roleFilter !== "all" ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearch("");
                                        setRoleFilter("all");
                                    }}
                                >
                                    Clear
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border overflow-hidden">
                        {loading ? (
                            <div className="space-y-3 p-6">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center space-x-4"
                                    >
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredStaff.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    No staff members found
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {search || roleFilter !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "Get started by adding your first staff member"}
                                </p>
                                {!search && roleFilter === "all" && (
                                    <AddStaffSheet onSuccess={fetchStaff} />
                                )}
                            </div>
                        ) : (
                            <TableProvider
                                columns={columns}
                                data={filteredStaff}
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
                                <TableRow
                                    key={row.id}
                                    row={row}
                                    onClick={() =>
                                        openStaffProfile((row.original as Staff).id)
                                    }
                                    className="cursor-pointer transition-colors hover:bg-muted/40"
                                >
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
            </CardContent>
        </Card>
        </div>
    );
}
