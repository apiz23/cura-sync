"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    Calendar,
    RotateCcw,
    Mountain,
    Hospital,
    Stethoscope,
    Building,
    Heart,
    Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import PageTitle from "@/components/page-title";
import { AnimatePresence, motion, useReducedMotion, type Easing } from "framer-motion";

type Facility = {
    id: string;
    name: string;
    address: string;
    type: string | null;
    latitude: string | null;
    longitude: string | null;
    distance?: number;
};

const SMOOTH_EASE: Easing = [0.16, 1, 0.3, 1];

function useUserLocation() {
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation not supported");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation([pos.coords.longitude, pos.coords.latitude]),
            (err) => {
                setError(err.message);
                setLocation([103.8198, 1.3521]);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    }, []);

    return { location, error };
}

function Map3DController() {
    const { map, isLoaded } = useMap();
    const [is3D, setIs3D] = useState(false);
    const reduced = useReducedMotion();

    if (!isLoaded) return null;

    return (
        <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: SMOOTH_EASE }}
            className="absolute bottom-4 left-14 z-10"
        >
            <div className="flex gap-1 rounded-lg border border-border bg-card/90 p-1 shadow-sm backdrop-blur-md dark:border-border dark:bg-background/90">
                <Button
                    size="sm"
                    variant={is3D ? "default" : "ghost"}
                    onClick={() => {
                        map?.easeTo({ pitch: 60, bearing: -20, duration: 1500 });
                        setIs3D(true);
                    }}
                    className="h-7 px-2.5 text-xs"
                >
                    <Mountain className="mr-1 size-3" />
                    3D
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                        map?.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
                        setIs3D(false);
                    }}
                    className="h-7 px-2.5 text-xs"
                >
                    <RotateCcw className="mr-1 size-3" />
                    Reset
                </Button>
            </div>
        </motion.div>
    );
}

// Muted pastels for list items (minimalist-ui spec)
function getFacilityPastel(type: string | null): { bg: string; text: string } {
    if (type?.toLowerCase().includes("hospital"))
        return { bg: "bg-primary/10", text: "text-primary" };
    if (type?.toLowerCase().includes("clinic"))
        return { bg: "bg-chart-2/10", text: "text-chart-2" };
    if (type?.toLowerCase().includes("specialist"))
        return { bg: "bg-destructive/10", text: "text-destructive" };
    return { bg: "bg-chart-5/10", text: "text-chart-5" };
}

// Bright saturated colors for map markers (visibility on map tiles)
function getFacilityMarkerColor(type: string | null): string {
    if (type?.toLowerCase().includes("hospital")) return "bg-chart-3";
    if (type?.toLowerCase().includes("clinic")) return "bg-chart-2";
    if (type?.toLowerCase().includes("specialist")) return "bg-destructive/100";
    return "bg-chart-5";
}

function FacilityIcon({ type, className = "size-4" }: { type: string | null; className?: string }) {
    if (type?.toLowerCase().includes("hospital"))
        return <Hospital className={className} />;
    if (type?.toLowerCase().includes("clinic"))
        return <Stethoscope className={className} />;
    if (type?.toLowerCase().includes("specialist"))
        return <Heart className={className} />;
    return <Building className={className} />;
}

function LoadingSkeleton() {
    return (
        <div className="public-grid-page px-4 pb-16 pt-20">
            <div className="public-page-content mx-auto max-w-7xl space-y-8 pt-8">
                <div className="space-y-2">
                    <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
                    <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
                </div>
                <div className="h-8 w-72 animate-pulse rounded-md bg-muted" />
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="relative h-[500px] overflow-hidden rounded-xl border border-border bg-muted">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 w-3/4 rounded-md bg-muted" />
                                    <div className="h-3 w-1/2 rounded-md bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const FACILITY_TYPES = [
    { value: "all", label: "All facilities", icon: MapPin },
    { value: "hospital", label: "Hospitals", icon: Hospital },
    { value: "clinic", label: "Clinics", icon: Stethoscope },
    { value: "specialist", label: "Specialists", icon: Heart },
] as const;

export default function FacilitiesMapPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>("all");
    const { location: userLocation, error: locationError } = useUserLocation();
    const reduced = useReducedMotion();

    useEffect(() => {
        async function loadFacilities() {
            try {
                const res = await fetch("/api/facility");
                if (!res.ok) throw new Error("Failed to fetch facilities");
                const json = await res.json();
                setFacilities(Array.isArray(json.facility) ? json.facility : []);
            } catch (err) {
                console.error(err);
                setFacilities([]);
            } finally {
                setLoading(false);
            }
        }
        loadFacilities();
    }, []);

    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
        return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
    }

    const facilitiesWithDistance = useMemo(() => {
        if (!userLocation) return facilities;
        return facilities.map((f) => {
            if (!f.latitude || !f.longitude) return f;
            return {
                ...f,
                distance: calculateDistance(
                    userLocation[1], userLocation[0],
                    parseFloat(f.latitude), parseFloat(f.longitude),
                ),
            };
        });
    }, [facilities, userLocation]);

    const filteredFacilities = useMemo(() => {
        let list = [...facilitiesWithDistance];
        if (selectedType !== "all")
            list = list.filter((f) => f.type?.toLowerCase().includes(selectedType));
        if (userLocation) {
            list.sort((a, b) => {
                if (a.distance && b.distance) return a.distance - b.distance;
                return a.distance ? -1 : 1;
            });
        }
        return list;
    }, [facilitiesWithDistance, userLocation, selectedType]);

    if (loading) return <LoadingSkeleton />;

    const center = userLocation || [103.8198, 1.3521];

    const fadeUp = (delay = 0) =>
        reduced
            ? {}
            : {
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.5, ease: SMOOTH_EASE, delay },
              };

    return (
        <div className="public-grid-page px-4 pb-20 pt-20">
            <PageTitle title="Facilities" />
            <div className="public-page-content mx-auto max-w-7xl space-y-7 pt-8">

                {/* Header */}
                <motion.div {...fadeUp(0)} className="public-text-panel flex flex-col gap-3 p-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                            Find a facility
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {filteredFacilities.length > 0
                                ? `${filteredFacilities.length} healthcare facilit${filteredFacilities.length === 1 ? "y" : "ies"}`
                                : "No facilities found"}
                            {userLocation && filteredFacilities.length > 0 ? " — sorted by distance" : ""}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {locationError && (
                            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                Using default location
                            </Badge>
                        )}
                        {userLocation && !locationError && (
                            <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                                <Navigation className="h-3 w-3" />
                                Live location
                            </Badge>
                        )}
                    </div>
                </motion.div>

                {/* Type filter */}
                <motion.div {...fadeUp(0.08)} className="flex flex-wrap gap-2">
                    {FACILITY_TYPES.map(({ value, label, icon: Icon }) => {
                        const active = selectedType === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setSelectedType(value)}
                                className={[
                                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                                    active
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground dark:border-border",
                                ].join(" ")}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Map + list */}
                <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">

                    {/* Map */}
                    <motion.div {...fadeUp(0.14)}>
                        <Card className="py-0 overflow-hidden border border-border shadow-sm rounded-xl dark:border-border">
                            <div className="relative h-[500px] lg:h-[560px]">
                                <Map center={center} zoom={14}>
                                    <Map3DController />
                                    <MapControls position="bottom-left" showZoom showCompass showLocate />

                                    {userLocation && (
                                        <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
                                            <MarkerContent>
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-card bg-primary/20 shadow-md">
                                                    <motion.div
                                                        animate={reduced ? {} : { scale: [1, 1.15, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                                                    >
                                                        <Navigation className="size-3 text-primary-foreground" />
                                                    </motion.div>
                                                </div>
                                            </MarkerContent>
                                            <MarkerTooltip>Your Location</MarkerTooltip>
                                        </MapMarker>
                                    )}

                                    {filteredFacilities.map((facility, idx) => {
                                        if (!facility.latitude || !facility.longitude) return null;
                                        const markerColor = getFacilityMarkerColor(facility.type);
                                        return (
                                            <MapMarker
                                                key={facility.id}
                                                longitude={Number(facility.longitude)}
                                                latitude={Number(facility.latitude)}
                                            >
                                                <MarkerContent>
                                                    <motion.div
                                                        initial={reduced ? false : { scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: idx * 0.025, duration: 0.3, ease: SMOOTH_EASE }}
                                                        className="cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                                                    >
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-card shadow-md ${markerColor}`}>
                                                            <FacilityIcon type={facility.type} className="size-4 text-primary-foreground" />
                                                        </div>
                                                    </motion.div>
                                                </MarkerContent>

                                                <MarkerTooltip>{facility.name}</MarkerTooltip>

                                                <MarkerPopup className="p-0 w-[360px]">
                                                    <Card className="overflow-hidden border border-border shadow-md rounded-xl dark:border-border">
                                                        <CardContent className="p-0">
                                                            {/* Popup header */}
                                                            <div className="border-b border-border px-5 py-4 dark:border-border">
                                                                <div className="flex items-start gap-3">
                                                                    {(() => {
                                                                        const p = getFacilityPastel(facility.type);
                                                                        return (
                                                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${p.bg}`}>
                                                                                <FacilityIcon type={facility.type} className={`size-4 ${p.text}`} />
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-foreground truncate">{facility.name}</p>
                                                                        <div className="mt-0.5 flex items-center gap-2">
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {facility.type || "Healthcare Facility"}
                                                                            </span>
                                                                            {facility.distance && (
                                                                                <>
                                                                                    <span className="text-muted-foreground/30">·</span>
                                                                                    <span className="text-xs text-muted-foreground">{facility.distance} km</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Popup body */}
                                                            <div className="space-y-4 px-5 py-4">
                                                                <div className="flex items-start gap-2">
                                                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                                        {facility.address}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-9 flex-1 gap-1.5 border-border text-xs transition-colors duration-150 active:scale-[0.98] dark:border-border"
                                                                        onClick={() =>
                                                                            window.open(
                                                                                `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`,
                                                                                "_blank",
                                                                            )
                                                                        }
                                                                    >
                                                                        <Navigation className="h-3.5 w-3.5" />
                                                                        Directions
                                                                    </Button>
                                                                    <Link href={`/user/appointments?facilityId=${facility.id}`} className="flex-1">
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-9 w-full gap-1.5 bg-secondary text-xs text-primary-foreground hover:bg-secondary/90 transition-colors duration-150 active:scale-[0.98] dark:bg-primary dark:hover:bg-primary/90"
                                                                        >
                                                                            <Calendar className="h-3.5 w-3.5" />
                                                                            Book appointment
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
                        </Card>
                    </motion.div>

                    {/* Facility list */}
                    <motion.div
                        {...fadeUp(0.18)}
                        className="flex flex-col gap-2 lg:max-h-[560px] lg:overflow-y-auto lg:pr-0.5"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredFacilities.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={reduced ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3, ease: SMOOTH_EASE }}
                                    className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 text-center dark:border-border"
                                >
                                    <Search className="h-6 w-6 text-muted-foreground/30" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">No facilities found</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">Try adjusting your filter</p>
                                    </div>
                                </motion.div>
                            ) : (
                                filteredFacilities.map((facility, idx) => {
                                    const p = getFacilityPastel(facility.type);
                                    return (
                                        <motion.div
                                            key={facility.id}
                                            layout
                                            initial={reduced ? false : { opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{
                                                duration: 0.4,
                                                ease: SMOOTH_EASE,
                                                delay: reduced ? 0 : idx * 0.04,
                                                layout: { duration: 0.25 },
                                            }}
                                        >
                                            <Card className="border border-border bg-background shadow-none transition-colors duration-150 hover:border-foreground/20 rounded-xl dark:border-border dark:hover:border-border/60">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${p.bg}`}>
                                                            <FacilityIcon type={facility.type} className={`size-3.5 ${p.text}`} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="truncate text-sm font-semibold text-foreground">
                                                                    {facility.name}
                                                                </p>
                                                                {facility.distance && (
                                                                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                                                        {facility.distance} km
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {facility.type && (
                                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                                    {facility.type}
                                                                </p>
                                                            )}
                                                            {facility.address && (
                                                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                                    {facility.address}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {facility.latitude && facility.longitude && (
                                                        <div className="mt-3 flex gap-2 border-t border-border pt-3 dark:border-border">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 flex-1 gap-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground active:scale-[0.98]"
                                                                onClick={() =>
                                                                    window.open(
                                                                        `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`,
                                                                        "_blank",
                                                                    )
                                                                }
                                                            >
                                                                <Navigation className="h-3.5 w-3.5" />
                                                                Directions
                                                            </Button>
                                                            <Link href={`/user/appointments?facilityId=${facility.id}`} className="flex-1">
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 w-full gap-1.5 bg-secondary text-xs text-primary-foreground hover:bg-secondary/90 transition-colors duration-150 active:scale-[0.98] dark:bg-primary dark:hover:bg-primary/90"
                                                                >
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                    Book
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
