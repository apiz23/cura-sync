"use client";

import { useState, useMemo, useEffect } from "react";
import supabase from "@/lib/supabase";
import {
    Map,
    MapLocateControl,
    MapMarker,
    MapTileLayer,
    MapZoomControl,
} from "@/components/ui/map";
import { LatLngExpression } from "leaflet";

import {
    Search,
    MapPin,
    Filter,
    Calendar,
    Star,
    Clock,
    Phone,
    Navigation,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Facility {
    id: string;
    name: string;
    type: string;
    specialty: string;
    address: string;
    is_active: boolean;
    phone?: string;
    rating?: number;
    wait_time?: number;
    slots?: string[];
    coordinates?: LatLngExpression;
}

export default function AppointmentPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
        null
    );
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from("cura_facilities")
                    .select("*")
                    .eq("is_active", true);

                if (error) throw error;

                const formattedData = (data || []).map((f) => ({
                    ...f,
                    phone: f.phone || "+1 (555) 123-4567",
                    rating: f.rating || Math.random() * 2 + 3,
                    wait_time:
                        f.wait_time || Math.floor(Math.random() * 30) + 5,
                    slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM"],
                    coordinates:
                        f.latitude && f.longitude
                            ? [parseFloat(f.latitude), parseFloat(f.longitude)]
                            : [3.139, 101.6869],
                }));

                setFacilities(formattedData);
            } catch (error) {
                console.error("Error fetching facilities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFacilities();
    }, []);

    const filteredFacilities = useMemo(() => {
        return facilities.filter(
            (f) =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, facilities]);

    const openMaps = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            address
        )}`;
        window.open(url, "_blank");
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="min-h-screen bg-background">
            <div className="px-4 py-8">
                {/* Search Section */}
                <Card className="p-6 mb-8 shadow-lg border-border/50 bg-card">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, specialty, type, or location..."
                                className="pl-10 h-14 text-base bg-background shadow-sm border-2 border-input focus:border-ring/50 transition-colors font-sans"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 w-full lg:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="gap-2 flex-1 lg:flex-none border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>

                            <Tabs
                                value={viewMode}
                                onValueChange={(v) =>
                                    setViewMode(v as "grid" | "map")
                                }
                                className="w-auto"
                            >
                                <TabsList className="grid w-full grid-cols-2 bg-muted border-border">
                                    <TabsTrigger
                                        value="grid"
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    >
                                        Grid
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="map"
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    >
                                        Map
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </Card>

                {/* Facility List/Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card
                                key={i}
                                className="overflow-hidden border-border bg-card"
                            >
                                <CardContent className="p-0">
                                    <Skeleton className="h-48 w-full bg-muted" />
                                    <div className="p-6 space-y-4">
                                        <Skeleton className="h-6 w-3/4 bg-muted" />
                                        <Skeleton className="h-4 w-1/2 bg-muted" />
                                        <Skeleton className="h-4 w-full bg-muted" />
                                        <Skeleton className="h-4 w-full bg-muted" />
                                        <div className="flex gap-2 pt-4">
                                            <Skeleton className="h-10 flex-1 bg-muted" />
                                            <Skeleton className="h-10 flex-1 bg-muted" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFacilities.map((facility) => (
                            <Card
                                key={facility.id}
                                className="group hover:shadow-xl transition-all duration-300 border-border bg-card overflow-hidden  pt-0"
                            >
                                <CardContent className="p-0">
                                    {/* Map Preview */}
                                    <div className="min-h-[20vh] relative overflow-hidden bg-muted">
                                        <Map
                                            center={facility.coordinates!}
                                            zoom={15}
                                            className="h-full w-full"
                                        >
                                            <MapTileLayer />
                                            <MapLocateControl />
                                            <MapZoomControl />
                                            <MapMarker
                                                position={facility.coordinates!}
                                            />
                                        </Map>
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 font-medium font-sans">
                                                {facility.type}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Facility Info */}
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 font-sans">
                                                    {facility.name}
                                                </h3>
                                            </div>
                                            <p className="text-primary font-semibold text-lg mb-3 font-sans">
                                                {facility.specialty}
                                            </p>

                                            {/* Rating and Wait Time */}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-medium font-sans">
                                                        {facility.rating?.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="font-sans">
                                                        {facility.wait_time} min
                                                        wait
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span className="line-clamp-2 font-sans">
                                                    {facility.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-6 pt-0 flex gap-3">
                                    <Button
                                        className="flex-1 h-11 font-medium font-sans"
                                        onClick={() => {
                                            setSelectedFacility(facility);
                                            setIsBookingOpen(true);
                                        }}
                                    >
                                        Book Appointment
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-11 w-11 shrink-0 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                                        onClick={() =>
                                            openMaps(facility.address)
                                        }
                                        title="Get directions"
                                    >
                                        <Navigation className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-6 border-border bg-card">
                        <div className="h-[600px] rounded-lg overflow-hidden">
                            <Map
                                center={[3.139, 101.6869]}
                                zoom={11}
                                className="h-full w-full"
                            >
                                <MapTileLayer />
                                <MapLocateControl />
                                <MapZoomControl />
                                {filteredFacilities.map((facility) => (
                                    <MapMarker
                                        key={facility.id}
                                        position={facility.coordinates!}
                                    />
                                ))}
                            </Map>
                        </div>
                    </Card>
                )}
            </div>

            {/* Booking Modal */}
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogContent className="sm:max-w-[500px] bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-foreground font-sans">
                            Book Appointment
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground font-sans">
                            Schedule your visit at{" "}
                            <span className="font-semibold text-primary">
                                {selectedFacility?.name}
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {selectedFacility && (
                            <>
                                {/* Map Preview */}
                                <Card className="overflow-hidden border-border py-0">
                                    <div className="h-96 relative">
                                        <Map
                                            center={
                                                selectedFacility.coordinates!
                                            }
                                            zoom={15}
                                            className="h-full w-full"
                                        >
                                            <MapTileLayer />
                                            <MapZoomControl />
                                            <MapMarker
                                                position={
                                                    selectedFacility.coordinates!
                                                }
                                            />
                                        </Map>
                                    </div>
                                </Card>

                                {/* Facility Info */}
                                <Card className="bg-accent border-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                                <MapPin className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-foreground truncate font-sans">
                                                    {selectedFacility.name}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-sans">
                                                    {selectedFacility.address}
                                                </p>
                                                {selectedFacility.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 font-sans">
                                                        <Phone className="h-3 w-3" />
                                                        {selectedFacility.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground font-sans">
                                Select Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="date"
                                    className="pl-10 h-12 text-base bg-background border-input focus:border-ring font-sans"
                                    value={selectedDate}
                                    min={today}
                                    onChange={(e) =>
                                        setSelectedDate(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground font-sans">
                                Available Time Slots
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {selectedFacility?.slots?.map((slot) => (
                                    <Button
                                        key={slot}
                                        variant={
                                            selectedSlot === slot
                                                ? "default"
                                                : "outline"
                                        }
                                        size="lg"
                                        onClick={() => setSelectedSlot(slot)}
                                        className="justify-center py-3 h-auto font-sans border-border"
                                    >
                                        {slot}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsBookingOpen(false)}
                            className="flex-1 border-border text-foreground hover:bg-accent hover:text-accent-foreground font-sans"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                alert(
                                    `Appointment booked at ${selectedFacility?.name} for ${selectedDate} at ${selectedSlot}`
                                );
                                setIsBookingOpen(false);
                                setSelectedDate("");
                                setSelectedSlot(null);
                            }}
                            disabled={!selectedDate || !selectedSlot}
                            className="flex-1 font-sans"
                            size="lg"
                        >
                            Confirm Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
