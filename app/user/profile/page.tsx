"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Loader2,
    Save,
    User,
    Mail,
    Phone,
    Edit3,
    Camera,
    HeartPulse,
    CalendarDays,
    Ruler,
    Weight,
    AlertTriangle,
    ClipboardList,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { FieldError } from "@/components/ui/field";

interface PatientProfile {
    profile_id: string;
    date_of_birth?: string | null;
    gender?: string | null;
    blood_type?: string | null;
    height_cm?: number | null;
    weight_kg?: number | null;
    allergies?: string | null;
    chronic_conditions?: string | null;
    emergency_contact?: string | null;
}

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    avatar_url: string;
    created_at?: string;
    phone?: string | null;
    phone_number?: string | null;
    patient_profile?: PatientProfile | null;
}

type ProfileFormState = {
    full_name: string;
    phone_number: string;
    patient_profile: {
        date_of_birth: string;
        gender: string;
        blood_type: string;
        height_cm: string;
        weight_kg: string;
        allergies: string;
        chronic_conditions: string;
        emergency_contact: string;
    };
};

const optionalText = z.string().trim();

const profileFormSchema = z.object({
    full_name: z.string().trim().min(1, "Full name is required"),
    phone_number: optionalText,
    patient_profile: z.object({
        date_of_birth: optionalText,
        gender: optionalText,
        blood_type: optionalText,
        height_cm: z
            .string()
            .trim()
            .refine(
                (value: string) => value === "" || !Number.isNaN(Number(value)),
                "Height must be a valid number"
            ),
        weight_kg: z
            .string()
            .trim()
            .refine(
                (value: string) => value === "" || !Number.isNaN(Number(value)),
                "Weight must be a valid number"
            ),
        allergies: optionalText,
        chronic_conditions: optionalText,
        emergency_contact: optionalText,
    }),
});

function emptyPatientProfileForm() {
    return {
        date_of_birth: "",
        gender: "",
        blood_type: "",
        height_cm: "",
        weight_kg: "",
        allergies: "",
        chronic_conditions: "",
        emergency_contact: "",
    };
}

function buildFormData(profile: UserProfile | null): ProfileFormState {
    return {
        full_name: profile?.full_name || "",
        phone_number: profile?.phone_number || profile?.phone || "",
        patient_profile: {
            date_of_birth: profile?.patient_profile?.date_of_birth || "",
            gender: profile?.patient_profile?.gender || "",
            blood_type: profile?.patient_profile?.blood_type || "",
            height_cm:
                profile?.patient_profile?.height_cm !== null &&
                profile?.patient_profile?.height_cm !== undefined
                    ? String(profile.patient_profile.height_cm)
                    : "",
            weight_kg:
                profile?.patient_profile?.weight_kg !== null &&
                profile?.patient_profile?.weight_kg !== undefined
                    ? String(profile.patient_profile.weight_kg)
                    : "",
            allergies: profile?.patient_profile?.allergies || "",
            chronic_conditions:
                profile?.patient_profile?.chronic_conditions || "",
            emergency_contact:
                profile?.patient_profile?.emergency_contact || "",
        },
    };
}

function parseDobString(dateStr: string | undefined): Date | undefined {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
}

export default function ProfilePage() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dobOpen, setDobOpen] = useState(false);
    const form = useForm<ProfileFormState>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            full_name: "",
            phone_number: "",
            patient_profile: emptyPatientProfileForm(),
        },
        mode: "onTouched",
    });
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = form;

    useEffect(() => {
        reset({
            full_name: "",
            phone_number: "",
            patient_profile: emptyPatientProfileForm(),
        });
    }, [reset]);

    useEffect(() => {
        if (profile) {
            reset(buildFormData(profile));
        }
    }, [profile, reset]);

    const defaultFormData: ProfileFormState = {
        full_name: "",
        phone_number: "",
        patient_profile: emptyPatientProfileForm(),
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isClerkLoaded || !user) return;

            try {
                const syncRes = await fetch("/api/auth/sync", {
                    method: "POST",
                    cache: "no-store",
                });

                if (!syncRes.ok) {
                    const syncError = await syncRes.json().catch(() => null);
                    console.error(
                        "Failed to sync user before profile fetch:",
                        syncError?.error || syncRes.statusText
                    );
                }

                const res = await fetch("/api/user/profile", {
                    cache: "no-store",
                });
                if (res.ok) {
                    const data = (await res.json()) as UserProfile;
                    setProfile(data);
                } else {
                    const errorData = await res.json().catch(() => null);
                    console.error(
                        "Failed to fetch profile:",
                        errorData?.error || res.statusText
                    );
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [isClerkLoaded, user]);

    const handleUpdate = async (values: ProfileFormState) => {
        setIsSaving(true);

        const updatePromise = (async () => {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: values.full_name,
                    phone_number: values.phone_number,
                    patient_profile: {
                        ...values.patient_profile,
                        height_cm: values.patient_profile.height_cm
                            ? Number(values.patient_profile.height_cm)
                            : null,
                        weight_kg: values.patient_profile.weight_kg
                            ? Number(values.patient_profile.weight_kg)
                            : null,
                    },
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || "Failed to update profile");
            }

            return data as UserProfile;
        })();

        toast.promise(updatePromise, {
            loading: "Saving profile...",
            success: "Profile updated successfully",
            error: (error) =>
                error instanceof Error
                    ? error.message
                    : "Failed to update profile",
        });

        try {
            const updatedData = await updatePromise;
            setProfile(updatedData);
            reset(buildFormData(updatedData));
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isClerkLoaded || isLoading) {
        return (
            <UserPageShell contentClassName="justify-center">
                <div className="flex h-[50vh] w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Loading profile...
                        </p>
                    </div>
                </div>
            </UserPageShell>
        );
    }

    return (
        <UserPageShell>
            <UserPageHeader
                icon={User}
                title="Profile Settings"
                description="Review your account details and keep your personal and patient information up to date."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Overview */}
                    <Card className="border-border py-0">
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
                                    {(profile?.phone_number || profile?.phone) && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">
                                                    Phone
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {profile.phone_number ||
                                                        profile.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {profile?.patient_profile?.blood_type && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <HeartPulse className="h-4 w-4 text-primary flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">
                                                    Blood Type
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {
                                                        profile.patient_profile
                                                            .blood_type
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {profile?.patient_profile?.emergency_contact && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <Users className="h-4 w-4 text-primary flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">
                                                    Emergency Contact
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {
                                                        profile.patient_profile
                                                            .emergency_contact
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                        Patients can fill these details now, and
                                        health center staff can also update the
                                        patient profile later from the admin
                                        side.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit(handleUpdate)}
                                className="space-y-6"
                                noValidate
                            >
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
                                                    {...register("full_name")}
                                                    className="pl-9"
                                                    placeholder="Your full name"
                                                    aria-invalid={!!errors.full_name}
                                                />
                                            </div>
                                            <FieldError errors={[errors.full_name]} />
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
                                                htmlFor="phone_number"
                                                className="text-sm"
                                            >
                                                Phone Number
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone_number"
                                                    {...register("phone_number")}
                                                    className="pl-9"
                                                    placeholder="+60 12-345 6789"
                                                    aria-invalid={!!errors.phone_number}
                                                />
                                            </div>
                                            <FieldError errors={[errors.phone_number]} />
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-foreground">
                                        Patient Profile
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="date_of_birth"
                                                className="text-sm"
                                            >
                                                Date of Birth
                                            </Label>
                                            <Popover open={dobOpen} onOpenChange={setDobOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="date_of_birth"
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !watch("patient_profile.date_of_birth") && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarDays className="mr-2 h-4 w-4" />
                                                        {watch("patient_profile.date_of_birth")
                                                            ? format(parseDobString(watch("patient_profile.date_of_birth"))!, "PPP")
                                                            : "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        captionLayout="dropdown"
                                                        selected={parseDobString(watch("patient_profile.date_of_birth"))}
                                                        onSelect={(date) => {
                                                            setValue(
                                                                "patient_profile.date_of_birth",
                                                                date ? format(date, "yyyy-MM-dd") : "",
                                                                { shouldValidate: true }
                                                            );
                                                            setDobOpen(false);
                                                        }}
                                                        startMonth={new Date(1900, 0)}
                                                        endMonth={new Date()}
                                                        disabled={(date) => date > new Date()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FieldError
                                                errors={[errors.patient_profile?.date_of_birth]}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="gender"
                                                className="text-sm"
                                            >
                                                Gender
                                            </Label>
                                            <Input
                                                id="gender"
                                                {...register("patient_profile.gender")}
                                                placeholder="Male, Female, Non-binary"
                                                aria-invalid={!!errors.patient_profile?.gender}
                                            />
                                            <FieldError errors={[errors.patient_profile?.gender]} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="blood_type"
                                                className="text-sm"
                                            >
                                                Blood Type
                                            </Label>
                                            <Input
                                                id="blood_type"
                                                {...register("patient_profile.blood_type")}
                                                placeholder="A+, O-, AB+"
                                                aria-invalid={!!errors.patient_profile?.blood_type}
                                            />
                                            <FieldError
                                                errors={[errors.patient_profile?.blood_type]}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="emergency_contact"
                                                className="text-sm"
                                            >
                                                Emergency Contact
                                            </Label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="emergency_contact"
                                                    {...register("patient_profile.emergency_contact")}
                                                    className="pl-9"
                                                    placeholder="Name and phone number"
                                                    aria-invalid={!!errors.patient_profile?.emergency_contact}
                                                />
                                            </div>
                                            <FieldError
                                                errors={[errors.patient_profile?.emergency_contact]}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="height_cm"
                                                className="text-sm"
                                            >
                                                Height (cm)
                                            </Label>
                                            <div className="relative">
                                                <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="height_cm"
                                                    type="number"
                                                    {...register("patient_profile.height_cm")}
                                                    className="pl-9"
                                                    placeholder="170"
                                                    aria-invalid={!!errors.patient_profile?.height_cm}
                                                />
                                            </div>
                                            <FieldError
                                                errors={[errors.patient_profile?.height_cm]}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="weight_kg"
                                                className="text-sm"
                                            >
                                                Weight (kg)
                                            </Label>
                                            <div className="relative">
                                                <Weight className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="weight_kg"
                                                    type="number"
                                                    step="0.1"
                                                    {...register("patient_profile.weight_kg")}
                                                    className="pl-9"
                                                    placeholder="65.5"
                                                    aria-invalid={!!errors.patient_profile?.weight_kg}
                                                />
                                            </div>
                                            <FieldError
                                                errors={[errors.patient_profile?.weight_kg]}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="allergies"
                                                className="text-sm"
                                            >
                                                Allergies
                                            </Label>
                                            <div className="relative">
                                                <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Textarea
                                                    id="allergies"
                                                    {...register("patient_profile.allergies")}
                                                    className="min-h-[96px] pl-9"
                                                    placeholder="List known allergies"
                                                    aria-invalid={!!errors.patient_profile?.allergies}
                                                />
                                            </div>
                                            <FieldError
                                                errors={[errors.patient_profile?.allergies]}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="chronic_conditions"
                                                className="text-sm"
                                            >
                                                Chronic Conditions
                                            </Label>
                                            <div className="relative">
                                                <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Textarea
                                                    id="chronic_conditions"
                                                    {...register("patient_profile.chronic_conditions")}
                                                    className="min-h-[96px] pl-9"
                                                    placeholder="List ongoing medical conditions"
                                                    aria-invalid={!!errors.patient_profile?.chronic_conditions}
                                                />
                                            </div>
                                            <FieldError
                                                errors={[errors.patient_profile?.chronic_conditions]}
                                            />
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
                                            reset(profile ? buildFormData(profile) : defaultFormData)
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
        </UserPageShell>
    );
}
