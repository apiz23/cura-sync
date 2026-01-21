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
import { Building2, MapPin, UserCircle, Eye, EyeOff } from "lucide-react";
import PageTitle from "@/components/page-title";
import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperList,
    StepperNext,
    StepperPrev,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
    type StepperProps,
} from "@/components/ui/stepper";

export default function RegisterClinicPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState("facility");

    const steps = [
        {
            value: "facility",
            title: "Facility Details",
            icon: Building2,
        },
        {
            value: "location",
            title: "Location",
            icon: MapPin,
        },
        {
            value: "admin",
            title: "Admin Account",
            icon: UserCircle,
        },
    ];

    const [form, setForm] = useState({
        name: "",
        type: "",
        specialty: "",
        phone: "",
        address: "",
        latitude: "",
        longitude: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
    });

    const updateForm = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case "facility":
                if (!form.name.trim()) {
                    toast.error("Validation Error", {
                        description: "Facility name is required",
                    });
                    return false;
                }
                if (!form.type) {
                    toast.error("Validation Error", {
                        description: "Facility type is required",
                    });
                    return false;
                }
                return true;

            case "location":
                if (!form.address.trim()) {
                    toast.error("Validation Error", {
                        description: "Address is required",
                    });
                    return false;
                }
                return true;

            case "admin":
                const errors: string[] = [];
                if (!form.adminName.trim())
                    errors.push("Admin name is required");
                if (!form.adminEmail.trim())
                    errors.push("Admin email is required");
                if (!form.adminPassword) errors.push("Password is required");

                if (form.adminPassword.length < 6) {
                    errors.push("Password must be at least 6 characters");
                }

                if (form.adminEmail && !/\S+@\S+\.\S+/.test(form.adminEmail)) {
                    errors.push("Invalid email format");
                }

                if (errors.length > 0) {
                    toast.error("Validation Error", {
                        description: errors.join(", "),
                    });
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const onStepChange: StepperProps["onValidate"] = async (
        value,
        direction
    ) => {
        if (direction === "prev") return true;

        if (!validateCurrentStep()) {
            return false;
        }

        return true;
    };

    const validateForm = () => {
        const errors: string[] = [];

        if (!form.name.trim()) errors.push("Facility name is required");
        if (!form.type) errors.push("Facility type is required");
        if (!form.address.trim()) errors.push("Address is required");
        if (!form.adminName.trim()) errors.push("Admin name is required");
        if (!form.adminEmail.trim()) errors.push("Admin email is required");
        if (!form.adminPassword) errors.push("Password is required");

        if (form.adminPassword.length < 6) {
            errors.push("Password must be at least 6 characters");
        }

        if (form.adminEmail && !/\S+@\S+\.\S+/.test(form.adminEmail)) {
            errors.push("Invalid email format");
        }

        return errors;
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Validate all steps
        const errors = validateForm();
        if (errors.length > 0) {
            toast.error("Validation Error", {
                description: errors.join(", "),
            });
            return;
        }

        const payload = {
            facility: {
                name: form.name,
                type: form.type,
                specialty: form.specialty,
                phone: form.phone,
                address: form.address,
                latitude: form.latitude || null,
                longitude: form.longitude || null,
            },
            admin: {
                name: form.adminName,
                email: form.adminEmail,
                password: form.adminPassword,
            },
        };

        toast.promise(
            new Promise(async (resolve, reject) => {
                setLoading(true);

                try {
                    const res = await fetch("/api/facility/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    const result = await res.json();

                    if (!res.ok) {
                        throw new Error(result.error || "Registration failed");
                    }

                    setTimeout(() => {
                        router.push("/auth/admin");
                    }, 1500);

                    resolve(result);
                } catch (error: any) {
                    reject(error);
                } finally {
                    setLoading(false);
                }
            }),
            {
                loading: "Registering your facility...",
                success: (data: any) => {
                    return `Registration successful! Welcome ${
                        data.facility?.name || "Facility"
                    }. Redirecting...`;
                },
                error: (error) => {
                    return (
                        error.message ||
                        "Registration failed. Please try again."
                    );
                },
            }
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <PageTitle title="Register Health Center" />
            <div className="max-w-3xl mx-auto pt-16 pb-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Register Healthcare Facility
                    </h1>
                    <p className="text-muted-foreground">
                        Complete all {steps.length} steps to register your
                        facility
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Facility Registration</CardTitle>
                        <CardDescription>
                            Complete all steps to finish registration
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Stepper
                                value={currentStep}
                                onValueChange={setCurrentStep}
                                onValidate={onStepChange}
                            >
                                <StepperList>
                                    {steps.map((step, index) => {
                                        const Icon = step.icon;
                                        return (
                                            <StepperItem
                                                key={step.value}
                                                value={step.value}
                                            >
                                                <StepperTrigger>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <StepperIndicator />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Icon className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                        <div className="text-left">
                                                            <StepperTitle>
                                                                {step.title}
                                                            </StepperTitle>
                                                            <p className="text-xs text-muted-foreground">
                                                                Step {index + 1}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </StepperTrigger>
                                                {index < steps.length - 1 && (
                                                    <StepperSeparator className="ml-4" />
                                                )}
                                            </StepperItem>
                                        );
                                    })}
                                </StepperList>

                                {/* Facility Details Step */}
                                <StepperContent value="facility">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Building2 className="w-5 h-5" />{" "}
                                            Facility Details
                                        </h3>

                                        <div>
                                            <Label>Facility Name *</Label>
                                            <Input
                                                value={form.name}
                                                onChange={(e) =>
                                                    updateForm(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                placeholder="City General Hospital"
                                            />
                                        </div>

                                        <div>
                                            <Label>Facility Type *</Label>
                                            <Select
                                                value={form.type}
                                                onValueChange={(v) =>
                                                    updateForm("type", v)
                                                }
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Clinic">
                                                        Clinic
                                                    </SelectItem>
                                                    <SelectItem value="Hospital">
                                                        Hospital
                                                    </SelectItem>
                                                    <SelectItem value="Pharmacy">
                                                        Pharmacy
                                                    </SelectItem>
                                                    <SelectItem value="Lab">
                                                        Laboratory
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Specialty</Label>
                                            <Input
                                                value={form.specialty}
                                                onChange={(e) =>
                                                    updateForm(
                                                        "specialty",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Cardiology, Pediatrics, etc."
                                            />
                                        </div>

                                        <div>
                                            <Label>Phone</Label>
                                            <Input
                                                value={form.phone}
                                                onChange={(e) =>
                                                    updateForm(
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>
                                </StepperContent>

                                {/* Location Step */}
                                <StepperContent value="location">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />{" "}
                                            Location
                                        </h3>

                                        <div>
                                            <Label>Full Address *</Label>
                                            <textarea
                                                className="w-full border rounded-md p-2 resize-none"
                                                rows={3}
                                                value={form.address}
                                                onChange={(e) =>
                                                    updateForm(
                                                        "address",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                placeholder="123 Medical Center Drive, Suite 100, City, State, ZIP"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Latitude</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={form.latitude}
                                                    onChange={(e) =>
                                                        updateForm(
                                                            "latitude",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 2.312345"
                                                />
                                            </div>

                                            <div>
                                                <Label>Longitude</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={form.longitude}
                                                    onChange={(e) =>
                                                        updateForm(
                                                            "longitude",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 102.123456"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </StepperContent>

                                {/* Admin Account Step */}
                                <StepperContent value="admin">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <UserCircle className="w-5 h-5" />{" "}
                                            Admin Account
                                        </h3>

                                        <div>
                                            <Label>Admin Name *</Label>
                                            <Input
                                                value={form.adminName}
                                                onChange={(e) =>
                                                    updateForm(
                                                        "adminName",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <Label>Email *</Label>
                                            <Input
                                                type="email"
                                                value={form.adminEmail}
                                                onChange={(e) =>
                                                    updateForm(
                                                        "adminEmail",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                placeholder="admin@facility.com"
                                            />
                                        </div>

                                        <div>
                                            <Label>Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={form.adminPassword}
                                                    onChange={(e) =>
                                                        updateForm(
                                                            "adminPassword",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    placeholder="At least 6 characters"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted p-1 rounded"
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
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Must be at least 6 characters
                                                long
                                            </p>
                                        </div>
                                    </div>
                                </StepperContent>

                                {/* Navigation Buttons */}
                                <div className="mt-6 flex justify-between">
                                    <StepperPrev asChild>
                                        <Button type="button" variant="outline">
                                            Back
                                        </Button>
                                    </StepperPrev>

                                    <div className="text-sm text-muted-foreground">
                                        Step{" "}
                                        {steps.findIndex(
                                            (s) => s.value === currentStep
                                        ) + 1}{" "}
                                        of {steps.length}
                                    </div>

                                    {currentStep ===
                                    steps[steps.length - 1].value ? (
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Registering..."
                                                : "Complete Registration"}
                                        </Button>
                                    ) : (
                                        <StepperNext asChild>
                                            <Button type="button">
                                                Continue
                                            </Button>
                                        </StepperNext>
                                    )}
                                </div>
                            </Stepper>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
