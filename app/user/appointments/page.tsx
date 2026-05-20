"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building,
  Calendar,
  CalendarClock,
  Clock,
  Filter,
  History,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";

export interface Facility {
  id: string;
  name: string;
  type: string | null;
  specialty: string | null;
  address: string;
  is_active: boolean;
  created_at: string;
  latitude: string | null;
  longitude: string | null;
  cura_facility_schedules?: FacilitySchedule[];
}

interface FacilitySchedule {
  id: string;
  facility_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number | null;
}

interface Appointment {
  id: string;
  facility_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason_for_visit: string | null;
  facility_name?: string;
  created_at?: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(time: string) {
  const normalized = String(time ?? "").trim().slice(0, 5);
  if (!normalized) return "N/A";

  const [hours = "0", minutes = "0"] = normalized.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toAppointmentKey(appointment: Appointment) {
  return `${appointment.appointment_date}T${appointment.start_time}`;
}

function isAppointmentActive(appointment: Appointment, todayIso: string) {
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    return false;
  }

  return appointment.appointment_date >= todayIso;
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CHECKED_IN":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "COMPLETED":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-border bg-muted text-foreground";
  }
}

function AppointmentList({
  appointments,
  emptyTitle,
  emptyDescription,
}: {
  appointments: Appointment[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (!appointments.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <CalendarClock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{emptyTitle}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => {
        const canCancel =
          appointment.status === "PENDING" || appointment.status === "CONFIRMED";

        return (
          <Card key={appointment.id} className="border-border/60">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {appointment.facility_name ?? "Healthcare Facility"}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeClasses(appointment.status)}
                  >
                    {appointment.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(appointment.appointment_date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(appointment.start_time)} -{" "}
                    {formatTime(appointment.end_time)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointment.reason_for_visit?.trim() || "No reason provided."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {appointment.facility_id ? (
                  <Link href={`/user/appointments/${appointment.facility_id}`}>
                    <Button variant="outline" size="sm">
                      Book Again
                    </Button>
                  </Link>
                ) : null}
                {canCancel ? (
                  <Badge variant="secondary" className="px-3 py-2 text-xs">
                    Active booking
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function AppointmentPage() {
  const { user } = useUser();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isFacilitiesLoading, setIsFacilitiesLoading] = useState(true);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setIsFacilitiesLoading(true);
        const res = await fetch("/api/facility", { cache: "no-store" });
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load facilities");
        }

        setFacilities(Array.isArray(json?.facility) ? json.facility : []);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        toast.error("Failed to load facilities");
      } finally {
        setIsFacilitiesLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    if (!user) {
      setAppointments([]);
      setIsAppointmentsLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        setIsAppointmentsLoading(true);
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load appointments");
        }

        setAppointments(Array.isArray(json?.data) ? json.data : []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load your appointments");
        setAppointments([]);
      } finally {
        setIsAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const facilityTypes = useMemo(() => {
    const types = facilities.map((facility) => facility.type).filter(Boolean) as string[];
    return Array.from(new Set(types));
  }, [facilities]);

  const scheduledFacilitiesCount = useMemo(
    () =>
      facilities.filter(
        (facility) => (facility.cura_facility_schedules?.length ?? 0) > 0,
      ).length,
    [facilities],
  );

  const specialtyCount = useMemo(() => {
    const specialties = facilities
      .map((facility) => facility.specialty)
      .filter(Boolean) as string[];

    return new Set(specialties).size;
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    let filtered = facilities.filter(
      (facility) =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (facility.specialty?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (facility.type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (filterType !== "all") {
      filtered = filtered.filter((facility) => facility.type === filterType);
    }

    return filtered;
  }, [facilities, filterType, searchQuery]);

  const todayIso = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const activeAppointments = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => isAppointmentActive(appointment, todayIso))
        .sort((left, right) => toAppointmentKey(left).localeCompare(toAppointmentKey(right))),
    [appointments, todayIso],
  );

  const appointmentHistory = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => !isAppointmentActive(appointment, todayIso))
        .sort((left, right) => toAppointmentKey(right).localeCompare(toAppointmentKey(left))),
    [appointments, todayIso],
  );

  const getScheduleSummary = (schedules?: FacilitySchedule[]) => {
    if (!schedules?.length) {
      return {
        days: [] as string[],
        hours: "No schedule available",
        slotDuration: null as number | null,
      };
    }

    const sorted = [...schedules].sort((a, b) => a.day_of_week - b.day_of_week);
    const first = sorted[0];

    return {
      days: sorted.map((schedule) => DAY_LABELS[schedule.day_of_week] ?? "N/A"),
      hours: `${formatTime(first.start_time)} - ${formatTime(first.end_time)}`,
      slotDuration: first.slot_duration_minutes,
    };
  };

  const columns: ColumnDef<Facility>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Facility" />
      ),
      cell: ({ row }) => (
        <div className="min-w-60 flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Building className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background ${row.original.is_active ? "bg-primary" : "bg-muted-foreground"}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{row.original.name}</div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-xs">
                {row.original.type ?? "Unspecified"}
              </Badge>
              {row.original.specialty ? (
                <span className="truncate">{row.original.specialty}</span>
              ) : null}
              <span
                className={
                  row.original.is_active ? "text-primary" : "text-muted-foreground"
                }
              >
                {row.original.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <div className="min-w-55 max-w-70 space-y-1">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm wrap-break-words">
                {row.original.address}
              </p>
              {row.original.latitude && row.original.longitude ? (
                <p className="text-xs text-muted-foreground">
                  Coordinates available
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "schedule",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Schedule" />
      ),
      cell: ({ row }) => {
        const schedule = getScheduleSummary(row.original.cura_facility_schedules);

        return (
          <div className="min-w-55 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{schedule.hours}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {schedule.days.length ? (
                schedule.days.map((day) => (
                  <Badge key={day} variant="secondary" className="text-xs">
                    {day}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No weekly schedule set
                </span>
              )}
            </div>
            {schedule.slotDuration ? (
              <p className="text-xs text-muted-foreground">
                {schedule.slotDuration} min per slot
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => (
        <div className="min-w-45 flex items-center justify-start gap-2">
          <Link
            href={`/user/appointments/${row.original.id}`}
            className="max-w-30 flex-1"
          >
            <Button className="w-full gap-2" size="sm">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Book Now</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  if (!user) {
    return (
      <UserPageShell contentClassName="justify-center">
        <Card className="max-w-md w-full border-none shadow-2xl">
          <CardContent className="p-8">
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-primary/5">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Welcome to Cura Health</h3>
                <p className="text-muted-foreground">
                  Please sign in to book appointments with trusted healthcare
                  providers
                </p>
              </div>
              <Button className="h-12 w-full rounded-xl bg-linear-to-r from-primary to-primary/90 shadow-lg hover:from-primary/90 hover:to-primary">
                Sign In to Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <div className="space-y-8">
        <UserPageHeader
          icon={Calendar}
          title="Appointments"
          description="Manage active bookings, review appointment history, and book new visits."
          meta={
            <Badge variant="outline" className="shrink-0 px-4 py-2">
              {appointments.length} total appointments
            </Badge>
          }
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Appointments
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">
                    {isAppointmentsLoading ? "--" : activeAppointments.length}
                  </h3>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <CalendarClock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Appointment History
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">
                    {isAppointmentsLoading ? "--" : appointmentHistory.length}
                  </h3>
                </div>
                <div className="rounded-full bg-muted p-3">
                  <History className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Available Facilities
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">
                    {isFacilitiesLoading ? "--" : facilities.length}
                  </h3>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Building className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">
              Active ({isAppointmentsLoading ? "..." : activeAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({isAppointmentsLoading ? "..." : appointmentHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isAppointmentsLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-3 p-5">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <AppointmentList
                appointments={activeAppointments}
                emptyTitle="No active appointments"
                emptyDescription="When you book or confirm an appointment, it will appear here."
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isAppointmentsLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-3 p-5">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <AppointmentList
                appointments={appointmentHistory}
                emptyTitle="No appointment history"
                emptyDescription="Completed, cancelled, or past appointments will appear here."
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-8 lg:col-span-9">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search facilities by name, specialty, or location..."
                className="h-fit rounded-xl border-2 pl-12 text-base"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
          <div className="md:col-span-4 lg:col-span-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full rounded-xl border-2">
                <SelectValue placeholder="All Facility Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facility Types</SelectItem>
                {facilityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-primary/10 transition-all hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Facilities
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">
                    {facilities.filter((facility) => facility.is_active).length}
                  </h3>
                </div>
                <div className="shrink-0 rounded-full bg-primary/10 p-3">
                  <Building className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-info/10 transition-all hover:border-info/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    With Schedules
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">
                    {scheduledFacilitiesCount}
                  </h3>
                </div>
                <div className="shrink-0 rounded-full bg-info/10 p-3">
                  <Clock className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning/10 transition-all hover:border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Facility Types
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">{facilityTypes.length}</h3>
                </div>
                <div className="shrink-0 rounded-full bg-warning/10 p-3">
                  <Filter className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/10 transition-all hover:border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Specialties
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">{specialtyCount}</h3>
                </div>
                <div className="shrink-0 rounded-full bg-secondary/10 p-3">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Facilities</h2>
              <p className="text-sm text-muted-foreground">
                {filteredFacilities.length} facilities found
                {searchQuery ? ` for "${searchQuery}"` : ""}
                {filterType !== "all" ? ` - Filtered by: ${filterType}` : ""}
              </p>
            </div>
          </div>

          {isFacilitiesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 rounded-lg border p-4"
                >
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : filteredFacilities.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">No facilities found</h3>
                <p className="mb-6 text-muted-foreground">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try different keywords.`
                    : "No healthcare facilities available at the moment."}
                </p>
                {searchQuery ? (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Search
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <div className="min-w-[900px]">
                <TableProvider columns={columns} data={filteredFacilities}>
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
                      <TableRow key={row.id} row={row}>
                        {({ cell }) => <TableCell cell={cell} key={cell.id} />}
                      </TableRow>
                    )}
                  </TableBody>
                </TableProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserPageShell>
  );
}
