"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Map,
    useMap,
    MapControls,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
} from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Navigation,
    Clock,
    Phone,
    Calendar,
    RotateCcw,
    Mountain,
    Hospital,
    Stethoscope,
    Building,
    Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import PageTitle from "@/components/page-title";

type Facility = {
    id: string;
    name: string;
    address: string;
    type: string | null;
    latitude: string | null;
    longitude: string | null;
    distance?: number;
};

function useUserLocation() {
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation([
                    position.coords.longitude,
                    position.coords.latitude,
                ]);
            },
            (err) => {
                setError(err.message);
                setLocation([103.8198, 1.3521]);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    return { location, error };
}

function Map3DController() {
    const { map, isLoaded } = useMap();
    const [is3D, setIs3D] = useState(false);

    const handle3DView = () => {
        map?.easeTo({
            pitch: 60,
            bearing: -20,
            duration: 1500,
        });
        setIs3D(true);
    };

    const handleReset = () => {
        map?.easeTo({
            pitch: 0,
            bearing: 0,
            duration: 1000,
        });
        setIs3D(false);
    };

    if (!isLoaded) return null;

    return (
        <div className="absolute bottom-4 left-15 z-10 flex flex-col gap-2">
            <div className="flex gap-2 shadow-md rounded-md bg-background/80 backdrop-blur-sm p-1.5 border border-border/50">
                <Button
                    size="sm"
                    variant={is3D ? "secondary" : "ghost"}
                    onClick={handle3DView}
                    className="h-8 px-3 text-xs"
                >
                    <Mountain className="size-3.5 mr-1.5" />
                    3D View
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleReset}
                    className="h-8 px-3 text-xs"
                >
                    <RotateCcw className="size-3.5 mr-1.5" />
                    Reset
                </Button>
            </div>
        </div>
    );
}

export default function FacilitiesMapPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const { location: userLocation, error: locationError } = useUserLocation();

    useEffect(() => {
        async function loadFacilities() {
            try {
                const res = await fetch("/api/facility");
                if (!res.ok) throw new Error("Failed to fetch facilities");

                const json = await res.json();

                const facilities: Facility[] = Array.isArray(json.facility)
                    ? json.facility
                    : [];

                setFacilities(facilities);
            } catch (err) {
                console.error(err);
                setFacilities([]);
            } finally {
                setLoading(false);
            }
        }

        loadFacilities();
    }, []);

    const facilitiesWithDistance = useMemo(() => {
        if (!userLocation) return facilities;

        return facilities.map((facility) => {
            if (!facility.latitude || !facility.longitude) return facility;

            const distance = calculateDistance(
                userLocation[1],
                userLocation[0],
                parseFloat(facility.latitude),
                parseFloat(facility.longitude)
            );

            return { ...facility, distance };
        });
    }, [facilities, userLocation]);

    function calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    }

    const filteredFacilities = useMemo(() => {
        const sorted = [...facilitiesWithDistance];

        if (userLocation) {
            sorted.sort((a, b) => {
                if (a.distance && b.distance) return a.distance - b.distance;
                if (a.distance) return -1;
                if (b.distance) return 1;
                return 0;
            });
        }

        return sorted;
    }, [facilitiesWithDistance, userLocation]);

    function FacilityIcon({
        type,
        className = "size-5",
    }: {
        type: string | null;
        className?: string;
    }) {
        if (type?.toLowerCase().includes("hospital")) {
            return (
                <Hospital className={`${className} text-primary-foreground`} />
            );
        }
        if (type?.toLowerCase().includes("clinic")) {
            return (
                <Stethoscope
                    className={`${className} text-accent-foreground`}
                />
            );
        }
        if (type?.toLowerCase().includes("specialist")) {
            return (
                <Heart className={`${className} text-destructive-foreground`} />
            );
        }
        return (
            <Building className={`${className} text-secondary-foreground`} />
        );
    }

    function getFacilityColor(type: string | null) {
        if (type?.toLowerCase().includes("hospital")) {
            return "bg-primary";
        }
        if (type?.toLowerCase().includes("clinic")) {
            return "bg-accent";
        }
        if (type?.toLowerCase().includes("specialist")) {
            return "bg-destructive";
        }
        return "bg-secondary";
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                    <div>
                        <p className="text-lg font-semibold text-foreground">
                            Loading Healthcare Facilities
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Discovering medical services in your area
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const center = userLocation || [103.8198, 1.3521];

    return (
        <div className="h-screen w-full bg-background flex flex-col">
            <PageTitle title={"Facility"} />
            {/* Map View */}
            <div className="flex-1 relative">
                {locationError ? (
                    <div className="absolute left-4 right-4 top-4 z-20 rounded-xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur-sm md:left-auto md:right-4 md:w-[360px]">
                        <p className="font-medium text-foreground">
                            Using default map location
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Live geolocation was unavailable, so the map is using a fallback center. You can still browse facilities normally.
                        </p>
                    </div>
                ) : null}
                <Map center={center} zoom={14}>
                    {/* 3D Controls */}
                    <Map3DController />

                    {/* Standard Controls */}
                    <MapControls
                        position="bottom-left"
                        showZoom
                        showCompass
                        showLocate
                    />

                    {/* User Location Marker */}
                    {userLocation && (
                        <MapMarker
                            longitude={userLocation[0]}
                            latitude={userLocation[1]}
                        >
                            <MarkerContent>
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 border-4 border-background shadow-xl animate-pulse flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                                            <Navigation className="size-4 text-primary-foreground" />
                                        </div>
                                    </div>
                                </div>
                            </MarkerContent>
                            <MarkerTooltip>Your Location</MarkerTooltip>
                        </MapMarker>
                    )}

                    {/* Facility Markers */}
                    {filteredFacilities.map((facility) => {
                        if (!facility.latitude || !facility.longitude)
                            return null;

                        const colorClass = getFacilityColor(facility.type);

                        return (
                            <MapMarker
                                key={facility.id}
                                longitude={Number(facility.longitude)}
                                latitude={Number(facility.latitude)}
                            >
                                <MarkerContent>
                                    <div className="relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95">
                                        <div
                                            className={`relative w-16 h-16 rounded-2xl border-4 border-background shadow-xl flex items-center justify-center transform transition-all ${colorClass}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                                <FacilityIcon
                                                    type={facility.type}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </MarkerContent>

                                <MarkerTooltip>{facility.name}</MarkerTooltip>

                                <MarkerPopup className="p-0 w-[420px]">
                                    <Card className="border-border/50 shadow-2xl overflow-hidden backdrop-blur-sm bg-card/95 p-0">
                                        <CardContent className="p-0">
                                            {/* Popup Header with Gradient */}
                                            <div
                                                className={`p-6 ${colorClass
                                                    .replace("bg-", "from-")
                                                    .replace(
                                                        " text-",
                                                        " to-"
                                                    )} bg-linear-to-br`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div
                                                                className={`p-4 rounded-xl ${colorClass} shadow-lg`}
                                                            >
                                                                <FacilityIcon
                                                                    type={
                                                                        facility.type
                                                                    }
                                                                    className="size-6"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-xl text-white">
                                                                    {
                                                                        facility.name
                                                                    }
                                                                </h3>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="mt-2 bg-white/20 text-white border-white/30"
                                                                >
                                                                    {facility.type ||
                                                                        "Healthcare Facility"}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {/* Quick Stats */}
                                                        <div className="flex items-center gap-4 mt-4">
                                                            {facility.distance && (
                                                                <div className="flex items-center gap-2">
                                                                    <Navigation className="size-4 text-white/80" />
                                                                    <span className="text-white font-semibold">
                                                                        {
                                                                            facility.distance
                                                                        }{" "}
                                                                        km
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <Badge className="bg-white/20 text-white border-white/30 gap-2">
                                                                <Clock className="size-3" />
                                                                Location available
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Popup Content */}
                                            <div className="p-6 space-y-6">
                                                {/* Address */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="size-5 text-primary" />
                                                        <p className="text-sm font-medium text-foreground">
                                                            Address
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground pl-8">
                                                        {facility.address}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                                                    Only verified facility fields from the current database are shown here. Waiting times and service lists are not displayed unless they are stored in the system.
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 gap-3 h-11"
                                                        onClick={() => {
                                                            const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
                                                            window.open(
                                                                url,
                                                                "_blank"
                                                            );
                                                        }}
                                                    >
                                                        <Navigation className="size-4" />
                                                        Get Directions
                                                    </Button>
                                                    <Link
                                                        href={`/user/appointments?facilityId=${facility.id}`}
                                                        className="flex-1"
                                                    >
                                                        <Button className="w-full gap-3 h-11 bg-primary hover:bg-primary/90">
                                                            <Calendar className="size-4" />
                                                            Book Appointment
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </MarkerPopup>
                            </MapMarker>
                        );
                    })}
                </Map>
            </div>
        </div>
    );
}
