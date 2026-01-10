"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Phone,
    Clock,
    CheckCircle,
    Loader2,
    Building,
    Calendar as CalendarIcon,
    MapPin,
    ChevronLeft,
    Navigation,
    CalendarClock,
    Stethoscope,
    Map as MapIcon,
    Shield,
    Star,
    ArrowUpRight,
    ChevronRight,
    FileText,
    CalendarDays,
    Lock,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import supabase from "@/lib/supabase";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Facility } from "@/app/types";
import dynamic from "next/dynamic";

// Dynamically import the map
const MapComponent = dynamic(
    () => import("@/components/ui/map").then((mod) => mod.Map),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-linear-to-br from-muted/50 to-muted/30 animate-pulse rounded-2xl" />
        ),
    }
);
const MapMarker = dynamic(
    () => import("@/components/ui/map").then((mod) => mod.MapMarker),
    { ssr: false }
);
const MarkerContent = dynamic(
    () => import("@/components/ui/map").then((mod) => mod.MarkerContent),
    { ssr: false }
);

export default function AppointmentBookingPage() {
    const { facilityId } = useParams<{ facilityId: string }>();
    const router = useRouter();
    const { user } = useUser();

    const [facility, setFacility] = useState<Facility | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null
    );

    const normalizeTime = (t: string) => t?.slice(0, 5);

    // Get user location
    useEffect(() => {
        if (!("geolocation" in navigator)) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([
                    position.coords.longitude,
                    position.coords.latitude,
                ]);
            },
            () => {
                console.log("Geolocation permission denied");
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }, []);

    // Fetch facility
    useEffect(() => {
        async function loadFacility() {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("cura_facilities")
                    .select("*")
                    .eq("id", facilityId)
                    .single();

                if (error) {
                    toast.error("Facility not found");
                    router.push("/facilities");
                    return;
                }

                const transformedFacility: Facility = {
                    id: data.id,
                    name: data.name,
                    type: data.type,
                    specialty: data.specialty,
                    address: data.address,
                    phone: data.phone,
                    rating: data.rating,
                    wait_time: data.wait_time,
                    coordinates:
                        data.latitude && data.longitude
                            ? [
                                  parseFloat(data.latitude),
                                  parseFloat(data.longitude),
                              ]
                            : undefined,
                    slots: [
                        "09:00 - 10:00",
                        "10:00 - 11:00",
                        "11:00 - 12:00",
                        "14:00 - 15:00",
                        "15:00 - 16:00",
                        "16:00 - 17:00",
                    ],
                };

                setFacility(transformedFacility);
            } catch {
                toast.error("Failed to load facility details");
            } finally {
                setIsLoading(false);
            }
        }

        loadFacility();
    }, [facilityId, router]);

    // Fetch booked slots
    useEffect(() => {
        if (!facility || !selectedDate) return;

        const fetchBookedSlots = async () => {
            setIsLoadingSlots(true);
            try {
                const dateStr = format(selectedDate, "yyyy-MM-dd");

                const { data } = await supabase
                    .from("cura_appointments")
                    .select("start_time")
                    .eq("facility_id", facility.id)
                    .eq("appointment_date", dateStr)
                    .neq("status", "CANCELLED");

                setBookedSlots(
                    (data ?? []).map((d) => normalizeTime(d.start_time))
                );
            } catch {
                toast.error("Failed to load availability");
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchBookedSlots();
    }, [facility, selectedDate]);

    const isSlotBooked = (slot: string) =>
        bookedSlots.includes(normalizeTime(slot.split(" - ")[0]));

    const handleBooking = async () => {
        if (!user || !facility || !selectedDate || !selectedSlot || !reason) {
            toast.error("Please complete all fields");
            return;
        }

        setIsBooking(true);

        const [start_time, end_time] = selectedSlot.split(" - ");
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile_id: user.id,
                    facility_id: facility.id,
                    appointment_date: dateStr,
                    start_time,
                    end_time,
                    reason_for_visit: reason,
                }),
            });

            if (!res.ok) {
                throw new Error("Booking failed");
            }

            toast.success("Appointment booked successfully!", {
                description: `Confirmation sent to ${user.primaryEmailAddress?.emailAddress}`,
                action: {
                    label: "View Appointments",
                    onClick: () => router.push("/user/appointments"),
                },
            });

            setTimeout(() => {
                router.push("/user/appointments");
            }, 2000);
        } catch {
            toast.error("Booking failed. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    const handleGetDirections = () => {
        if (!facility?.coordinates) {
            toast.error("Location information not available");
            return;
        }

        const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates[0]},${facility.coordinates[1]}`;
        window.open(url, "_blank");
    };

    const bookingProgress = () => {
        let progress = 0;
        if (selectedDate) progress += 25;
        if (selectedSlot) progress += 25;
        if (reason.trim()) progress += 25;
        return progress;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full overflow-hidden bg-linear-to-b from-background to-muted/20 p-4 md:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-1/3 rounded bg-muted"></div>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="space-y-4 lg:col-span-2">
                                <div className="h-64 rounded-2xl bg-muted"></div>
                                <div className="h-48 rounded-2xl bg-muted"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-96 rounded-2xl bg-muted"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const mapCenter = facility?.coordinates
        ? [facility.coordinates[1], facility.coordinates[0]]
        : [103.8198, 1.3521];

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-linear-to-b from-background to-muted/10 p-4 md:p-6">
            <div className="mx-auto w-full">
                {/* Back Navigation */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/user/appointment")}
                    className="group gap-2 transition-all duration-300 hover:bg-muted/50 "
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Facilities
                </Button>

                {/* Main Content */}
                <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Facility Overview */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Facility Header */}
                        <Card className="relative overflow-hidden border-none bg-linear-to-br from-background to-primary/5 shadow-lg">
                            <div className="absolute top-0 right-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-linear-to-br from-primary/10 to-transparent" />
                            <CardContent className="relative p-4 md:p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <div className="rounded-xl bg-linear-to-br from-primary to-primary/80 p-3 shadow-lg">
                                                <Building className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
                                                        {facility?.name}
                                                    </h1>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="gap-2 border-primary/20 bg-primary/10 text-primary"
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                            Verified
                                                        </Badge>
                                                        <Badge className="border-none bg-linear-to-r from-primary to-primary/80 text-white shadow-sm">
                                                            <Star className="mr-1 h-3 w-3 fill-white" />
                                                            {facility?.rating ||
                                                                "4.5"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <p className="line-clamp-2 text-sm md:text-base">
                                                        {facility?.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-1.5 sm:px-3">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {facility?.wait_time ||
                                                        "15-30 mins"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-1.5 sm:px-3">
                                                <Stethoscope className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {facility?.specialty}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-1.5 sm:px-3">
                                                <Building className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {facility?.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row flex-wrap gap-2 sm:flex-col md:flex-row lg:flex-col">
                                        <Button
                                            variant="outline"
                                            onClick={handleGetDirections}
                                            className="h-9 gap-2 transition-all hover:bg-primary/5 hover:text-primary sm:h-auto"
                                            disabled={!facility?.coordinates}
                                        >
                                            <Navigation className="h-4 w-4" />
                                            <span>Directions</span>
                                        </Button>
                                        {facility?.phone && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    window.open(
                                                        `tel:${facility.phone}`,
                                                        "_blank"
                                                    )
                                                }
                                                className="h-9 gap-2 transition-all hover:bg-primary/5 hover:text-primary sm:h-auto"
                                            >
                                                <Phone className="h-4 w-4" />
                                                <span>Call</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Booking Progress */}
                        <Card>
                            <CardContent className="p-4 md:p-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Booking Progress
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Complete all steps to schedule
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="w-fit gap-2"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            {bookingProgress()}% Complete
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                                        {[
                                            {
                                                step: 1,
                                                label: "Date",
                                                completed: !!selectedDate,
                                                icon: CalendarDays,
                                            },
                                            {
                                                step: 2,
                                                label: "Time",
                                                completed: !!selectedSlot,
                                                icon: Clock,
                                            },
                                            {
                                                step: 3,
                                                label: "Details",
                                                completed: !!reason.trim(),
                                                icon: FileText,
                                            },
                                            {
                                                step: 4,
                                                label: "Confirm",
                                                completed: false,
                                                icon: Lock,
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.step}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-xl p-3 transition-all duration-300 sm:gap-3 sm:p-4",
                                                    item.completed
                                                        ? "border border-primary/20 bg-primary/10"
                                                        : "bg-muted/50"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "h-8 w-8 rounded-full flex shrink-0 items-center justify-center sm:h-10 sm:w-10",
                                                        item.completed
                                                            ? "bg-linear-to-br from-primary to-primary/80 text-white"
                                                            : "bg-muted"
                                                    )}
                                                >
                                                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div
                                                        className={cn(
                                                            "truncate font-medium text-sm sm:text-base",
                                                            item.completed
                                                                ? "text-primary"
                                                                : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {item.label}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "truncate text-xs",
                                                            item.completed
                                                                ? "text-primary/80"
                                                                : "text-muted-foreground"
                                                        )}
                                                    >
                                                        Step {item.step}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date & Time Selection */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Date Selection */}
                            <Card>
                                <CardHeader className="p-4 md:p-6">
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5" />
                                        Select Date
                                    </CardTitle>
                                    <CardDescription>
                                        Choose your preferred appointment date
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 md:pt-0">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="h-12 w-full justify-between transition-all hover:bg-accent"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    <span className="truncate">
                                                        {selectedDate
                                                            ? format(
                                                                  selectedDate,
                                                                  "EEEE, MMMM d, yyyy"
                                                              )
                                                            : "Select a date"}
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-[calc(100vw-2rem)] p-0 sm:w-[300px]"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(date) => {
                                                    setSelectedDate(date);
                                                    setSelectedSlot(null);
                                                }}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                                className="rounded-md border"
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {selectedDate && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    Selected Date
                                                </span>
                                                <Badge variant="outline">
                                                    {format(
                                                        selectedDate,
                                                        "MMM d, yyyy"
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Next available: Today
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Time Slots */}
                            <Card>
                                <CardHeader className="p-4 md:p-6">
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Available Times
                                    </CardTitle>
                                    <CardDescription>
                                        {isLoadingSlots
                                            ? "Loading available slots..."
                                            : `${
                                                  6 - bookedSlots.length
                                              } slots available today`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 md:pt-0">
                                    {selectedDate ? (
                                        isLoadingSlots ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                                                {facility?.slots?.map(
                                                    (slot) => {
                                                        const booked =
                                                            isSlotBooked(slot);
                                                        const isSelected =
                                                            selectedSlot ===
                                                            slot;
                                                        const [start] =
                                                            slot.split(" - ");
                                                        return (
                                                            <button
                                                                key={slot}
                                                                disabled={
                                                                    booked
                                                                }
                                                                onClick={() =>
                                                                    setSelectedSlot(
                                                                        slot
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "group rounded-xl border p-3 text-center transition-all duration-200 sm:p-4",
                                                                    booked
                                                                        ? "cursor-not-allowed border-muted bg-muted/30"
                                                                        : isSelected
                                                                        ? "border-2 border-primary bg-linear-to-br from-primary/10 to-primary/5 shadow-sm"
                                                                        : "hover:border-primary hover:bg-accent/50 hover:shadow-sm"
                                                                )}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "mb-1 font-semibold sm:text-lg",
                                                                        booked
                                                                            ? "text-muted-foreground"
                                                                            : isSelected
                                                                            ? "text-primary"
                                                                            : "text-foreground"
                                                                    )}
                                                                >
                                                                    {start}
                                                                </div>
                                                                <div
                                                                    className={cn(
                                                                        "text-xs",
                                                                        booked
                                                                            ? "text-muted-foreground"
                                                                            : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {booked
                                                                        ? "Booked"
                                                                        : "Available"}
                                                                </div>
                                                                {!booked && (
                                                                    <div className="mx-auto mt-2 h-1 w-6 rounded-full bg-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />
                                                                )}
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-3 py-8 text-center">
                                            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-muted-foreground">
                                                Please select a date first
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Details & Map */}
                        <Card>
                            <CardHeader className="p-4 md:p-6">
                                <CardTitle>Facility Details</CardTitle>
                                <CardDescription>
                                    Additional information about the facility
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-4 md:p-6 md:pt-0">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 font-semibold">
                                            <Building className="h-4 w-4" />
                                            Facility Type
                                        </h4>
                                        <p className="text-muted-foreground">
                                            {facility?.type}
                                        </p>

                                        <h4 className="flex items-center gap-2 font-semibold">
                                            <Stethoscope className="h-4 w-4" />
                                            Specialty
                                        </h4>
                                        <p className="text-muted-foreground">
                                            {facility?.specialty}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 font-semibold">
                                            <Phone className="h-4 w-4" />
                                            Contact
                                        </h4>
                                        <p className="text-muted-foreground">
                                            {facility?.phone}
                                        </p>

                                        <h4 className="flex items-center gap-2 font-semibold">
                                            <Clock className="h-4 w-4" />
                                            Average Wait Time
                                        </h4>
                                        <p className="text-muted-foreground">
                                            {facility?.wait_time ||
                                                "15-30 mins"}
                                        </p>
                                    </div>
                                </div>

                                {/* Map */}
                                {facility?.coordinates && (
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 font-semibold">
                                            <MapIcon className="h-4 w-4" />
                                            Location
                                        </h4>
                                        <div className="h-[300px] overflow-hidden rounded-xl border">
                                            <MapComponent
                                                center={
                                                    mapCenter as [
                                                        number,
                                                        number
                                                    ]
                                                }
                                                zoom={15}
                                            >
                                                {userLocation && (
                                                    <MapMarker
                                                        longitude={
                                                            userLocation[0]
                                                        }
                                                        latitude={
                                                            userLocation[1]
                                                        }
                                                    >
                                                        <MarkerContent>
                                                            <div className="relative">
                                                                <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-500"></div>
                                                                <div className="absolute -inset-2 animate-ping rounded-full bg-blue-500/20"></div>
                                                            </div>
                                                        </MarkerContent>
                                                    </MapMarker>
                                                )}
                                                {facility?.coordinates && (
                                                    <MapMarker
                                                        longitude={
                                                            facility
                                                                .coordinates[1]
                                                        }
                                                        latitude={
                                                            facility
                                                                .coordinates[0]
                                                        }
                                                    >
                                                        <MarkerContent>
                                                            <div className="group relative">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-primary to-primary/80">
                                                                    <Building className="h-6 w-6 text-white" />
                                                                </div>
                                                            </div>
                                                        </MarkerContent>
                                                    </MapMarker>
                                                )}
                                            </MapComponent>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Booking Form */}
                    <div className="space-y-6">
                        <Card className="sticky top-6 border-none bg-linear-to-b from-background to-muted/30 shadow-xl">
                            <CardHeader className="p-4 md:p-6">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="h-5 w-5 text-primary" />
                                    Schedule Appointment
                                </CardTitle>
                                <CardDescription>
                                    Complete your booking details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-4 md:p-6 md:pt-0">
                                {/* Patient Info */}
                                {user && (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">
                                            Patient Information
                                        </Label>
                                        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 to-primary/10 p-4">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm sm:h-12 sm:w-12">
                                                <AvatarImage
                                                    src={user.imageUrl}
                                                />
                                                <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white">
                                                    {user.fullName?.charAt(0) ||
                                                        user.emailAddresses[0].emailAddress.charAt(
                                                            0
                                                        )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold">
                                                    {user.fullName ||
                                                        user.emailAddresses[0]
                                                            .emailAddress}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {
                                                        user.primaryEmailAddress
                                                            ?.emailAddress
                                                    }
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="border-primary/30 bg-primary/10 text-primary"
                                            >
                                                Patient
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {/* Reason for Visit */}
                                {selectedSlot && (
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="h-4 w-4" />
                                            Reason for Visit
                                        </Label>
                                        <Textarea
                                            placeholder="Describe your symptoms or reason for appointment..."
                                            value={reason}
                                            onChange={(e) =>
                                                setReason(e.target.value)
                                            }
                                            className="min-h-[120px] resize-none border-muted transition-colors focus:border-primary"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Helps providers prepare for your
                                            visit.
                                        </p>
                                    </div>
                                )}

                                {/* Booking Summary */}
                                {(selectedSlot || reason.trim()) && (
                                    <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10">
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="space-y-3 sm:space-y-4">
                                                <h4 className="text-base font-semibold sm:text-lg">
                                                    Appointment Summary
                                                </h4>

                                                <div className="space-y-2 sm:space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground sm:text-base">
                                                            Date
                                                        </span>
                                                        <span className="text-sm font-medium sm:text-base">
                                                            {selectedDate &&
                                                                format(
                                                                    selectedDate,
                                                                    "MMM d, yyyy"
                                                                )}
                                                        </span>
                                                    </div>
                                                    {selectedSlot && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground sm:text-base">
                                                                Time
                                                            </span>
                                                            <Badge className="border-primary/30 bg-primary/20 text-primary">
                                                                {
                                                                    selectedSlot.split(
                                                                        " - "
                                                                    )[0]
                                                                }
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground sm:text-base">
                                                            Duration
                                                        </span>
                                                        <span className="text-sm font-medium sm:text-base">
                                                            1 hour
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                                        <div>
                                                            <div className="text-xl font-bold sm:text-2xl">
                                                                No Charge
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Insurance billed
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={
                                                                handleBooking
                                                            }
                                                            disabled={
                                                                isBooking ||
                                                                !reason.trim() ||
                                                                !selectedSlot
                                                            }
                                                            className="h-11 gap-2 bg-linear-to-r from-primary to-primary/80 px-6 shadow-lg transition-all hover:from-primary/90 hover:to-primary hover:shadow-xl sm:h-12 sm:px-8"
                                                            size="lg"
                                                        >
                                                            {isBooking ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Confirm
                                                                    Booking
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Quick Actions */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Quick Actions
                                    </Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Button
                                            variant="outline"
                                            className="h-11 w-full justify-between transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-12"
                                            onClick={handleGetDirections}
                                            disabled={!facility?.coordinates}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Navigation className="h-4 w-4" />
                                                <span>Get Directions</span>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>

                                        {facility?.phone && (
                                            <Button
                                                variant="outline"
                                                className="h-11 w-full justify-between transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-12"
                                                onClick={() =>
                                                    window.open(
                                                        `tel:${facility.phone}`,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4" />
                                                    <span>Call Facility</span>
                                                </div>
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t p-4 md:p-6 md:pt-4">
                                <div className="flex w-full items-center gap-2 text-sm text-muted-foreground">
                                    <Lock className="h-3 w-3" />
                                    <span>
                                        Your information is secure and encrypted
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
