"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Save,
    User,
    Mail,
    ShieldCheck,
    Calendar,
    MapPin,
    Phone,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    avatar_url: string;
    created_at?: string;
    location?: string;
    phone?: string;
}

export default function ProfilePage() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        location: "",
        phone: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isClerkLoaded || !user) return;

            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData({
                        full_name: data.full_name || "",
                        location: data.location || "",
                        phone: data.phone || "",
                    });
                } else {
                    console.error("Failed to fetch profile");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [isClerkLoaded, user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update");

            const updatedData = await res.json();
            setProfile(updatedData);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isClerkLoaded || isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your personal information and account settings
                    </p>
                </div>
                <Badge variant="secondary" className="w-fit capitalize">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {profile?.role} Account
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                                    <AvatarImage
                                        src={
                                            profile?.avatar_url ||
                                            user?.imageUrl
                                        }
                                    />
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                                        {profile?.full_name?.[0]?.toUpperCase() ||
                                            "U"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">
                                        {profile?.full_name || "User"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        {profile?.email}
                                    </p>
                                </div>

                                <div className="w-full pt-4 space-y-3">
                                    {profile?.created_at && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Joined{" "}
                                                {new Date(
                                                    profile.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {profile?.location && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{profile.location}</span>
                                        </div>
                                    )}
                                    {profile?.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{profile.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Account Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>
                                <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                >
                                    Active
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Member since
                                </span>
                                <span className="text-sm font-medium">
                                    {profile?.created_at
                                        ? new Date(
                                              profile.created_at
                                          ).getFullYear()
                                        : "2024"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Role
                                </span>
                                <span className="text-sm font-medium capitalize">
                                    {profile?.role}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Edit Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                            <CardDescription>
                                Update your personal information and contact
                                details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid gap-6">
                                    {/* Personal Information Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Personal Information
                                        </h4>

                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email Address
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        value={
                                                            profile?.email || ""
                                                        }
                                                        disabled
                                                        className="pl-9 bg-muted/50 cursor-not-allowed"
                                                    />
                                                </div>
                                                <p className="text-[0.8rem] text-muted-foreground">
                                                    Email is managed via your
                                                    login provider
                                                </p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="full_name">
                                                    Full Name
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="full_name"
                                                        value={
                                                            formData.full_name
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                full_name:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="pl-9"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Contact Information Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Contact Information
                                        </h4>

                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="location">
                                                    Location
                                                </Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="location"
                                                        value={
                                                            formData.location
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                location:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="pl-9"
                                                        placeholder="Enter your location"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">
                                                    Phone Number
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                phone: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="pl-9"
                                                        placeholder="Enter your phone number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setFormData({
                                                full_name:
                                                    profile?.full_name || "",
                                                location:
                                                    profile?.location || "",
                                                phone: profile?.phone || "",
                                            })
                                        }
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="min-w-[120px]"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
