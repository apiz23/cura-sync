"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
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
} from "lucide-react";

export default function RegisterClinicPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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
                });
                setTimeout(() => {
                    router.push("/admin/dashboard");
                }, 1500);
            } else {
                toast.error("Registration Failed", {
                    description:
                        result.error ||
                        "Please check your information and try again.",
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

    return (
        <div className="min-h-screen bg-linear-to-b from-background via-muted/10 to-background flex items-center justify-center p-4 md:p-6">
            <Toaster
                position="top-center"
                richColors
                toastOptions={{
                    className: "rounded-xl border-border",
                }}
            />

            <div className="w-full max-w-4xl pt-20 pb-8">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            Secure Facility Registration
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Register Your{" "}
                        <span className="text-primary">
                            Healthcare Facility
                        </span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
                        Complete the form below to join CuraSync{"'"}s healthcare
                        network
                    </p>
                </div>

                <Card className="border-2 border-border/50 shadow-lg md:shadow-xl overflow-hidden">
                    <CardHeader className="space-y-2 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                Facility Registration Form
                            </CardTitle>
                        </div>
                        <CardDescription className="text-base">
                            All fields marked with * are required
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Section 1: Facility Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Facility Information
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Basic details about your healthcare
                                        facility
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Facility Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="e.g., City General Hospital"
                                            className="h-12 rounded-xl border-border bg-input/50"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="type"
                                            className="text-sm font-medium"
                                        >
                                            Facility Type *
                                        </Label>
                                        <Select name="type" required>
                                            <SelectTrigger className="h-12 rounded-xl border-border bg-input/50">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border">
                                                <SelectItem
                                                    value="Clinic"
                                                    className="rounded-lg"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        🏥 Clinic
                                                    </span>
                                                </SelectItem>
                                                <SelectItem
                                                    value="Hospital"
                                                    className="rounded-lg"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        🏨 Hospital
                                                    </span>
                                                </SelectItem>
                                                <SelectItem
                                                    value="Pharmacy"
                                                    className="rounded-lg"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        💊 Pharmacy
                                                    </span>
                                                </SelectItem>
                                                <SelectItem
                                                    value="Lab"
                                                    className="rounded-lg"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        🔬 Laboratory
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <Label
                                            htmlFor="specialty"
                                            className="text-sm font-medium"
                                        >
                                            Primary Specialty
                                        </Label>
                                        <Input
                                            id="specialty"
                                            name="specialty"
                                            placeholder="e.g., Cardiology, Pediatrics, Surgery"
                                            className="h-12 rounded-xl border-border bg-input/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Location Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Location Information
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Where your facility is located
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="address"
                                            className="text-sm font-medium"
                                        >
                                            Full Address *
                                        </Label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            required
                                            rows={3}
                                            placeholder="Street Address, City, State, Zip Code"
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-input/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="latitude"
                                                className="text-sm font-medium"
                                            >
                                                Latitude (Optional)
                                            </Label>
                                            <Input
                                                id="latitude"
                                                name="latitude"
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 40.7128"
                                                className="h-12 rounded-xl border-border bg-input/50"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label
                                                htmlFor="longitude"
                                                className="text-sm font-medium"
                                            >
                                                Longitude (Optional)
                                            </Label>
                                            <Input
                                                id="longitude"
                                                name="longitude"
                                                type="number"
                                                step="any"
                                                placeholder="e.g., -74.0060"
                                                className="h-12 rounded-xl border-border bg-input/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Admin Account */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <UserCircle className="w-5 h-5" />
                                        Administrator Account
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Create the primary admin account for
                                        this facility
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="adminName"
                                            className="text-sm font-medium"
                                        >
                                            Full Name *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="adminName"
                                                name="adminName"
                                                required
                                                placeholder="John Doe"
                                                className="h-12 rounded-xl border-border bg-input/50 pl-10"
                                            />
                                            <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="adminEmail"
                                            className="text-sm font-medium"
                                        >
                                            Email Address *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="adminEmail"
                                                name="adminEmail"
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                className="h-12 rounded-xl border-border bg-input/50 pl-10"
                                            />
                                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <Label
                                            htmlFor="adminPassword"
                                            className="text-sm font-medium"
                                        >
                                            Password *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="adminPassword"
                                                name="adminPassword"
                                                type="password"
                                                required
                                                placeholder="Create a strong password (min. 8 characters)"
                                                className="h-12 rounded-xl border-border bg-input/50 pl-10"
                                            />
                                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Use a combination of letters,
                                            numbers, and symbols for security
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Submit */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                                    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Security & Privacy
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            By registering, you agree to our{" "}
                                            <a
                                                href="/terms"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="/privacy"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                Privacy Policy
                                            </a>
                                            . Your data is encrypted and handled
                                            securely.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between items-center pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="w-full sm:w-auto rounded-xl h-12 px-8 border-border hover:bg-muted"
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto rounded-xl h-12 px-12 text-base font-semibold bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                                Registering Facility...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Complete Registration
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
