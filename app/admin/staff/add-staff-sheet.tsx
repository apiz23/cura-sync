"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    UserPlus,
    Mail,
    User,
    Shield,
    Stethoscope,
    Key,
    Eye,
    EyeOff,
    Sparkles,
    Loader2,
    BriefcaseMedical,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StaffRole = "doctor" | "nurse" | "admin";

export default function AddStaffSheet({
    onSuccess,
}: {
    onSuccess: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        role: "" as StaffRole | "",
        specialization: "",
        password: "",
    });

    const validateForm = () => {
        const e: Record<string, string> = {};

        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!form.email.trim()) e.email = "Email is required";
        if (!form.role) e.role = "Role is required";
        if (!form.password || form.password.length < 8)
            e.password = "Password must be at least 8 characters";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const generatePassword = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let pwd = "";
        for (let i = 0; i < 12; i++) {
            pwd += chars[Math.floor(Math.random() * chars.length)];
        }
        setForm((f) => ({ ...f, password: pwd }));
    };

    async function submit() {
        if (!validateForm()) return;

        const facilityId = sessionStorage.getItem("facilityId");
        if (!facilityId) {
            toast.error("Facility not found");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: form.fullName,
                    email: form.email,
                    role: form.role,
                    specialization:
                        form.role === "doctor" ? form.specialization : null,
                    password: form.password,
                    facilityId,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Staff added successfully");
            setOpen(false);
            setForm({
                fullName: "",
                email: "",
                role: "",
                specialization: "",
                password: "",
            });
            setErrors({});
            onSuccess();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to add staff");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="gap-2 shadow-sm hover:shadow transition-shadow duration-200">
                    <UserPlus className="w-4 h-4" />
                    Add Staff
                </Button>
            </SheetTrigger>

            <SheetContent className="sm:max-w-lg p-0 overflow-hidden">
                <form
                    className="flex flex-col h-full"
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                >
                    {/* Header */}
                    <SheetHeader className="px-6 py-6 border-b bg-linear-to-r from-primary/5 via-primary/2 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <UserPlus className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-semibold">
                                    Add New Staff Member
                                </SheetTitle>
                                <SheetDescription className="text-muted-foreground">
                                    Create a new staff account with role-based
                                    permissions
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Form Content */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </Label>
                                <span className="text-xs text-destructive">
                                    Required
                                </span>
                            </div>
                            <Input
                                placeholder="Enter full name"
                                value={form.fullName}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fullName: e.target.value,
                                    })
                                }
                                className={cn(
                                    "focus:ring-2 focus:ring-primary/20 transition-colors",
                                    errors.fullName &&
                                        "border-destructive focus:ring-destructive/20"
                                )}
                            />
                            {errors.fullName && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </Label>
                                <span className="text-xs text-destructive">
                                    Required
                                </span>
                            </div>
                            <Input
                                type="email"
                                placeholder="staff@example.com"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className={cn(
                                    "focus:ring-2 focus:ring-primary/20 transition-colors",
                                    errors.email &&
                                        "border-destructive focus:ring-destructive/20"
                                )}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Role
                                </Label>
                                <span className="text-xs text-destructive">
                                    Required
                                </span>
                            </div>
                            <Select
                                value={form.role}
                                onValueChange={(v) =>
                                    setForm({
                                        ...form,
                                        role: v as StaffRole,
                                        specialization:
                                            v === "doctor"
                                                ? form.specialization
                                                : "",
                                    })
                                }
                            >
                                <SelectTrigger
                                    className={cn(
                                        "focus:ring-2 focus:ring-primary/20 transition-colors",
                                        errors.role &&
                                            "border-destructive focus:ring-destructive/20"
                                    )}
                                >
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="doctor" className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                                <Stethoscope className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Doctor
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Medical practitioner
                                                </p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="nurse" className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Nurse
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Healthcare professional
                                                </p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="admin" className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Administrator
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    System administrator
                                                </p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* Specialization (only for doctors) */}
                        {form.role === "doctor" && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <BriefcaseMedical className="w-4 h-4" />
                                    Specialization
                                </Label>
                                <Input
                                    placeholder="e.g., Cardiology, Neurology, Pediatrics"
                                    value={form.specialization}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            specialization: e.target.value,
                                        })
                                    }
                                    className="focus:ring-2 focus:ring-primary/20 transition-colors"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional field for medical specialization
                                </p>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    Password
                                </Label>
                                <span className="text-xs text-destructive">
                                    Required
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Create a secure password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password: e.target.value,
                                            })
                                        }
                                        className={cn(
                                            "pr-10 focus:ring-2 focus:ring-primary/20 transition-colors",
                                            errors.password &&
                                                "border-destructive focus:ring-destructive/20"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={generatePassword}
                                    className="shrink-0"
                                    title="Generate secure password"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    {errors.password}
                                </p>
                            )}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        Password strength:
                                    </span>
                                    <span
                                        className={cn(
                                            "font-medium",
                                            form.password.length >= 8
                                                ? "text-emerald-600"
                                                : "text-amber-600"
                                        )}
                                    >
                                        {form.password.length >= 8
                                            ? "✓ Strong"
                                            : "Weak"}
                                    </span>
                                </div>
                                {form.password && (
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-300",
                                                form.password.length >= 12
                                                    ? "w-full bg-emerald-500"
                                                    : form.password.length >= 8
                                                    ? "w-2/3 bg-blue-500"
                                                    : "w-1/3 bg-amber-500"
                                            )}
                                        />
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground pt-1">
                                    Staff will change password on first login.
                                    Minimum 8 characters required.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <SheetFooter className="p-6 border-t bg-muted/10">
                        <div className="flex gap-3 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 gap-2 shadow-sm hover:shadow transition-shadow duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Create Staff
                                    </>
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
