"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Phone,
    Clock,
    CheckCircle,
    Loader2,
    Building,
    CalendarDays,
    Calendar as CalendarIcon,
    FileText,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Facility } from "@/app/types";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

type BookingFacility = Facility & {
    phone?: string | null;
    slots: string[];
};

interface AppointmentModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    facility: BookingFacility | null;
}

export default function AppointmentModal({
    isOpen,
    onOpenChange,
    facility,
}: AppointmentModalProps) {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [isBooking, setIsBooking] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const normalizeTime = (timeStr: string) => {
        if (!timeStr) return "";
        return timeStr.slice(0, 5);
    };

    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (!facility || !selectedDate) {
                setBookedSlots([]);
                return;
            }

            setIsLoadingSlots(true);
            try {
                const res = await fetch(
                    `/api/appointments/booked?date=${encodeURIComponent(
                        selectedDate
                    )}&facilityId=${encodeURIComponent(facility.id)}`,
                    { cache: "no-store" }
                );

                const json = await res.json();
                if (!res.ok) {
                    throw new Error(json?.error || "Failed to load schedule");
                }

                const slots: string[] = Array.isArray(json) ? json : [];
                setBookedSlots(
                    slots.map((s) => normalizeTime(s.split(" - ")[0] ?? ""))
                );
            } catch (error) {
                console.error("Error fetching slots:", error);
                toast.error("Error loading schedule");
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchBookedSlots();
    }, [selectedDate, facility, isOpen]);

    const handleBooking = async () => {
        if (!facility || !selectedDate || !selectedSlot) {
            toast.error("Please select date and time slot");
            return;
        }

        if (reason.trim().length === 0) {
            toast.error("Please provide a reason for your visit");
            return;
        }

        setIsBooking(true);
        const [startTime, endTimeRaw] = selectedSlot.split(" - ");
        const endTime = endTimeRaw || "";
        const normalizedStartTime = normalizeTime(startTime);

        const bookingPromise = (async () => {
            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    facility_id: facility.id,
                    appointment_date: selectedDate,
                    start_time: startTime,
                    end_time: endTime,
                    reason_for_visit: reason,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setBookedSlots((prev) => [...prev, normalizedStartTime]);
                    setSelectedSlot(null);
                }
                throw new Error(result.error || "Failed to book appointment");
            }

            return result;
        })();

        toast.promise(bookingPromise, {
            loading: "Booking appointment...",
            success: `Appointment booked for ${formatDate(selectedDate)} at ${selectedSlot}`,
            error: (error) =>
                error instanceof Error ? error.message : "Booking failed",
        });

        try {
            await bookingPromise;
            setBookedSlots((prev) => [...prev, normalizedStartTime]);

            onOpenChange(false);
            setSelectedDate("");
            setSelectedSlot(null);
            setReason("");
        } catch (err: unknown) {
            console.error(err);
        } finally {
            setIsBooking(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, "EEEE, MMMM d, yyyy");
        } catch {
            return dateString;
        }
    };

    const getFormattedSelectedDate = () => {
        if (!selectedDate) return "";
        const date = new Date(selectedDate);
        return format(date, "MMM dd, yyyy");
    };

    const isSlotBooked = (slotString: string) => {
        const rawStart = slotString.split(" - ")[0];
        const normalizedSlot = normalizeTime(rawStart);
        return bookedSlots.includes(normalizedSlot);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg w-full p-0 bg-background border-border">
                {/* Header Section */}
                <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
                    <SheetHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-xl font-semibold text-foreground">
                                Book Appointment
                            </SheetTitle>
                            <Badge variant="outline" className="gap-2">
                                <Clock className="w-3 h-3" />
                                {facility?.slots?.length || 0} slots
                            </Badge>
                        </div>
                        <SheetDescription className="text-base text-muted-foreground">
                            Schedule your visit at {facility?.name}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Facility Info Card */}
                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {facility?.name}
                                        </h3>
                                        <p className="text-base text-muted-foreground mt-1">
                                            {facility?.address}
                                        </p>
                                    </div>
                                    {facility?.phone && (
                                        <div className="flex items-center gap-2 text-base text-muted-foreground">
                                            <Phone className="w-3 h-3" />
                                            <span>{facility.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 1: Date Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-primary" />
                            <Label className="text-base font-medium text-foreground">
                                Select Date
                            </Label>
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full h-11 justify-start text-left font-normal",
                                        selectedDate &&
                                            "border-primary bg-primary/5"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        <span className="font-medium">
                                            {formatDate(selectedDate)}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Choose a date
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={
                                        selectedDate
                                            ? new Date(selectedDate)
                                            : undefined
                                    }
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(
                                                format(date, "yyyy-MM-dd")
                                            );
                                            setSelectedSlot(null);
                                        }
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date <= today;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Step 2: Time Slots */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <Label className="text-base font-medium text-foreground">
                                    Time Slots
                                </Label>
                            </div>
                            {selectedDate && (
                                <Badge variant="secondary" className="text-base">
                                    {getFormattedSelectedDate()}
                                </Badge>
                            )}
                        </div>

                        {!selectedDate ? (
                            <div className="text-center py-8 border border-dashed rounded-lg">
                                <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-base text-muted-foreground">
                                    Select a date to see available slots
                                </p>
                            </div>
                        ) : isLoadingSlots ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                                <p className="text-base text-muted-foreground">
                                    Loading slots...
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {facility?.slots?.map((slot) => {
                                    const isBooked = isSlotBooked(slot);
                                    const isSelected = selectedSlot === slot;
                                    return (
                                        <button
                                            key={slot}
                                            onClick={() =>
                                                !isBooked &&
                                                setSelectedSlot(slot)
                                            }
                                            disabled={isBooked}
                                            className={cn(
                                                "p-3 rounded-lg border text-base transition-colors",
                                                isBooked
                                                    ? "border-muted bg-muted/20 text-muted-foreground cursor-not-allowed"
                                                    : isSelected
                                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                                    : "border-border hover:border-primary hover:bg-primary/5"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{slot}</span>
                                                {isBooked && (
                                                    <AlertCircle className="w-3 h-3 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 justify-end">
                                                <div
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        isBooked
                                                            ? "bg-destructive"
                                                            : isSelected
                                                            ? "bg-primary"
                                                            : "bg-chart-3"
                                                    )}
                                                />
                                                <span className="text-base text-muted-foreground">
                                                    {isBooked
                                                        ? "Booked"
                                                        : isSelected
                                                        ? "Selected"
                                                        : "Available"}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Reason Input */}
                    {selectedSlot && (
                        <div className="space-y-3 animate-in fade-in">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <Label className="text-base font-medium text-foreground">
                                    Reason for Visit
                                </Label>
                            </div>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Briefly describe why you are visiting..."
                                className="min-h-[80px] resize-none"
                            />
                        </div>
                    )}

                    {/* Booking Summary */}
                    {selectedDate && selectedSlot && (
                        <Card className="bg-muted/30">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <h4 className="text-base font-medium text-foreground">
                                        Appointment Summary
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-base">
                                        <div>
                                            <p className="text-muted-foreground">
                                                Date
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(selectedDate)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">
                                                Time
                                            </p>
                                            <p className="font-medium">
                                                {selectedSlot}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
                    <SheetFooter className="flex flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                setSelectedDate("");
                                setSelectedSlot(null);
                                setReason("");
                            }}
                            className="flex-1"
                            disabled={isBooking}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBooking}
                            disabled={
                                !selectedDate ||
                                !selectedSlot ||
                                !reason.trim() ||
                                isBooking
                            }
                            className="flex-1"
                        >
                            {isBooking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}
