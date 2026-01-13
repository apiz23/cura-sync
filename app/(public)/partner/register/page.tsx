"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    MapPin,
    UserCircle,
    Shield,
    CheckCircle,
    Mail,
    Lock,
    Phone,
    Award,
    FileText,
    Calendar,
    Users,
    ClipboardCheck,
    ArrowLeft,
    BadgeCheck,
    Globe,
    Navigation,
    Eye,
    EyeOff,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/page-title";

export default function RegisterClinicPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/facilities/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Registration Successful!", {
                    description:
                        "Your healthcare facility has been registered successfully.",
                    icon: <BadgeCheck className="w-5 h-5 text-green-500" />,
                });
                setTimeout(() => {
                    router.push("/admin/dashboard");
                }, 1500);
            } else {
                toast.error("Registration Failed", {
                    description:
                        result.error ||
                        "Please check your information and try again.",
                    icon: <BadgeCheck className="w-5 h-5 text-red-500" />,
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Network Error", {
                description:
                    "Unable to connect to the server. Please try again.",
            });
        }

        setLoading(false);
    }

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const steps = [
        { number: 1, label: "Facility Details", icon: Building2 },
        { number: 2, label: "Location", icon: MapPin },
        { number: 3, label: "Admin Account", icon: UserCircle },
    ];

    return (
        <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5 p-4 md:p-6">
            <PageTitle title={"Register Health Center"} />

            <div className="max-w-5xl mx-auto pt-16 pb-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 bg-linear-to-r from-primary/20 to-primary/10 text-primary px-5 py-3 rounded-2xl backdrop-blur-sm border border-primary/20 mb-6">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-semibold tracking-wide">
                            SECURE FACILITY REGISTRATION
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Register Your{" "}
                        <span className="text-4xl md:text-5xl bg-linear-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                            Healthcare Facility
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Join our network of trusted healthcare providers in just
                        a few steps
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.number}
                                    className="flex flex-col items-center relative z-10"
                                >
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                                            currentStep >= step.number
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${
                                            currentStep >= step.number
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        Step {step.number}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <Progress
                        value={(currentStep / totalSteps) * 100}
                        className="h-2"
                    />
                </div>

                <Card className="border-2 shadow-xl overflow-hidden bg-linear-to-b from-card via-card to-card/95">
                    <CardHeader className="space-y-2 pb-6 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                                    <Building2 className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        Facility Registration
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Complete all {totalSteps} steps to
                                        register your facility
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Step {currentStep} of {totalSteps}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Step 1: Facility Details */}
                            {currentStep === 1 && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Building2 className="w-5 h-5 text-primary" />
                                            </div>
                                            <span>Facility Information</span>
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Tell us about your healthcare
                                            facility
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="name"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <Building2 className="w-4 h-4" />
                                                Facility Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                placeholder="City General Hospital"
                                                className="h-12 rounded-lg border-2"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="type"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <Users className="w-4 h-4" />
                                                Facility Type *
                                            </Label>
                                            <Select name="type" required>
                                                <SelectTrigger className="h-12 rounded-lg border-2">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg">
                                                    <SelectItem
                                                        value="Clinic"
                                                        className="rounded-md"
                                                    >
                                                        <div className="flex items-center gap-3 py-1">
                                                            <Building2 className="w-4 h-4 text-primary" />
                                                            <span>Clinic</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="Hospital"
                                                        className="rounded-md"
                                                    >
                                                        <div className="flex items-center gap-3 py-1">
                                                            <Building2 className="w-4 h-4 text-primary" />
                                                            <span>
                                                                Hospital
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="Pharmacy"
                                                        className="rounded-md"
                                                    >
                                                        <div className="flex items-center gap-3 py-1">
                                                            <Building2 className="w-4 h-4 text-primary" />
                                                            <span>
                                                                Pharmacy
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="Lab"
                                                        className="rounded-md"
                                                    >
                                                        <div className="flex items-center gap-3 py-1">
                                                            <Building2 className="w-4 h-4 text-primary" />
                                                            <span>
                                                                Laboratory
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="specialty"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <Award className="w-4 h-4" />
                                                Primary Specialty
                                            </Label>
                                            <Input
                                                id="specialty"
                                                name="specialty"
                                                placeholder="Cardiology, Pediatrics, Surgery"
                                                className="h-12 rounded-lg border-2"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="phone"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <Phone className="w-4 h-4" />
                                                Contact Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                placeholder="+1 (555) 123-4567"
                                                className="h-12 rounded-lg border-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.back()}
                                            className="gap-2 rounded-lg h-11"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="gap-2 rounded-lg h-11 px-8"
                                        >
                                            Continue to Location
                                            <Navigation className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Location Details */}
                            {currentStep === 2 && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <MapPin className="w-5 h-5 text-primary" />
                                            </div>
                                            <span>Location Information</span>
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Where is your facility located?
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="address"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                Full Address *
                                            </Label>
                                            <textarea
                                                id="address"
                                                name="address"
                                                required
                                                rows={3}
                                                placeholder="123 Medical Center Drive, Suite 100, New York, NY 10001"
                                                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="latitude"
                                                    className="text-sm font-semibold flex items-center gap-2"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Latitude
                                                </Label>
                                                <Input
                                                    id="latitude"
                                                    name="latitude"
                                                    type="number"
                                                    step="any"
                                                    placeholder="40.7128"
                                                    className="h-12 rounded-lg border-2"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Optional - for map display
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="longitude"
                                                    className="text-sm font-semibold flex items-center gap-2"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Longitude
                                                </Label>
                                                <Input
                                                    id="longitude"
                                                    name="longitude"
                                                    type="number"
                                                    step="any"
                                                    placeholder="-74.0060"
                                                    className="h-12 rounded-lg border-2"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Optional - for map display
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            className="gap-2 rounded-lg h-11"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </Button>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.back()}
                                                className="rounded-lg h-11"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="gap-2 rounded-lg h-11 px-8"
                                            >
                                                Continue to Admin Setup
                                                <UserCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Admin Account */}
                            {currentStep === 3 && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <UserCircle className="w-5 h-5 text-primary" />
                                            </div>
                                            <span>Administrator Account</span>
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Create your admin account for this
                                            facility
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="adminName"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <UserCircle className="w-4 h-4" />
                                                Full Name *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="adminName"
                                                    name="adminName"
                                                    required
                                                    placeholder="John Doe"
                                                    className="h-12 rounded-lg border-2 pl-10"
                                                />
                                                <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="adminEmail"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <Mail className="w-4 h-4" />
                                                Email Address *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="adminEmail"
                                                    name="adminEmail"
                                                    type="email"
                                                    required
                                                    placeholder="admin@facility.com"
                                                    className="h-12 rounded-lg border-2 pl-10"
                                                />
                                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="adminPassword"
                                                className="text-sm font-semibold flex items-center gap-2"
                                            >
                                                <Lock className="w-4 h-4" />
                                                Password *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="adminPassword"
                                                    name="adminPassword"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    required
                                                    placeholder="Create a strong password"
                                                    className="h-12 rounded-lg border-2 pl-10 pr-10"
                                                />
                                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-2 top-2.5 h-7 w-7"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span className="text-xs text-muted-foreground">
                                                        8+ characters
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span className="text-xs text-muted-foreground">
                                                        Letters & numbers
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-primary/20">
                                                <ClipboardCheck className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground mb-2">
                                                    Review & Submit
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    By submitting, you agree to
                                                    our Terms of Service and
                                                    Privacy Policy. Your
                                                    facility will be reviewed
                                                    within 24-48 hours.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={prevStep}
                                                className="gap-2 rounded-lg h-11"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.back()}
                                                className="rounded-lg h-11"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="gap-2 rounded-lg h-11 px-10 bg-linear-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Registering Facility...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    Complete Registration
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Need help? Contact our support team at{" "}
                        <a
                            href="mailto:support@curasync.com"
                            className="text-primary hover:underline font-medium"
                        >
                            support@curasync.com
                        </a>
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                                HIPAA Compliant
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-muted-foreground">
                                Bank-Level Security
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">
                                24/7 Support
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
