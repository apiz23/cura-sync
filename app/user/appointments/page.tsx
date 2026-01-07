"use client";

import { useState, useMemo, useEffect } from "react";
import supabase from "@/lib/supabase";
import {
    Search,
    MapPin,
    Filter,
    Star,
    Clock,
    Calendar,
    Users,
    X,
    Building,
    Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Facility {
    id: string;
    name: string;
    type?: string;
    specialty?: string;
    address: string;
    phone?: string;
    rating?: number;
    wait_time?: number;
    slots?: string[];
    coordinates?: [number, number];
    is_active?: boolean;
    description?: string;
    capacity?: number;
    distance?: number;
    services?: string[];
    doctors_count?: number;
}

export default function AppointmentPage() {
    const { user } = useUser();
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
                    slots: [
                        "09:00 AM",
                        "10:00 AM",
                        "11:00 AM",
                        "02:00 PM",
                        "03:00 PM",
                        "04:00 PM",
                    ],
                    coordinates:
                        f.latitude && f.longitude
                            ? [parseFloat(f.latitude), parseFloat(f.longitude)]
                            : [3.139, 101.6869],
                    description:
                        f.description ||
                        "Modern healthcare facility providing comprehensive medical services with state-of-the-art equipment.",
                    type: f.type || "Medical Center",
                    distance: Math.floor(Math.random() * 15) + 1,
                    services: [
                        "Consultation",
                        "Lab Tests",
                        "Imaging",
                        "Pharmacy",
                        "Emergency",
                    ],
                    doctors_count: Math.floor(Math.random() * 20) + 5,
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
        let filtered = facilities.filter(
            (f) =>
                (f.name || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (f.specialty || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (f.type || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (f.address || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );

        if (activeFilter !== "all") {
            filtered = filtered.filter(
                (f) => f.type?.toLowerCase() === activeFilter.toLowerCase()
            );
        }

        return filtered;
    }, [searchQuery, facilities, activeFilter]);

    const openMaps = (address: string) => {
        window.open(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                address
            )}`,
            "_blank"
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md border-none shadow-2xl">
                    <CardContent className="p-8">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold">
                                    Welcome to Cura Health
                                </h3>
                                <p className="text-muted-foreground">
                                    Please sign in to book appointments with
                                    trusted healthcare providers
                                </p>
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
                                Sign In to Continue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-linear-to-b from-background to-muted/20 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Search Section */}
                <div className="mb-8 space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3">
                            Find Healthcare Providers
                        </h2>
                        <p className="text-muted-foreground">
                            Book appointments with trusted medical facilities in
                            your area
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-12">
                        <div className="md:col-span-8 lg:col-span-9">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search facilities, specialties, or locations..."
                                    className="pl-12 h-14 text-base rounded-xl border-2"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
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
                        <div className="md:col-span-4 lg:col-span-3 flex gap-2">
                            <Button
                                variant="outline"
                                className="h-14 flex-1 rounded-xl gap-2"
                                onClick={() =>
                                    setViewMode(
                                        viewMode === "grid" ? "list" : "grid"
                                    )
                                }
                            >
                                <Filter className="h-4 w-4" />
                                {viewMode === "grid"
                                    ? "List View"
                                    : "Grid View"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters & Stats */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">
                                Available Facilities
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {filteredFacilities.length} facilities found
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Tabs
                                defaultValue="all"
                                value={activeFilter}
                                onValueChange={setActiveFilter}
                            >
                                <TabsList className="bg-muted/50">
                                    <TabsTrigger
                                        value="all"
                                        className="rounded-lg"
                                    >
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="hospital"
                                        className="rounded-lg"
                                    >
                                        Hospitals
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="clinic"
                                        className="rounded-lg"
                                    >
                                        Clinics
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="center"
                                        className="rounded-lg"
                                    >
                                        Centers
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </div>

                <ScrollArea className="h-[60vh] w-full rounded-2xl border-2 p-2">
                    {/* Results */}
                    {isLoading ? (
                        <div
                            className={`grid ${
                                viewMode === "grid"
                                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    : "grid-cols-1 gap-4"
                            }`}
                        >
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </div>
                                            <Skeleton className="h-24 w-full" />
                                            <div className="flex gap-2 pt-2">
                                                <Skeleton className="h-10 flex-1 rounded-lg" />
                                                <Skeleton className="h-10 w-10 rounded-lg" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFacilities.map((facility) => (
                                <Card
                                    key={facility.id}
                                    className="group hover:shadow-xl transition-all duration-300 border overflow-hidden"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge
                                                variant="secondary"
                                                className="font-normal"
                                            >
                                                {facility.type}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">
                                                    {facility.rating?.toFixed(
                                                        1
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                            {facility.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {facility.specialty ||
                                                "General Medicine"}
                                        </p>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="line-clamp-1">
                                                {facility.address}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <span>
                                                {facility.distance} km away
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {facility.services
                                                ?.slice(0, 3)
                                                .map((service, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                        className="text-xs font-normal"
                                                    >
                                                        {service}
                                                    </Badge>
                                                ))}
                                            {facility.services &&
                                                facility.services.length >
                                                    3 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs font-normal"
                                                    >
                                                        +
                                                        {facility.services
                                                            .length - 3}{" "}
                                                        more
                                                    </Badge>
                                                )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t">
                                        <div className="flex gap-3 w-full">
                                            <Link
                                                href={`/user/appointments/${facility.id}`}
                                                className="flex-1"
                                            >
                                                <Button className="w-full rounded-lg">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Book
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-lg"
                                                onClick={() =>
                                                    openMaps(facility.address)
                                                }
                                                title="Get directions"
                                            >
                                                <Navigation className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFacilities.map((facility) => (
                                <Card
                                    key={facility.id}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            <div className="md:w-1/4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                                        <Building className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold line-clamp-1">
                                                            {facility.name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {facility.type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:w-1/4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                                        <span className="line-clamp-1">
                                                            {facility.address}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium text-amber-600">
                                                            ~
                                                            {facility.wait_time}{" "}
                                                            min wait
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:w-1/4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="font-normal"
                                                    >
                                                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                                        {facility.rating?.toFixed(
                                                            1
                                                        )}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-normal"
                                                    >
                                                        {facility.doctors_count}{" "}
                                                        doctors
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="md:w-1/4">
                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/user/appointments/${facility.id}`}
                                                        className="flex-1"
                                                    >
                                                        <Button className="w-full rounded-lg">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            Book
                                                        </Button>
                                                    </Link>

                                                    <Link
                                                        href={`/user/appointments/${facility.id}`}
                                                        className="flex-1"
                                                    >
                                                        <Button className="w-full rounded-lg font-medium">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            Book Now
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
