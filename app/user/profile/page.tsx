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
    MapPin,
    Phone,
    Edit3,
    Camera,
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
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Overview */}
                    <Card className="border-border">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center space-y-5">
                                {/* Avatar with edit button */}
                                <div className="relative">
                                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                                        <AvatarImage
                                            src={
                                                profile?.avatar_url ||
                                                user?.imageUrl
                                            }
                                            alt={profile?.full_name}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                                            {profile?.full_name?.[0]?.toUpperCase() ||
                                                "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-background"
                                        onClick={() =>
                                            toast.info(
                                                "Avatar upload coming soon"
                                            )
                                        }
                                    >
                                        <Camera className="h-3 w-3" />
                                    </Button>
                                </div>

                                {/* User Info */}
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {profile?.full_name || "User"}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">
                                            {profile?.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 w-full pt-2">
                                    <div className="text-center p-3 rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold text-foreground">
                                            {profile?.created_at
                                                ? new Date(
                                                      profile.created_at
                                                  ).getFullYear()
                                                : "2024"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Member Since
                                        </p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold text-foreground capitalize">
                                            {profile?.role?.[0] || "U"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Role
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="w-full space-y-3 pt-4">
                                    {profile?.location && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">
                                                    Location
                                                </p>
                                                <p className="text-sm font-medium truncate">
                                                    {profile.location}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {profile?.phone && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">
                                                    Phone
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {profile.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Status */}
                    <Card className="border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>
                                <Badge className="bg-green-500/10 text-green-600 border-green-200">
                                    Active
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Email
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    Verified
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    2FA
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    Enabled
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Edit Form */}
                <div className="lg:col-span-2">
                    <Card className="border-border h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Edit3 className="h-5 w-5 text-primary" />
                                        Edit Profile
                                    </CardTitle>
                                    <CardDescription>
                                        Update your personal information
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-foreground">
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm"
                                            >
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    value={profile?.email || ""}
                                                    disabled
                                                    className="pl-9 bg-muted/50"
                                                    readOnly
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Managed by your login provider
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="full_name"
                                                className="text-sm"
                                            >
                                                Full Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="full_name"
                                                    value={formData.full_name}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            full_name:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="pl-9"
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-foreground">
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="location"
                                                className="text-sm"
                                            >
                                                Location
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="location"
                                                    value={formData.location}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            location:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="pl-9"
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="phone"
                                                className="text-sm"
                                            >
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
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Form Actions */}
                                <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
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
                                        className="md:flex-1"
                                        disabled={isSaving}
                                    >
                                        Reset Changes
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="md:flex-1"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Profile
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
