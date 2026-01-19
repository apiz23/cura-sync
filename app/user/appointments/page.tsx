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
    Phone,
    MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

export interface Facility {
    id: string;
    name: string;
    type: string;
    specialty?: string;
    address: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    latitude?: string;
    longitude?: string;
    rating?: number;
    wait_time?: number;
    distance?: number;
    doctors_count?: number;
    services?: string[];
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
                const { data, error } = await supabase
                    .from("cura_facilities")
                    .select("*")
                    .eq("is_active", true)
                    .order("name");

                if (error) throw error;

                const formattedData = (data || []).map((f) => ({
                    ...f,
                    type: f.type || "Medical Center",
                    specialty: f.specialty || "General Medicine",
                    phone: f.phone || "+1 (555) 123-4567",
                    rating: Math.random() * 2 + 3,
                    wait_time: Math.floor(Math.random() * 30) + 5,
                    distance: Math.floor(Math.random() * 15) + 1,
                    doctors_count: Math.floor(Math.random() * 20) + 5,
                    services: ["Consultation", "Lab Tests", "Emergency Care"],
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

    const facilityTypes = useMemo(() => {
        const types = facilities.map((f) => f.type).filter(Boolean);
        return Array.from(new Set(types));
    }, [facilities]);

    const filteredFacilities = useMemo(() => {
        let filtered = facilities.filter(
            (f) =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (f.specialty?.toLowerCase() || "").includes(
                    searchQuery.toLowerCase()
                ) ||
                f.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.address.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterType !== "all") {
            filtered = filtered.filter((f) => f.type === filterType);
        }

        return filtered;
    }, [searchQuery, facilities, filterType]);

    const openMaps = (
        address: string,
        latitude?: string,
        longitude?: string
    ) => {
        if (latitude && longitude) {
            window.open(
                `https://www.google.com/maps?q=${latitude},${longitude}`,
                "_blank"
            );
        } else {
            window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    address
                )}`,
                "_blank"
            );
        }
    };

    const openPhone = (phone?: string) => {
        if (phone) {
            window.open(`tel:${phone}`);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="border-none shadow-2xl">
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
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Healthcare Facilities
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Browse and book appointments at trusted medical
                                facilities
                            </p>
                        </div>
                        <Badge variant="outline" className="px-4 py-2">
                            {facilities.length} Total Facilities
                        </Badge>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="grid gap-4 md:grid-cols-12">
                    <div className="md:col-span-8 lg:col-span-9">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search facilities by name, specialty, or location..."
                                className="pl-12 h-14 text-base rounded-xl border-2"
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
                            <Select
                                value={filterType}
                                onValueChange={setFilterType}
                            >
                                <SelectTrigger className="w-full h-14 rounded-xl border-2 border-input bg-background px-4 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                    <SelectValue placeholder="All Facility Types" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All Facility Types
                                    </SelectItem>

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                <div className="p-3 rounded-full bg-blue-500/10">
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
                                        Average Rating
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        4.2
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-green-500/10">
                                    <Star className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-500/10 hover:border-amber-500/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Avg Wait Time
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        18 min
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-amber-500/10">
                                    <Clock className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-500/10 hover:border-purple-500/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Doctors
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        142
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-purple-500/10">
                                    <Users className="h-6 w-6 text-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Facilities Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Facilities
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {filteredFacilities.length} facilities found
                                {searchQuery && ` for "${searchQuery}"`}
                                {filterType !== "all" &&
                                    ` • Filtered by: ${filterType}`}
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
                        <div className="rounded-xl border border-border overflow-hidden bg-card">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-semibold w-[300px]">
                                            Facility
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Contact & Location
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Services & Availability
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Metrics
                                        </TableHead>
                                        <TableHead className="font-semibold text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFacilities.map((facility) => (
                                        <TableRow
                                            key={facility.id}
                                            className="hover:bg-muted/30"
                                        >
                                            {/* Facility Column */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <Building className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold text-sm">
                                                            {facility.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {facility.type}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {
                                                                    facility.specialty
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Contact & Location Column */}
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <p className="text-sm">
                                                                {
                                                                    facility.address
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    facility.distance
                                                                }{" "}
                                                                km away
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {facility.phone && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span>
                                                                {facility.phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Services & Availability Column */}
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {facility.services
                                                            ?.slice(0, 2)
                                                            .map(
                                                                (
                                                                    service,
                                                                    i
                                                                ) => (
                                                                    <Badge
                                                                        key={i}
                                                                        variant="outline"
                                                                        className="text-xs px-1.5 py-0.5"
                                                                    >
                                                                        {
                                                                            service
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        {facility.services &&
                                                            facility.services
                                                                .length > 2 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs px-1.5 py-0.5"
                                                                >
                                                                    +
                                                                    {facility
                                                                        .services
                                                                        .length -
                                                                        2}{" "}
                                                                    more
                                                                </Badge>
                                                            )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                        <span className="text-amber-600 font-medium">
                                                            {facility.wait_time}{" "}
                                                            min wait
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Metrics Column */}
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium">
                                                                {facility.rating?.toFixed(
                                                                    1
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3.5 w-3.5 text-blue-500" />
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {
                                                                    facility.doctors_count
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${
                                                                facility.is_active
                                                                    ? "bg-green-500"
                                                                    : "bg-gray-300"
                                                            }`}
                                                        />
                                                        <span className="text-muted-foreground">
                                                            {facility.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Actions Column */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/user/appointments/${facility.id}`}
                                                        className="flex-1 max-w-[140px]"
                                                    >
                                                        <Button
                                                            className="w-full gap-2"
                                                            size="sm"
                                                        >
                                                            <Calendar className="h-4 w-4" />
                                                            Book Now
                                                        </Button>
                                                    </Link>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-48"
                                                        >
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer"
                                                                onClick={() =>
                                                                    openMaps(
                                                                        facility.address,
                                                                        facility.latitude,
                                                                        facility.longitude
                                                                    )
                                                                }
                                                            >
                                                                <Navigation className="h-4 w-4" />
                                                                Get Directions
                                                            </DropdownMenuItem>
                                                            {facility.phone && (
                                                                <DropdownMenuItem
                                                                    className="gap-2 cursor-pointer"
                                                                    onClick={() =>
                                                                        openPhone(
                                                                            facility.phone
                                                                        )
                                                                    }
                                                                >
                                                                    <Phone className="h-4 w-4" />
                                                                    Call
                                                                    Facility
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
