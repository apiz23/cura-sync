"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/authprovideradmin";
import {
    Building2,
    MapPin,
    Globe,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock,
    ChevronRight,
    Info,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
} from "@/components/ui/map";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Facility, FacilitySchedule } from "@/app/types";

export default function EditFacilityPage() {
    const { user, loading: authLoading } = useAuth();
    const [facility, setFacility] = useState<Facility | null>(null);
    const [schedules, setSchedules] = useState<FacilitySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchFacilityData = useCallback(async () => {
        if (!user?.facility_id) return;

        setLoading(true);

        try {
            const res = await fetch("/api/facility/me");
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to load facility data");
            }

            setFacility(data.facility);
            setSchedules(data.schedules || []);
        } catch (error) {
            toast.error("Failed to load facility data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user?.facility_id]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error("Not authenticated");
            return;
        }

        if (!user.facility_id) {
            toast.error("No facility assigned");
            return;
        }

        fetchFacilityData();
    }, [authLoading, user, fetchFacilityData]);

    const handleSave = async () => {
        if (!facility) return;

        setSaving(true);

        try {
            const facilityRes = await fetch("/api/facility", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: facility.id,
                    name: facility.name,
                    type: facility.type,
                    specialty: facility.specialty,
                    address: facility.address,
                    latitude: facility.latitude,
                    longitude: facility.longitude,
                    is_active: facility.is_active,
                }),
            });

            const facilityResult = await facilityRes.json();
            if (!facilityRes.ok) {
                throw new Error(
                    facilityResult?.error || "Failed to update facility"
                );
            }

            const scheduleRes = await fetch("/api/facility/schedule", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    facility_id: facility.id,
                    schedules: schedules.map((s) => ({
                        day_of_week: s.day_of_week,
                        start_time: s.start_time,
                        end_time: s.end_time,
                        slot_duration_minutes: s.slot_duration_minutes ?? null,
                        break_start: s.break_start ?? null,
                        break_end: s.break_end ?? null,
                    })),
                }),
            });

            const scheduleResult = await scheduleRes.json();
            if (!scheduleRes.ok) {
                throw new Error(
                    scheduleResult?.error || "Failed to update schedules"
                );
            }

            toast.success("Facility updated successfully", {
                description: "Changes have been saved",
                icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            });

            fetchFacilityData();
        } catch (error: unknown) {
            let message = "Something went wrong";

            if (error instanceof Error) {
                message = error.message;
            }

            toast.error("Failed to update facility", {
                description: message,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleScheduleChange = <K extends keyof FacilitySchedule>(
        index: number,
        field: K,
        value: FacilitySchedule[K]
    ) => {
        const updatedSchedules = [...schedules];
        updatedSchedules[index] = {
            ...updatedSchedules[index],
            [field]: value,
        };
        setSchedules(updatedSchedules);
    };

    const addSchedule = () => {
        const newSchedule: FacilitySchedule = {
            id: `temp-${Date.now()}`,
            facility_id: facility!.id,
            day_of_week: 0,
            start_time: "09:00",
            end_time: "17:00",
            slot_duration_minutes: 30,
            break_start: null,
            break_end: null,
        };
        setSchedules([...schedules, newSchedule]);
    };

    const removeSchedule = (index: number) => {
        const updatedSchedules = schedules.filter((_, i) => i !== index);
        setSchedules(updatedSchedules);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="space-y-6">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !facility) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">
                            Access Restricted
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {!user
                                ? "Please log in to continue"
                                : "No facility assigned to your account"}
                        </p>
                        <Button variant="outline">Return to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    return (
        <div className="min-h-screen p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {facility.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        variant={
                                            facility.is_active
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="gap-1"
                                    >
                                        {facility.is_active ? (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                                Inactive
                                            </>
                                        )}
                                    </Badge>
                                    {facility.type && (
                                        <Badge variant="outline">
                                            {facility.type}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-muted-foreground">
                        Manage your healthcare facility information and settings
                    </p>
                </div>

                <Separator />

                {/* Facility Information Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">
                            Facility Information
                        </h2>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="name"
                                            className="mb-2 block font-medium"
                                        >
                                            Facility Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={facility.name}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="h-11"
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="type"
                                            className="mb-2 block font-medium"
                                        >
                                            Facility Type
                                        </Label>
                                        <Input
                                            id="type"
                                            placeholder="e.g., Hospital, Clinic"
                                            value={facility.type || ""}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    type: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="specialty"
                                            className="mb-2 block font-medium"
                                        >
                                            Specialty
                                        </Label>
                                        <Input
                                            id="specialty"
                                            placeholder="e.g., Cardiology"
                                            value={facility.specialty || ""}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    specialty: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="address"
                                            className="mb-2 block font-medium"
                                        >
                                            Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={facility.address}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    address: e.target.value,
                                                })
                                            }
                                            className="min-h-[140px]"
                                            placeholder="Enter full facility address"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div>
                                            <Label className="font-medium">
                                                Facility Status
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Show or hide facility to
                                                patients
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={facility.is_active}
                                                onCheckedChange={(checked) =>
                                                    setFacility({
                                                        ...facility,
                                                        is_active: checked,
                                                    })
                                                }
                                            />
                                            <span
                                                className={
                                                    facility.is_active
                                                        ? "text-green-600 font-medium"
                                                        : "text-muted-foreground"
                                                }
                                            >
                                                {facility.is_active
                                                    ? "Visible"
                                                    : "Hidden"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Location Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-semibold">
                                Location Details
                            </h2>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Globe className="w-4 h-4" />
                                    Full Map
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Facility Location</DialogTitle>
                                    <DialogDescription>
                                        Interactive map showing your facility
                                        location
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="h-[500px] w-full rounded-lg overflow-hidden">
                                    {facility.latitude && facility.longitude ? (
                                        <Map
                                            center={[
                                                parseFloat(
                                                    facility.longitude
                                                ) || -74.006,
                                                parseFloat(facility.latitude) ||
                                                    40.7128,
                                            ]}
                                            zoom={15}
                                        >
                                            <MapMarker
                                                longitude={parseFloat(
                                                    facility.longitude
                                                )}
                                                latitude={parseFloat(
                                                    facility.latitude
                                                )}
                                            >
                                                <MarkerContent>
                                                    <div className="size-10 rounded-full bg-primary border-4 border-white shadow-xl flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-white" />
                                                    </div>
                                                </MarkerContent>
                                                <MarkerTooltip>
                                                    {facility.name ||
                                                        "Your Facility"}
                                                </MarkerTooltip>
                                                <MarkerPopup>
                                                    <div className="space-y-2 p-2">
                                                        <div className="flex items-start gap-2">
                                                            <Building2 className="w-4 h-4 text-primary mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    {facility.name ||
                                                                        "Your Facility"}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {facility.address ||
                                                                        "No address set"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {facility.type && (
                                                            <Badge
                                                                variant="outline"
                                                                className="mt-1"
                                                            >
                                                                {facility.type}
                                                            </Badge>
                                                        )}
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Globe className="w-3 h-3" />
                                                            <span>
                                                                {parseFloat(
                                                                    facility.latitude
                                                                ).toFixed(6)}
                                                                ,{" "}
                                                                {parseFloat(
                                                                    facility.longitude
                                                                ).toFixed(6)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </MarkerPopup>
                                            </MapMarker>
                                        </Map>
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center bg-muted/30">
                                            <Globe className="w-16 h-16 text-muted-foreground mb-4" />
                                            <p className="text-lg font-medium text-muted-foreground">
                                                No coordinates set
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
                                                Add latitude and longitude in
                                                the form to view the map
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (
                                                facility.latitude &&
                                                facility.longitude
                                            ) {
                                                navigator.clipboard.writeText(
                                                    `${facility.latitude}, ${facility.longitude}`
                                                );
                                                toast.success(
                                                    "Coordinates copied to clipboard"
                                                );
                                            }
                                        }}
                                    >
                                        Copy Coordinates
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="latitude"
                                            className="mb-2 block font-medium"
                                        >
                                            Latitude
                                        </Label>
                                        <Input
                                            id="latitude"
                                            placeholder="e.g., 40.7128"
                                            value={facility.latitude || ""}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    latitude: e.target.value,
                                                })
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Decimal format (e.g., 40.7128)
                                        </p>
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="longitude"
                                            className="mb-2 block font-medium"
                                        >
                                            Longitude
                                        </Label>
                                        <Input
                                            id="longitude"
                                            placeholder="e.g., -74.0060"
                                            value={facility.longitude || ""}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    longitude: e.target.value,
                                                })
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Decimal format (e.g., -74.0060)
                                        </p>
                                    </div>

                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                        <Info className="w-4 h-4 text-primary mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium text-primary mb-1">
                                                How to get coordinates
                                            </p>
                                            <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                                                <li>Open Google Maps</li>
                                                <li>
                                                    Right-click your location
                                                </li>
                                                <li>
                                                    Select {"'"}What{"'"}s here?
                                                    {"'"}
                                                </li>
                                                <li>Copy coordinates</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="font-medium">
                                        Map Preview
                                    </Label>
                                    <div className="h-[300px] w-full rounded-lg overflow-hidden border">
                                        {facility.latitude &&
                                        facility.longitude ? (
                                            <Map
                                                center={[
                                                    parseFloat(
                                                        facility.longitude
                                                    ),
                                                    parseFloat(
                                                        facility.latitude
                                                    ),
                                                ]}
                                                zoom={14}
                                            >
                                                <MapMarker
                                                    longitude={parseFloat(
                                                        facility.longitude
                                                    )}
                                                    latitude={parseFloat(
                                                        facility.latitude
                                                    )}
                                                >
                                                    <MarkerContent>
                                                        <div className="size-8 rounded-full bg-primary border-3 border-white shadow-lg flex items-center justify-center">
                                                            <Building2 className="w-4 h-4 text-white" />
                                                        </div>
                                                    </MarkerContent>
                                                    <MarkerTooltip>
                                                        {facility.name ||
                                                            "Your Facility"}
                                                    </MarkerTooltip>
                                                </MapMarker>
                                            </Map>
                                        ) : (
                                            <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20">
                                                <MapPin className="w-12 h-12 text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground font-medium">
                                                    Enter coordinates
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Add latitude and longitude
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {facility.latitude &&
                                        facility.longitude && (
                                            <div className="text-center p-3 rounded-lg bg-muted/30">
                                                <p className="text-sm font-mono">
                                                    {parseFloat(
                                                        facility.latitude
                                                    ).toFixed(6)}
                                                    ,{" "}
                                                    {parseFloat(
                                                        facility.longitude
                                                    ).toFixed(6)}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Schedule Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-semibold">
                                Operating Schedule
                            </h2>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addSchedule}
                            className="gap-2"
                        >
                            Add Day
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            {schedules.length > 0 ? (
                                <div className="space-y-4">
                                    {schedules.map((schedule, index) => (
                                        <div
                                            key={schedule.id}
                                            className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <span className="font-semibold text-primary">
                                                            {schedule.day_of_week +
                                                                1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">
                                                            {
                                                                dayNames[
                                                                    schedule
                                                                        .day_of_week
                                                                ]
                                                            }
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Operating hours for
                                                            this day
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeSchedule(index)
                                                    }
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    ×
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <Label className="text-sm font-medium mb-2">
                                                            Day
                                                        </Label>
                                                        <Select
                                                            value={String(
                                                                schedule.day_of_week
                                                            )}
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleScheduleChange(
                                                                    index,
                                                                    "day_of_week",
                                                                    parseInt(value)
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select day" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {dayNames.map(
                                                                    (day, idx) => (
                                                                        <SelectItem
                                                                            key={idx}
                                                                            value={String(idx)}
                                                                        >
                                                                            {day}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium mb-2">
                                                            Start Time
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={schedule.start_time}
                                                            onChange={(e) =>
                                                                handleScheduleChange(
                                                                    index,
                                                                    "start_time",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-10"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium mb-2">
                                                            End Time
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={schedule.end_time}
                                                            onChange={(e) =>
                                                                handleScheduleChange(
                                                                    index,
                                                                    "end_time",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-10"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium mb-2">
                                                            Slot Duration (min)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={schedule.slot_duration_minutes}
                                                            onChange={(e) =>
                                                                handleScheduleChange(
                                                                    index,
                                                                    "slot_duration_minutes",
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                            min="5"
                                                            max="120"
                                                            className="h-10"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Break Time */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 border-t border-dashed border-border/60">
                                                    <div className="flex items-center gap-2 md:col-span-1">
                                                        <Clock className="h-4 w-4 text-amber-500" />
                                                        <span className="text-xs font-medium text-muted-foreground">Break Time</span>
                                                        <span className="text-xs text-muted-foreground">(optional)</span>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium mb-2">
                                                            Break Start
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={schedule.break_start ?? ""}
                                                            onChange={(e) =>
                                                                handleScheduleChange(
                                                                    index,
                                                                    "break_start",
                                                                    e.target.value || null
                                                                )
                                                            }
                                                            className="h-10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium mb-2">
                                                            Break End
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={schedule.break_end ?? ""}
                                                            onChange={(e) =>
                                                                handleScheduleChange(
                                                                    index,
                                                                    "break_end",
                                                                    e.target.value || null
                                                                )
                                                            }
                                                            className="h-10"
                                                        />
                                                    </div>
                                                    <div className="flex items-end pb-1">
                                                        {schedule.break_start && schedule.break_end && (
                                                            <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-md">
                                                                {schedule.break_start.slice(0, 5)} – {schedule.break_end.slice(0, 5)} blocked
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                        No schedule added
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                        Add operating hours for each day your
                                        facility is open
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={addSchedule}
                                    >
                                        Add First Day
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium">
                            Facility ID: {facility.id}
                        </p>
                        <p>
                            Created:{" "}
                            {new Date(facility.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex-1" />
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save All Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
