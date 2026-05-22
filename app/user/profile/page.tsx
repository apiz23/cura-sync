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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
    Shield,
    Activity,
    Droplets,
    Baby,
    Scissors,
    Syringe,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
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

function calculateAge(dateOfBirth: string | undefined | null): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateBMI(heightCm: number | null | undefined, weightKg: number | null | undefined): number | null {
    if (!heightCm || !weightKg || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
}

function getBMICategory(bmi: number | null): { label: string; color: string; icon: any } {
    if (!bmi) return { label: "Not available", color: "text-muted-foreground", icon: Info };
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600", icon: Activity };
    if (bmi < 25) return { label: "Normal weight", color: "text-green-600", icon: CheckCircle2 };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-600", icon: AlertTriangle };
    return { label: "Obese", color: "text-red-600", icon: XCircle };
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function ProfilePage() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dobOpen, setDobOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");
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
        formState: { errors, isDirty },
    } = form;

    const watchedValues = watch();
    const height = watchedValues.patient_profile.height_cm ? Number(watchedValues.patient_profile.height_cm) : null;
    const weight = watchedValues.patient_profile.weight_kg ? Number(watchedValues.patient_profile.weight_kg) : null;
    const currentBMI = calculateBMI(height, weight);
    const bmiCategory = getBMICategory(currentBMI);
    const profileCompletion = calculateProfileCompletion(profile);

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

    function calculateProfileCompletion(profile: UserProfile | null): number {
        if (!profile) return 0;
        let completed = 0;
        let total = 7;
        
        if (profile.full_name) completed++;
        if (profile.phone_number || profile.phone) completed++;
        if (profile.patient_profile?.date_of_birth) completed++;
        if (profile.patient_profile?.blood_type) completed++;
        if (profile.patient_profile?.height_cm) completed++;
        if (profile.patient_profile?.weight_kg) completed++;
        if (profile.patient_profile?.emergency_contact) completed++;
        
        return Math.round((completed / total) * 100);
    }

    if (!isClerkLoaded || isLoading) {
        return (
            <UserPageShell contentClassName="justify-center">
                <div className="flex h-[50vh] w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-base text-muted-foreground">
                            Loading profile...
                        </p>
                    </div>
                </div>
            </UserPageShell>
        );
    }

    const age = calculateAge(profile?.patient_profile?.date_of_birth);
    const bmi = calculateBMI(profile?.patient_profile?.height_cm, profile?.patient_profile?.weight_kg);

    return (
        <UserPageShell>
            <UserPageHeader
                icon={User}
                title="Profile Settings"
                description="Manage your personal information and medical details"
            />
            
            {/* Profile Completion Banner */}
            {profileCompletion < 100 && (
                <Card className="mb-6 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1">
                                <p className="text-base font-medium mb-1">Profile Completion</p>
                                <div className="flex items-center gap-4">
                                    <Progress value={profileCompletion} className="flex-1 h-2" />
                                    <span className="text-base font-semibold">{profileCompletion}%</span>
                                </div>
                                <p className="text-base text-muted-foreground mt-2">
                                    Complete your profile to help healthcare providers serve you better
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Profile Overview Card */}
                    <Card className="border-border overflow-hidden">
                        <div className="relative h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                        <CardContent className="p-6 relative">
                            <div className="flex flex-col items-center -mt-12">
                                {/* Avatar with edit button */}
                                <div className="relative mb-4">
                                    <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                                        <AvatarImage
                                            src={profile?.avatar_url || user?.imageUrl}
                                            alt={profile?.full_name}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-semibold">
                                            {profile?.full_name?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-background shadow-md hover:scale-105 transition-transform"
                                                    onClick={() => toast.info("Avatar upload coming soon")}
                                                >
                                                    <Camera className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Change avatar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {/* User Info */}
                                <div className="text-center space-y-2 mb-4">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {profile?.full_name || user?.fullName || "User"}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <Badge variant="secondary" className="capitalize">
                                            {profile?.role || "Patient"}
                                        </Badge>
                                        {profile?.patient_profile?.blood_type && (
                                            <Badge variant="outline" className="gap-1">
                                                <Droplets className="h-3 w-3" />
                                                {profile.patient_profile.blood_type}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span>{profile?.email || user?.primaryEmailAddress?.emailAddress}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 w-full pt-4 border-t">
                                    <div className="text-center p-2 rounded-lg bg-muted/30">
                                        <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                                        <p className="text-lg font-bold text-foreground">
                                            {profile?.created_at
                                                ? new Date(profile.created_at).getFullYear()
                                                : "2024"}
                                        </p>
                                        <p className="text-base text-muted-foreground">Member Since</p>
                                    </div>
                                    {age && (
                                        <div className="text-center p-2 rounded-lg bg-muted/30">
                                            <Baby className="h-4 w-4 mx-auto mb-1 text-primary" />
                                            <p className="text-lg font-bold text-foreground">{age}</p>
                                            <p className="text-base text-muted-foreground">Years Old</p>
                                        </div>
                                    )}
                                    {bmi && (
                                        <div className="text-center p-2 rounded-lg bg-muted/30">
                                            <Activity className="h-4 w-4 mx-auto mb-1 text-primary" />
                                            <p className="text-lg font-bold text-foreground">{bmi}</p>
                                            <p className="text-base text-muted-foreground">BMI</p>
                                        </div>
                                    )}
                                </div>

                                {/* Key Medical Info */}
                                {(profile?.patient_profile?.emergency_contact || profile?.phone_number) && (
                                    <div className="w-full space-y-2 pt-4">
                                        <p className="text-base font-medium text-muted-foreground uppercase tracking-wider">
                                            Key Contacts
                                        </p>
                                        {profile?.phone_number && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                                                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-base text-muted-foreground">Phone</p>
                                                    <p className="text-base font-medium truncate">
                                                        {profile.phone_number}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {profile?.patient_profile?.emergency_contact && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                                                <Users className="h-4 w-4 text-primary flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-base text-muted-foreground">Emergency Contact</p>
                                                    <p className="text-base font-medium truncate">
                                                        {profile.patient_profile.emergency_contact}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health Summary Card */}
                    {(profile?.patient_profile?.chronic_conditions || profile?.patient_profile?.allergies) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <HeartPulse className="h-4 w-4 text-primary" />
                                    Health Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {profile.patient_profile.allergies && (
                                    <div>
                                        <p className="text-base font-medium text-muted-foreground mb-1">Allergies</p>
                                        <p className="text-base">{profile.patient_profile.allergies}</p>
                                    </div>
                                )}
                                {profile.patient_profile.chronic_conditions && (
                                    <div>
                                        <p className="text-base font-medium text-muted-foreground mb-1">Chronic Conditions</p>
                                        <p className="text-base">{profile.patient_profile.chronic_conditions}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Edit Form with Tabs */}
                <div className="lg:col-span-8">
                    <Card className="border-border">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <CardHeader className="pb-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="personal" className="gap-2">
                                        <User className="h-4 w-4" />
                                        Personal Info
                                    </TabsTrigger>
                                    <TabsTrigger value="medical" className="gap-2">
                                        <HeartPulse className="h-4 w-4" />
                                        Medical Details
                                    </TabsTrigger>
                                </TabsList>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6" noValidate>
                                <TabsContent value="personal" className="mt-0 space-y-6">
                                    {/* Personal Information */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground mb-4">
                                                Basic Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-base font-medium">
                                                        Email Address
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="email"
                                                            value={profile?.email || user?.primaryEmailAddress?.emailAddress || ""}
                                                            disabled
                                                            className="pl-9 bg-muted/50 cursor-not-allowed"
                                                            readOnly
                                                        />
                                                    </div>
                                                    <p className="text-base text-muted-foreground">
                                                        Managed by your authentication provider
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="full_name" className="text-base font-medium">
                                                        Full Name <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground mb-4">
                                                Contact Information
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone_number" className="text-base font-medium">
                                                        Phone Number
                                                    </Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    </div>
                                </TabsContent>

                                <TabsContent value="medical" className="mt-0 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-base font-semibold text-foreground mb-4">
                                            Medical Profile
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Date of Birth */}
                                            <div className="space-y-2">
                                                <Label className="text-base font-medium">
                                                    Date of Birth
                                                </Label>
                                                <Popover open={dobOpen} onOpenChange={setDobOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
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
                                                                : "Select date of birth"}
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
                                                <FieldError errors={[errors.patient_profile?.date_of_birth]} />
                                            </div>

                                            {/* Gender Dropdown */}
                                            <div className="space-y-2">
                                                <Label htmlFor="gender" className="text-base font-medium">
                                                    Gender
                                                </Label>
                                                <select
                                                    id="gender"
                                                    {...register("patient_profile.gender")}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select gender</option>
                                                    {GENDERS.map(gender => (
                                                        <option key={gender} value={gender}>{gender}</option>
                                                    ))}
                                                </select>
                                                <FieldError errors={[errors.patient_profile?.gender]} />
                                            </div>

                                            {/* Blood Type Dropdown */}
                                            <div className="space-y-2">
                                                <Label htmlFor="blood_type" className="text-base font-medium">
                                                    Blood Type
                                                </Label>
                                                <select
                                                    id="blood_type"
                                                    {...register("patient_profile.blood_type")}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select blood type</option>
                                                    {BLOOD_TYPES.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                <FieldError errors={[errors.patient_profile?.blood_type]} />
                                            </div>

                                            {/* Emergency Contact */}
                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact" className="text-base font-medium">
                                                    Emergency Contact
                                                </Label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="emergency_contact"
                                                        {...register("patient_profile.emergency_contact")}
                                                        className="pl-9"
                                                        placeholder="Name and phone number"
                                                        aria-invalid={!!errors.patient_profile?.emergency_contact}
                                                    />
                                                </div>
                                                <FieldError errors={[errors.patient_profile?.emergency_contact]} />
                                            </div>

                                            {/* Height */}
                                            <div className="space-y-2">
                                                <Label htmlFor="height_cm" className="text-base font-medium">
                                                    Height (cm)
                                                </Label>
                                                <div className="relative">
                                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="height_cm"
                                                        type="number"
                                                        step="1"
                                                        {...register("patient_profile.height_cm")}
                                                        className="pl-9"
                                                        placeholder="170"
                                                        aria-invalid={!!errors.patient_profile?.height_cm}
                                                    />
                                                </div>
                                                <FieldError errors={[errors.patient_profile?.height_cm]} />
                                            </div>

                                            {/* Weight */}
                                            <div className="space-y-2">
                                                <Label htmlFor="weight_kg" className="text-base font-medium">
                                                    Weight (kg)
                                                </Label>
                                                <div className="relative">
                                                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                                <FieldError errors={[errors.patient_profile?.weight_kg]} />
                                            </div>
                                        </div>

                                        {/* BMI Display */}
                                        {currentBMI && (
                                            <div className="p-4 rounded-lg bg-muted/30">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="h-5 w-5 text-primary" />
                                                        <span className="text-base font-medium">Your BMI</span>
                                                    </div>
                                                    <span className="text-2xl font-bold">{currentBMI}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {bmiCategory.icon && <bmiCategory.icon className={`h-4 w-4 ${bmiCategory.color}`} />}
                                                    <span className={`text-base ${bmiCategory.color}`}>{bmiCategory.label}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Allergies */}
                                        <div className="space-y-2">
                                            <Label htmlFor="allergies" className="text-base font-medium">
                                                Allergies
                                            </Label>
                                            <div className="relative">
                                                <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Textarea
                                                    id="allergies"
                                                    {...register("patient_profile.allergies")}
                                                    className="min-h-[96px] pl-9 resize-none"
                                                    placeholder="List any known allergies (medications, foods, etc.)"
                                                    aria-invalid={!!errors.patient_profile?.allergies}
                                                />
                                            </div>
                                            <FieldError errors={[errors.patient_profile?.allergies]} />
                                        </div>

                                        {/* Chronic Conditions */}
                                        <div className="space-y-2">
                                            <Label htmlFor="chronic_conditions" className="text-base font-medium">
                                                Chronic Conditions
                                            </Label>
                                            <div className="relative">
                                                <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Textarea
                                                    id="chronic_conditions"
                                                    {...register("patient_profile.chronic_conditions")}
                                                    className="min-h-[96px] pl-9 resize-none"
                                                    placeholder="List any ongoing medical conditions (diabetes, hypertension, asthma, etc.)"
                                                    aria-invalid={!!errors.patient_profile?.chronic_conditions}
                                                />
                                            </div>
                                            <FieldError errors={[errors.patient_profile?.chronic_conditions]} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <Separator />

                                {/* Form Actions */}
                                <div className="flex flex-col-reverse md:flex-row gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset(profile ? buildFormData(profile) : defaultFormData)}
                                        disabled={isSaving || !isDirty}
                                        className="md:flex-1"
                                    >
                                        Cancel Changes
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSaving || !isDirty}
                                        className="md:flex-1"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save All Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </UserPageShell>
    );
}
