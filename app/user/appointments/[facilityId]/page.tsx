"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Phone,
    CheckCircle,
    Loader2,
    Building,
    Calendar as CalendarIcon,
    MapPin,
    ChevronLeft,
    Navigation,
    Stethoscope,
    ChevronDown,
    Lock,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

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

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const minBookingDate = new Date(startOfToday);
minBookingDate.setDate(minBookingDate.getDate() + 1);

type BookingFacility = {
    id: string;
    name: string;
    type: string | null;
    specialty: string | null;
    address: string;
    phone?: string | null;
    coordinates?: [number, number];
};

type FacilitySchedule = {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number | null;
    break_start: string | null;
    break_end: string | null;
};

function toMinutes(time: string) {
    const [hours = "0", minutes = "0"] = time.split(":");
    return Number(hours) * 60 + Number(minutes);
}

function fromMinutes(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

function formatSlotLabel(start: string, end: string) {
    return `${start} - ${end}`;
}

export default function AppointmentBookingPage() {
    const { facilityId } = useParams<{ facilityId: string }>();
    const router = useRouter();
    const { user } = useUser();

    const [facility, setFacility] = useState<BookingFacility | null>(null);
    const [schedules, setSchedules] = useState<FacilitySchedule[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        minBookingDate
    );
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [timeDialogOpen, setTimeDialogOpen] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null
    );

    const normalizeTime = (t: string) => t?.slice(0, 5);

    const availableSlots = (() => {
        if (!selectedDate) return [];

        const activeSchedules = schedules.filter(
            (schedule) => schedule.day_of_week === selectedDate.getDay()
        );

        return activeSchedules.flatMap((schedule) => {
            const duration = schedule.slot_duration_minutes ?? 60;
            const breakStart = schedule.break_start ? toMinutes(schedule.break_start) : null;
            const breakEnd = schedule.break_end ? toMinutes(schedule.break_end) : null;
            const slots: string[] = [];

            for (
                let start = toMinutes(schedule.start_time);
                start + duration <= toMinutes(schedule.end_time);
                start += duration
            ) {
                const end = start + duration;
                if (breakStart !== null && breakEnd !== null) {
                    if (start < breakEnd && end > breakStart) continue;
                }
                slots.push(formatSlotLabel(fromMinutes(start), fromMinutes(end)));
            }

            return slots;
        });
    })();

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
                toast.warning("Location access denied", {
                    description: "Directions and distance may be limited",
                });
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }, []);

    useEffect(() => {
        async function loadFacility() {
            setIsLoading(true);
            try {
                const [facilityRes, scheduleRes] = await Promise.all([
                    fetch(`/api/facility/${facilityId}`, {
                        cache: "no-store",
                    }),
                    fetch(
                        `/api/facility/schedule?facilityId=${encodeURIComponent(
                            String(facilityId)
                        )}`,
                        { cache: "no-store" }
                    ),
                ]);

                const [facilityJson, scheduleJson] = await Promise.all([
                    facilityRes.json().catch(() => null),
                    scheduleRes.json().catch(() => null),
                ]);

                if (!facilityRes.ok || !facilityJson?.facility) {
                    toast.error("Facility not found");
                    router.push("/user/appointments");
                    return;
                }

                const data = facilityJson.facility;

                const transformedFacility: BookingFacility = {
                    id: data.id,
                    name: data.name,
                    type: data.type,
                    specialty: data.specialty,
                    address: data.address,
                    phone: data.phone,
                    coordinates:
                        data.latitude && data.longitude
                            ? [
                                  parseFloat(data.latitude),
                                  parseFloat(data.longitude),
                              ]
                            : undefined,
                };

                setFacility(transformedFacility);
                setSchedules(
                    Array.isArray(scheduleJson?.schedules)
                        ? scheduleJson.schedules
                        : []
                );
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
                const res = await fetch(
                    `/api/appointments/booked?date=${encodeURIComponent(
                        dateStr
                    )}&facilityId=${encodeURIComponent(facility.id)}`,
                    { cache: "no-store" }
                );

                const json = await res.json();
                if (!res.ok) {
                    throw new Error(json?.error || "Failed to load availability");
                }

                const slots: string[] = Array.isArray(json) ? json : [];
                setBookedSlots(
                    slots.map((s) => normalizeTime(s.split(" - ")[0] ?? ""))
                );
            } catch {
                toast.error("Failed to load availability");
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchBookedSlots();
    }, [facility, selectedDate]);

    useEffect(() => {
        if (selectedSlot && !availableSlots.includes(selectedSlot)) {
            setSelectedSlot(null);
        }
    }, [availableSlots, selectedSlot]);

    const isSlotBooked = (slot: string) =>
        bookedSlots.includes(normalizeTime(slot.split(" - ")[0]));

    const selectedDaySchedules = selectedDate
        ? schedules.filter(
              (schedule) => schedule.day_of_week === selectedDate.getDay()
          )
        : [];

    const handleBooking = async () => {
        if (!user || !facility || !selectedDate || !selectedSlot || !reason) {
            toast.error("Please complete all fields");
            return;
        }

        const [start_time, end_time] = selectedSlot.split(" - ");
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        setIsBooking(true);

        const bookingPromise = fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                facility_id: facility.id,
                appointment_date: dateStr,
                start_time,
                end_time,
                reason_for_visit: reason,
            }),
        }).then(async (res) => {
            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Booking failed");
            }

            return json;
        });

        toast.promise(bookingPromise, {
            loading: "Booking appointment...",
            success: "Appointment confirmed!",
            error: (err) => err.message,
        });

        try {
            await bookingPromise;
            router.push("/user/appointments");
        } finally {
            setIsBooking(false);
        }
    };

    const handleGetDirections = () => {
        if (!facility?.coordinates) {
            toast.error("Directions unavailable", {
                description: "This facility has no location data",
            });
            return;
        }

        toast.message("Opening Google Maps...");
        const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates[0]},${facility.coordinates[1]}`;
        window.open(url, "_blank");
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <div className="animate-pulse border-b px-4 py-3 md:px-8">
                    <div className="h-5 w-24 rounded bg-muted" />
                </div>
                <div className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr]">
                    <div className="animate-pulse space-y-5 border-r p-6">
                        <div className="h-5 w-1/2 rounded bg-muted" />
                        <div className="h-10 rounded-lg bg-muted" />
                        <div className="h-10 rounded-lg bg-muted" />
                        <div className="h-px bg-muted" />
                        <div className="space-y-2">
                            <div className="h-4 w-1/3 rounded bg-muted" />
                            <div className="h-4 w-1/2 rounded bg-muted" />
                        </div>
                        <div className="h-10 rounded-lg bg-muted" />
                    </div>
                    <div className="animate-pulse">
                        <div className="h-[520px] bg-muted" />
                        <div className="space-y-3 p-6">
                            <div className="h-4 w-1/4 rounded bg-muted" />
                            <div className="grid grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-12 rounded bg-muted" />
                                ))}
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
        <div className="flex min-h-screen flex-col bg-background">
            {/* ── Top bar ── */}
            <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3 md:px-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/user/appointments")}
                    className="-ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="mx-2 h-4 w-px shrink-0 bg-border" />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold leading-tight">{facility?.name}</p>
                    <p className="truncate text-base text-muted-foreground">{facility?.address}</p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGetDirections}
                        disabled={!facility?.coordinates}
                        className="gap-1.5"
                    >
                        <Navigation className="h-3.5 w-3.5" />
                        Directions
                    </Button>
                    {facility?.phone && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${facility.phone}`, "_blank")}
                            className="gap-1.5"
                        >
                            <Phone className="h-3.5 w-3.5" />
                            Call
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr]">

                {/* LEFT — booking panel */}
                <div className="border-b lg:border-b-0 lg:border-r">
                    <div className="sticky top-0 flex max-h-screen flex-col overflow-y-auto">
                        <div className="space-y-5 p-5 md:p-6">

                            {/* Facility meta */}
                            <div className="space-y-1">
                                <p className="font-semibold">{facility?.name}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-base text-muted-foreground">
                                    {facility?.specialty && (
                                        <span className="flex items-center gap-1">
                                            <Stethoscope className="h-3 w-3" />
                                            {facility.specialty}
                                        </span>
                                    )}
                                    {facility?.type && (
                                        <span className="flex items-center gap-1">
                                            <Building className="h-3 w-3" />
                                            {facility.type}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Date picker */}
                            <div className="space-y-2">
                                <p className="text-base font-medium uppercase tracking-wider text-muted-foreground">
                                    Date
                                </p>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-10 w-full justify-between font-normal">
                                            <span className="flex items-center gap-2 truncate">
                                                <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span className="truncate">
                                                    {selectedDate
                                                        ? format(selectedDate, "EEE, MMM d, yyyy")
                                                        : "Pick a date"}
                                                </span>
                                            </span>
                                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                setSelectedDate(date);
                                                setSelectedSlot(null);
                                                if (date) {
                                                    toast.message("Date selected", {
                                                        description: format(date, "EEEE, MMMM d, yyyy"),
                                                    });
                                                }
                                            }}
                                            disabled={(date) => date < minBookingDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {selectedDate && (
                                    <p className="text-base text-muted-foreground">
                                        {selectedDaySchedules.length
                                            ? `${selectedDaySchedules.length} schedule window${selectedDaySchedules.length === 1 ? "" : "s"} for this day`
                                            : "No schedule configured for this day"}
                                    </p>
                                )}
                            </div>

                            {/* Time picker */}
                            <div className="space-y-2">
                                <p className="text-base font-medium uppercase tracking-wider text-muted-foreground">
                                    Time
                                </p>
                                <Button
                                    variant="outline"
                                    className="h-10 w-full justify-between font-normal"
                                    disabled={!selectedDate || isLoadingSlots}
                                    onClick={() => setTimeDialogOpen(true)}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate">
                                            {isLoadingSlots
                                                ? "Loading slots..."
                                                : selectedSlot
                                                ? selectedSlot
                                                : selectedDate
                                                ? "Pick a time slot"
                                                : "Select a date first"}
                                        </span>
                                    </span>
                                    {isLoadingSlots ? (
                                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    )}
                                </Button>
                                {selectedDate && !isLoadingSlots && availableSlots.length > 0 && (
                                    <p className="text-base text-muted-foreground">
                                        {availableSlots.filter((s) => !isSlotBooked(s)).length} of {availableSlots.length} slots available
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Patient */}
                            {user && (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage src={user.imageUrl} />
                                        <AvatarFallback className="bg-muted text-base font-medium">
                                            {user.fullName?.charAt(0) ||
                                                user.emailAddresses[0].emailAddress.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-base font-medium">
                                            {user.fullName || user.emailAddresses[0].emailAddress}
                                        </p>
                                        <p className="truncate text-base text-muted-foreground">
                                            {user.primaryEmailAddress?.emailAddress}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Summary rows */}
                            <div className="space-y-1.5 text-base">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium">
                                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span className="font-medium">
                                        {selectedSlot ? selectedSlot.split(" - ")[0] : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-medium">
                                        {selectedSlot
                                            ? (() => {
                                                  const [s, e] = selectedSlot.split(" - ");
                                                  if (!s || !e) return "—";
                                                  const diff = toMinutes(e) - toMinutes(s);
                                                  return diff >= 60 ? `${diff / 60}h` : `${diff} min`;
                                              })()
                                            : "—"}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {/* Reason */}
                            {selectedSlot && (
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">Reason for visit</Label>
                                    <Textarea
                                        placeholder="Describe your symptoms or reason..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="min-h-[90px] resize-none text-base"
                                    />
                                </div>
                            )}

                            {/* Confirm */}
                            <Button
                                onClick={handleBooking}
                                disabled={isBooking || !reason.trim() || !selectedSlot}
                                className="w-full"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Confirm Booking
                                    </>
                                )}
                            </Button>

                            <p className="flex items-center gap-1.5 text-base text-muted-foreground">
                                <Lock className="h-3 w-3" />
                                Review carefully before confirming
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT — map + details */}
                <div className="flex flex-col">
                    {/* Map */}
                    <div className="h-[420px] w-full shrink-0 lg:h-[520px]">
                        {facility?.coordinates ? (
                            <MapComponent center={mapCenter as [number, number]} zoom={15}>
                                {userLocation && (
                                    <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
                                        <MarkerContent>
                                            <div className="relative">
                                                <div className="h-8 w-8 rounded-full border-2 border-card bg-chart-2" />
                                                <div className="absolute -inset-2 animate-ping rounded-full bg-chart-2/20" />
                                            </div>
                                        </MarkerContent>
                                    </MapMarker>
                                )}
                                <MapMarker
                                    longitude={facility.coordinates[1]}
                                    latitude={facility.coordinates[0]}
                                >
                                    <MarkerContent>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-primary shadow-md">
                                            <Building className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                    </MarkerContent>
                                </MapMarker>
                            </MapComponent>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted/20">
                                <div className="text-center text-base text-muted-foreground">
                                    <MapPin className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                    <p>No location data for this facility</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Facility details */}
                    <div className="border-t p-5 md:p-6 lg:p-8">
                        <h2 className="mb-4 text-base font-semibold">About this facility</h2>
                        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-base sm:grid-cols-4">
                            <div>
                                <dt className="mb-1 text-base font-medium uppercase tracking-wider text-muted-foreground">Type</dt>
                                <dd className="font-medium">{facility?.type ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="mb-1 text-base font-medium uppercase tracking-wider text-muted-foreground">Specialty</dt>
                                <dd className="font-medium">{facility?.specialty ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="mb-1 text-base font-medium uppercase tracking-wider text-muted-foreground">Phone</dt>
                                <dd className="font-medium">{facility?.phone ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="mb-1 text-base font-medium uppercase tracking-wider text-muted-foreground">Hours (selected day)</dt>
                                <dd className="font-medium">
                                    {selectedDaySchedules.length
                                        ? selectedDaySchedules
                                              .map((s) => `${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}`)
                                              .join(", ")
                                        : "—"}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Time picker dialog */}
            <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Select a Time</DialogTitle>
                        <DialogDescription>
                            {selectedDate
                                ? `Available slots for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`
                                : "Choose a time slot"}
                        </DialogDescription>
                    </DialogHeader>
                    {availableSlots.length ? (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            {availableSlots.map((slot) => {
                                const booked = isSlotBooked(slot);
                                const selected = selectedSlot === slot;
                                return (
                                    <button
                                        key={slot}
                                        disabled={booked}
                                        onClick={() => {
                                            if (booked) return;
                                            setSelectedSlot(slot);
                                            setTimeDialogOpen(false);
                                            toast.success("Time slot selected", {
                                                description: `${slot} on ${format(selectedDate!, "MMM d, yyyy")}`,
                                            });
                                        }}
                                        className={cn(
                                            "rounded-lg px-3 py-2.5 text-left text-base transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                            selected
                                                ? "bg-primary text-primary-foreground"
                                                : booked
                                                ? "cursor-not-allowed bg-muted/40 text-muted-foreground/40 line-through"
                                                : "border border-border hover:border-primary/50 hover:bg-muted/40"
                                        )}
                                    >
                                        <span className="block font-medium leading-tight">
                                            {slot.split(" - ")[0]}
                                        </span>
                                        <span className={cn(
                                            "block text-base leading-tight",
                                            selected ? "text-primary-foreground/70" : "text-muted-foreground"
                                        )}>
                                            {booked ? "Booked" : `ends ${slot.split(" - ")[1]}`}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-base text-muted-foreground">No slots for this date</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
