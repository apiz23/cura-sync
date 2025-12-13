"use client";

import { useState } from "react";
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
import { Loader2, UserPlus, KeyRound } from "lucide-react";

type StaffRole = "doctor" | "nurse" | "admin";

export default function AddStaffPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<StaffRole | "">("");
    const [specialization, setSpecialization] = useState("");
    const [facilityId, setFacilityId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

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
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <UserPlus className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold">
                                Add Staff Member
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Create a new staff account with role and
                                permissions
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">
                            Staff Information
                        </CardTitle>
                        <CardDescription>
                            Fill in the details below to create a new staff
                            account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel>Full Name</FieldLabel>
                                    <Input
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        placeholder="John Doe"
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>Email Address</FieldLabel>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="john@example.com"
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Field>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel>Role</FieldLabel>
                                    </div>
                                    <Select
                                        value={role}
                                        onValueChange={(val: StaffRole) =>
                                            setRole(val)
                                        }
                                    >
                                        <SelectTrigger>
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
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel>
                                        Specialization
                                        <span className="text-muted-foreground ml-2">
                                            (Optional)
                                        </span>
                                    </FieldLabel>
                                    <Input
                                        value={specialization}
                                        onChange={(e) =>
                                            setSpecialization(e.target.value)
                                        }
                                        placeholder="e.g., Cardiology, Pediatrics"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>Facility ID</FieldLabel>
                                    <Input
                                        value={facilityId}
                                        onChange={(e) =>
                                            setFacilityId(e.target.value)
                                        }
                                        placeholder="Enter facility ID"
                                        required
                                    />
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel>
                                    Password
                                    <span className="text-muted-foreground ml-2">
                                        (Optional)
                                    </span>
                                </FieldLabel>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Leave empty for auto-generated"
                                />
                                <FieldDescription className="flex items-center gap-2 mt-2">
                                    <KeyRound className="w-3 h-3" />
                                    Auto-generated password will be sent to
                                    email if left empty
                                </FieldDescription>
                            </Field>

                            <div className="flex gap-3 pt-6 border-t">
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
                                    disabled={loading}
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
