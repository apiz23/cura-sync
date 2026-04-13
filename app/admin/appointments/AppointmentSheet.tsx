"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    Clock,
    User,
    Building2,
    FileText,
    Save,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Appointment } from "@/app/types";
import Image from "next/image";

interface AppointmentSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
    onUpdated: (updated: Appointment) => void;
}

export function AppointmentSheet({
    open,
    onOpenChange,
    appointment,
    onUpdated,
}: AppointmentSheetProps) {
    const [status, setStatus] = useState<Appointment["status"]>("PENDING");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (appointment) {
            setStatus(appointment.status);
            setReason(appointment.reason_for_visit || "");
        }
    }, [appointment]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, "MMMM d, yyyy");
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeString: string) => {
        try {
            const [hours, minutes] = timeString.split(":");
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return timeString;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-500/10 text-green-700 border-green-200";
            case "CANCELLED":
                return "bg-red-500/10 text-red-700 border-red-200";
            case "PENDING":
                return "bg-amber-500/10 text-amber-700 border-amber-200";
            case "COMPLETED":
                return "bg-blue-500/10 text-blue-700 border-blue-200";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-200";
        }
    };

    async function handleSave() {
        if (!appointment) return;

        try {
            setSaving(true);

            const response = await fetch(`/api/appointments/${appointment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    reason_for_visit: reason,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error || "Failed to update appointment");
            }

            const updated: Appointment = {
                ...appointment,
                status,
                reason_for_visit: reason,
            };

            toast.success("Appointment updated successfully");
            onUpdated(updated);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update appointment");
        } finally {
            setSaving(false);
        }
    }

    if (!appointment) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
                        <SheetHeader className="text-left">
                            <div className="flex items-center justify-between">
                                <div>
                                    <SheetTitle className="text-xl">
                                        Appointment Details
                                    </SheetTitle>
                                    <SheetDescription className="mt-1">
                                        View and manage appointment information
                                    </SheetDescription>
                                </div>
                                <Badge
                                    className={getStatusColor(
                                        appointment.status
                                    )}
                                >
                                    {appointment.status}
                                </Badge>
                            </div>
                        </SheetHeader>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        {/* Appointment ID */}
                        <div className="text-sm text-muted-foreground">
                            Appointment ID:{" "}
                            <span className="font-mono">
                                {appointment.id.slice(0, 8)}...
                            </span>
                        </div>

                        {/* Patient Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">
                                Patient Information
                            </h3>
                            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    {appointment.patient_avatar ? (
                                        <Image
                                            src={appointment.patient_avatar}
                                            alt={appointment.patient_name}
                                            width={40}
                                            height={40}
                                            className="h-full w-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="w-4 h-4 text-muted-foreground" />
                                    )}{" "}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        {appointment.patient_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Patient ID:{" "}
                                        {appointment.profile_id?.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Appointment Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">
                                Appointment Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Facility
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium">
                                            {appointment.facility_name}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Date
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium">
                                            {formatDate(
                                                appointment.appointment_date
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Start Time
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium">
                                            {formatTime(appointment.start_time)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        End Time
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium">
                                            {formatTime(appointment.end_time)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Status & Reason */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label>Appointment Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(v) =>
                                        setStatus(v as Appointment["status"])
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
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

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <Label>Reason for Visit</Label>
                                </div>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for visit..."
                                    className="min-h-[100px] resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 border-t bg-background px-6 py-4">
                        <SheetFooter className="flex flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={saving}
                                className="flex-1"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
