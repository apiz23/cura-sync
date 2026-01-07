"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
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
import { Loader2, UserPlus } from "lucide-react";

type StaffRole = "doctor" | "nurse" | "admin";

export default function AddStaffPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<StaffRole | "">("");
    const [specialization, setSpecialization] = useState("");
    const [facilityId, setFacilityId] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fid = sessionStorage.getItem("facilityId");

        if (!fid) {
            toast.error("No facility assigned to this admin");
            router.push("/admin/login");
            return;
        }

        setFacilityId(fid);
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (!facilityId) {
            toast.error("Facility not found in session");
            return;
        }

        try {
            const res = await fetch("/api/staff/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    email,
                    role,
                    specialization,
                    facilityId,
                    password: password.trim() === "" ? null : password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to create staff");
            } else {
                toast.success("Staff created successfully!");
                router.push("/admin/profile");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }

        setLoading(false);
    }

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <UserPlus className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-semibold">
                            Add New Staff
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Create a new staff account for your facility
                    </p>
                </div>

                {/* Form Card */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Staff Details</CardTitle>
                        <CardDescription>
                            Fill in the information below
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field>
                                        <FieldLabel className="text-sm font-medium">
                                            Full Name *
                                        </FieldLabel>
                                        <Input
                                            value={fullName}
                                            onChange={(e) =>
                                                setFullName(e.target.value)
                                            }
                                            placeholder="John Doe"
                                            required
                                            className="mt-1"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel className="text-sm font-medium">
                                            Email Address *
                                        </FieldLabel>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="john@example.com"
                                            required
                                            className="mt-1"
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Professional Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field>
                                        <FieldLabel className="text-sm font-medium">
                                            Role *
                                        </FieldLabel>
                                        <Select
                                            value={role}
                                            onValueChange={(val: StaffRole) =>
                                                setRole(val)
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="doctor">
                                                    Doctor
                                                </SelectItem>
                                                <SelectItem value="nurse">
                                                    Nurse
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    Administrator
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field>
                                        <FieldLabel className="text-sm font-medium">
                                            Specialization
                                            <span className="text-gray-500 font-normal ml-1">
                                                (Optional)
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            value={specialization}
                                            onChange={(e) =>
                                                setSpecialization(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g., Cardiology"
                                            className="mt-1"
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Account Information
                                </h3>
                                <Field>
                                    <FieldLabel className="text-sm font-medium">
                                        Password
                                        <span className="text-gray-500 font-normal ml-1">
                                            (Optional)
                                        </span>
                                    </FieldLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Leave empty for auto-generated password"
                                        className="mt-1"
                                    />
                                    <FieldDescription className="mt-2 text-gray-500">
                                        If left empty, a secure password will be
                                        automatically generated and emailed
                                    </FieldDescription>
                                </Field>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 border-t flex flex-col sm:flex-row gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        loading || !role || !fullName || !email
                                    }
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
