"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Calendar,
  CalendarClock,
  Download,
  Clock,
  Filter,
  History,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import { EASE } from "@/hooks/use-motion-config";
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

function toIcsDate(dateStr: string, timeStr: string): string {
  const [y, mo, d] = dateStr.split("-");
  const [h, mi] = timeStr.split(":");
  return `${y}${mo?.padStart(2, "0")}${d?.padStart(2, "0")}T${(h ?? "00").padStart(2, "0")}${(mi ?? "00").padStart(2, "0")}00`;
}

function exportAppointmentIcs(appointment: Appointment) {
  const dtStart = toIcsDate(appointment.appointment_date, appointment.start_time);
  const dtEnd = toIcsDate(appointment.appointment_date, appointment.end_time || appointment.start_time);
  const summary = `Appointment â€” ${appointment.facility_name ?? "Healthcare Facility"}`;
  const description = appointment.reason_for_visit?.trim() || "Medical appointment";
  const uid = `cura-sync-appt-${appointment.id}@curasync`;
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CuraSync//Appointment//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `appointment-${appointment.appointment_date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
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
      return "border-chart-3/30 bg-chart-3/10 text-chart-3";
    case "CHECKED_IN":
      return "border-chart-2/30 bg-chart-2/10 text-chart-2";
    case "PENDING":
      return "border-chart-5/30 bg-chart-5/10 text-chart-5";
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "COMPLETED":
      return "border-border bg-muted text-muted-foreground";
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
      <div className="py-10 text-center">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div>
      {appointments.map((appointment) => {
        const canCancel =
          appointment.status === "PENDING" || appointment.status === "CONFIRMED";

        return (
          <div
            key={appointment.id}
            className="flex flex-col gap-4 border-b border-border/70 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">
                  {appointment.facility_name ?? "Healthcare Facility"}
                </p>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClasses(appointment.status)}
                >
                  {appointment.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(appointment.appointment_date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportAppointmentIcs(appointment)}
                title="Add to calendar"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                .ics
              </Button>
              {canCancel ? (
                <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                  Active booking
                </Badge>
              ) : null}
            </div>
          </div>
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
            <div className="truncate text-base font-semibold">{row.original.name}</div>
            <div className="flex flex-wrap items-center gap-1 text-base text-muted-foreground">
              <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-base">
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
              <p className="line-clamp-2 text-base wrap-break-words">
                {row.original.address}
              </p>
              {row.original.latitude && row.original.longitude ? (
                <p className="text-base text-muted-foreground">
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
            <div className="flex items-center gap-2 text-base">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{schedule.hours}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {schedule.days.length ? (
                schedule.days.map((day) => (
                  <Badge key={day} variant="secondary" className="text-base">
                    {day}
                  </Badge>
                ))
              ) : (
                <span className="text-base text-muted-foreground">
                  No weekly schedule set
                </span>
              )}
            </div>
            {schedule.slotDuration ? (
              <p className="text-base text-muted-foreground">
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
      <UserPageShell contentClassName="justify-center items-center">
        <div className="max-w-sm w-full text-center py-16 space-y-4">
          <p className="text-lg font-semibold text-foreground">Welcome to Cura Health</p>
          <p className="text-sm text-muted-foreground">
            Please sign in to book appointments with trusted healthcare providers
          </p>
          <Button className="w-full">
            Sign In to Continue
          </Button>
        </div>
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <UserPageHeader
          sectionLabel="Your Appointments"
          title="Appointments"
          description="Manage active bookings, review appointment history, and book new visits."
          meta={
            <span className="font-mono text-xs text-muted-foreground">
              {appointments.length} total
            </span>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/70">
          <div className="py-4 lg:pr-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active Appointments</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {isAppointmentsLoading ? "â€”" : activeAppointments.length}
            </p>
          </div>
          <div className="py-4 lg:px-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Appointment History</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {isAppointmentsLoading ? "â€”" : appointmentHistory.length}
            </p>
          </div>
          <div className="py-4 lg:pl-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Available Facilities</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {isFacilitiesLoading ? "â€”" : facilities.length}
            </p>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
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
                  aria-label="Clear search"
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

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Facilities</h2>
              <p className="text-base text-muted-foreground">
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
            <div className="py-12 text-center">
              <p className="font-medium text-foreground">No facilities found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? `No results for "${searchQuery}". Try different keywords.`
                  : "No healthcare facilities available at the moment."}
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Search
                </Button>
              ) : null}
            </div>
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
      </motion.div>
    </UserPageShell>
  );
}

