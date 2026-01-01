"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/authprovideradmin";
import {
    Building2,
    MapPin,
    Stethoscope,
    Globe,
    Save,
    Loader2,
    Shield,
    AlertCircle,
    CheckCircle,
    Phone,
    Mail,
    Users,
    Clock,
    Upload,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, MapTileLayer, MapMarker } from "@/components/ui/map";

type Facility = {
    id: string;
    name: string | null;
    type: string | null;
    specialty: string | null;
    description: string | null;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    phone: string | null;
    email: string | null;
    opening_hours: string | null;
    capacity: number | null;
    services: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
};

export default function EditFacilityPage() {
    const { staff, loading: authLoading } = useAuth();

    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    useEffect(() => {
        if (authLoading) return;

        if (!staff) {
            toast.error("Not authenticated");
            return;
        }

        if (!staff.facility_id) {
            toast.error("No facility assigned");
            return;
        }

        if (staff.role !== "admin") {
            toast.error("Access denied");
            return;
        }

        const fetchFacility = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("cura_facilities")
                .select("*")
                .eq("id", staff.facility_id)
                .single();

            if (error) {
                toast.error("Failed to load facility");
                console.error(error);
                setLoading(false);
                return;
            }

            setFacility(data);
            setLoading(false);
        };

        fetchFacility();
    }, [staff, authLoading]);

    const handleSave = async () => {
        if (!facility) return;

        setSaving(true);

        const { error } = await supabase
            .from("cura_facilities")
            .update({
                name: facility.name,
                type: facility.type,
                specialty: facility.specialty,
                address: facility.address,
                latitude: facility.latitude,
                longitude: facility.longitude,
                is_active: facility.is_active,
                phone: facility.phone,
                email: facility.email,
                description: facility.description,
                opening_hours: facility.opening_hours,
                capacity: facility.capacity,
                services: facility.services,
            })
            .eq("id", facility.id);

        if (error) {
            toast.error("Failed to update facility", {
                description: error.message,
            });
        } else {
            toast.success("Facility updated successfully", {
                description: "Changes have been saved",
                icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            });
        }

        setSaving(false);
    };

    const handleAddService = () => {
        const newService = prompt("Enter new service:");
        if (!newService || !newService.trim()) return;

        setFacility((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                services: [...(prev.services ?? []), newService.trim()],
            };
        });
    };

    const handleRemoveService = (index: number) => {
        setFacility((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                services: (prev.services ?? []).filter(
                    (_service, i) => i !== index
                ),
            };
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen p-6 bg-linear-to-b from-background via-background to-primary/5">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <Tabs defaultValue="basic" className="space-y-6">
                        <Skeleton className="h-10 w-full max-w-md" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
                            <Skeleton className="h-96 rounded-xl" />
                        </div>
                    </Tabs>
                </div>
            </div>
        );
    }

    if (!staff || !facility) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md mx-auto border-2 border-destructive/20">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Access Restricted
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {!staff
                                ? "Please log in to continue"
                                : !staff.facility_id
                                ? "No facility assigned to your account"
                                : "You don't have permission to access this page"}
                        </p>
                        <Button variant="outline">Return to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Facility Management
                            </h1>
                            <Badge
                                variant={
                                    facility.is_active ? "default" : "secondary"
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
                        </div>
                        <p className="text-muted-foreground">
                            Manage your healthcare facility settings and
                            information
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>
                            <p className="text-sm font-medium">
                                {new Date(
                                    facility.updated_at || facility.created_at
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
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
                </div>

                {/* Tabs Navigation */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-fit bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger
                            value="basic"
                            className="rounded-lg data-[state=active]:bg-background"
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Basic Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="location"
                            className="rounded-lg data-[state=active]:bg-background"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Location
                        </TabsTrigger>
                        <TabsTrigger
                            value="services"
                            className="rounded-lg data-[state=active]:bg-background"
                        >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Services
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="rounded-lg data-[state=active]:bg-background"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Facility Information</CardTitle>
                                    <CardDescription>
                                        Basic details about your healthcare
                                        facility
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label
                                                htmlFor="name"
                                                className="flex items-center gap-2 mb-2"
                                            >
                                                <Building2 className="w-4 h-4" />
                                                Facility Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="Enter facility name"
                                                value={facility.name || ""}
                                                onChange={(e) =>
                                                    setFacility({
                                                        ...facility,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label
                                                    htmlFor="type"
                                                    className="flex items-center gap-2 mb-2"
                                                >
                                                    <Building2 className="w-4 h-4" />
                                                    Facility Type
                                                </Label>
                                                <Input
                                                    id="type"
                                                    placeholder="e.g., Hospital, Clinic, Health Center"
                                                    value={facility.type || ""}
                                                    onChange={(e) =>
                                                        setFacility({
                                                            ...facility,
                                                            type: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    htmlFor="specialty"
                                                    className="flex items-center gap-2 mb-2"
                                                >
                                                    <Stethoscope className="w-4 h-4" />
                                                    Primary Specialty
                                                </Label>
                                                <Input
                                                    id="specialty"
                                                    placeholder="e.g., Cardiology, Pediatrics"
                                                    value={
                                                        facility.specialty || ""
                                                    }
                                                    onChange={(e) =>
                                                        setFacility({
                                                            ...facility,
                                                            specialty:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="description"
                                                className="flex items-center gap-2 mb-2"
                                            >
                                                <Building2 className="w-4 h-4" />
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe your facility, services, and specialties..."
                                                value={
                                                    facility.description || ""
                                                }
                                                onChange={(e) =>
                                                    setFacility({
                                                        ...facility,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                                className="min-h-[120px] resize-none"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>
                                        How patients can reach your facility
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="phone"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            placeholder="+1 (555) 123-4567"
                                            value={facility.phone || ""}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="email"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="contact@facility.com"
                                            value={facility.email || ""}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="capacity"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            Patient Capacity
                                        </Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            placeholder="e.g., 100"
                                            value={facility.capacity ?? ""}
                                            onChange={(e) =>
                                                setFacility((prev) => {
                                                    if (!prev) return prev;

                                                    return {
                                                        ...prev,
                                                        capacity:
                                                            e.target.value ===
                                                            ""
                                                                ? null
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  ),
                                                    };
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="opening_hours"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Opening Hours
                                        </Label>
                                        <Input
                                            id="opening_hours"
                                            placeholder="e.g., 8:00 AM - 6:00 PM"
                                            value={facility.opening_hours || ""}
                                            onChange={(e) =>
                                                setFacility({
                                                    ...facility,
                                                    opening_hours:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Location Tab */}
                    <TabsContent value="location" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Details</CardTitle>
                                <CardDescription>
                                    Address and geographical coordinates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label
                                        htmlFor="address"
                                        className="flex items-center gap-2 mb-2"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Full Address *
                                    </Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Street address, city, state, zip code"
                                        value={facility.address || ""}
                                        onChange={(e) =>
                                            setFacility({
                                                ...facility,
                                                address: e.target.value,
                                            })
                                        }
                                        className="min-h-[80px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label
                                            htmlFor="latitude"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Globe className="w-4 h-4" />
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
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Decimal coordinates (e.g., 40.7128)
                                        </p>
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="longitude"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Globe className="w-4 h-4" />
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
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Decimal coordinates (e.g., -74.0060)
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <h4 className="font-medium">
                                            Map Preview
                                        </h4>
                                    </div>

                                    {facility.latitude && facility.longitude ? (
                                        <div className="aspect-video rounded-lg overflow-hidden border">
                                            <Map
                                                center={[
                                                    parseFloat(
                                                        facility.latitude
                                                    ),
                                                    parseFloat(
                                                        facility.longitude
                                                    ),
                                                ]}
                                                zoom={15}
                                                className="h-full w-full"
                                            >
                                                <MapTileLayer />
                                                <MapMarker
                                                    position={[
                                                        parseFloat(
                                                            facility.latitude
                                                        ),
                                                        parseFloat(
                                                            facility.longitude
                                                        ),
                                                    ]}
                                                />
                                            </Map>
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    Add coordinates to enable
                                                    map preview
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Services Tab */}
                    <TabsContent value="services" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Medical Services</CardTitle>
                                        <CardDescription>
                                            Services provided by your facility
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddService}
                                        className="gap-2"
                                    >
                                        <Stethoscope className="w-4 h-4" />
                                        Add Service
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(facility.services || []).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {(facility.services ?? []).map(
                                                (service, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 rounded-lg border bg-card flex items-center justify-between group hover:border-primary/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                                                <Stethoscope className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <span className="font-medium">
                                                                {service}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleRemoveService(
                                                                    index
                                                                )
                                                            }
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 border-2 border-dashed rounded-xl">
                                            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground font-medium">
                                                No services added
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Add medical services provided by
                                                your facility
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Facility Settings</CardTitle>
                                <CardDescription>
                                    Manage your facility configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <div className="space-y-1">
                                            <Label className="text-base">
                                                Facility Status
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Activate or deactivate your
                                                facility
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
                                                className={`font-medium ${
                                                    facility.is_active
                                                        ? "text-green-600"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {facility.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-foreground">
                                            Facility Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">
                                                    Facility ID
                                                </p>
                                                <code className="font-mono bg-muted px-2 py-1 rounded text-xs">
                                                    {facility.id}
                                                </code>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">
                                                    Created
                                                </p>
                                                <p className="font-medium">
                                                    {new Date(
                                                        facility.created_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">
                                                    Last Updated
                                                </p>
                                                <p className="font-medium">
                                                    {new Date(
                                                        facility.updated_at ||
                                                            facility.created_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">
                                                    Staff Members
                                                </p>
                                                <p className="font-medium">-</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.history.back()}
                    >
                        ← Back
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Export Data
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving Changes...
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
    );
}
