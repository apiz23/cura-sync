"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  MapPin,
  Filter,
  Clock,
  Calendar,
  Users,
  X,
  Building,
  Navigation,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

export default function AppointmentPage() {
  const { user } = useUser();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/facility", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load facilities");
        }

        const rawFacilities: any[] = Array.isArray(json.facility)
          ? json.facility
          : [];

        setFacilities(rawFacilities);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        toast.error("Failed to load facilities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const facilityTypes = useMemo(() => {
    const types = facilities.map((f) => f.type).filter(Boolean) as string[];
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
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.specialty?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (f.type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (filterType !== "all") {
      filtered = filtered.filter((f) => f.type === filterType);
    }

    return filtered;
  }, [searchQuery, facilities, filterType]);

  const openMaps = (
    address: string,
    latitude?: string | null,
    longitude?: string | null,
  ) => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        "_blank",
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address,
        )}`,
        "_blank",
      );
    }
  };

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatTime = (time: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(`1970-01-01T${time}`));

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
        <div className="flex items-start gap-3 min-w-60">
          <div className="relative shrink-0">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Building className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background"
              style={{
                backgroundColor: row.original.is_active ? "#10B981" : "#6B7280",
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm truncate">
              {row.original.name}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs flex-wrap">
              <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
                {row.original.type ?? "Unspecified"}
              </Badge>
              {row.original.specialty ? (
                <span className="truncate">{row.original.specialty}</span>
              ) : null}
              <span
                className={
                  row.original.is_active ? "text-emerald-600" : "text-gray-500"
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
        <div className="space-y-1 min-w-55 max-w-70">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm line-clamp-2 wrap-break-words">
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
          <div className="space-y-2 min-w-55">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
        <div className="flex items-center justify-start gap-2 min-w-45">
          <Link
            href={`/user/appointments/${row.original.id}`}
            className="flex-1 max-w-30"
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
        <Card className="border-none shadow-2xl max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Welcome to Cura Health</h3>
                <p className="text-muted-foreground">
                  Please sign in to book appointments with trusted healthcare
                  providers
                </p>
              </div>
              <Button className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
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
          title="Healthcare Facilities"
          description="Browse and book appointments at trusted medical facilities."
          meta={
            <Badge variant="outline" className="px-4 py-2 shrink-0">
              {facilities.length} total facilities
            </Badge>
          }
        />

          {/* Search & Filter */}
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-8 lg:col-span-9">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search facilities by name, specialty, or location..."
                  className="pl-12 h-fit text-base rounded-xl border-2"
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
            </div>
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full h-14 rounded-xl border-2 border-input bg-background px-4 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
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
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-blue-500/10 hover:border-blue-500/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Available Today
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {facilities.length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/10 shrink-0">
                    <Building className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/10 hover:border-green-500/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      With Schedules
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {scheduledFacilitiesCount}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10 shrink-0">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-500/10 hover:border-amber-500/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Facility Types
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {facilityTypes.length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-amber-500/10 shrink-0">
                    <Filter className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500/10 hover:border-purple-500/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Specialties
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {specialtyCount}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-purple-500/10 shrink-0">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facilities Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Facilities</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredFacilities.length} facilities found
                  {searchQuery && ` for "${searchQuery}"`}
                  {filterType !== "all" && ` • Filtered by: ${filterType}`}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
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
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    No facilities found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try different keywords.`
                      : "No healthcare facilities available at the moment."}
                  </p>
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
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-xl border border-border overflow-x-auto bg-card">
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
                          {({ cell }) => (
                            <TableCell cell={cell} key={cell.id} />
                          )}
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
