"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Award,
    Briefcase,
    Calendar,
    Clock,
    Building2,
    FileText,
    Shield,
    Check,
} from "lucide-react";
import { toast } from "sonner";

interface Availability {
    available?: boolean;
    schedule?: string;
    notes?: string;
    updated_at?: string;
}

interface StaffProfile {
    id: string;
    full_name: string;
    email: string;
    role: "doctor" | "nurse" | "admin";
    specialization: string | null;
    license_number: string | null;
    facility_id: string | null;
    years_of_experience: number | null;
    availability: Availability | null;
    created_at: string;
}

interface EditStaffProfileModalProps {
    staff: StaffProfile;
    onSave: (updatedData: Partial<StaffProfile>) => void;
    onClose: () => void;
}

export default function EditStaffProfileModal({
    staff,
    onSave,
    onClose,
}: EditStaffProfileModalProps) {
    const [formData, setFormData] = useState<Partial<StaffProfile>>({
        ...staff,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "personal" | "professional" | "availability"
    >("personal");

    useEffect(() => {
        setFormData({ ...staff });
    }, [staff]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: string) => {
        const numValue = value === "" ? null : parseInt(value, 10);
        if (
            !value ||
            (!isNaN(numValue as number) && (numValue as number) >= 0)
        ) {
            setFormData((prev) => ({ ...prev, [name]: numValue }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.full_name?.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!formData.email?.trim()) {
            toast.error("Email is required");
            return;
        }

        if (!formData.role) {
            toast.error("Role is required");
            return;
        }

        setIsSubmitting(true);

        try {
            await onSave(formData);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs: {
        id: "personal" | "professional" | "availability";
        label: string;
        icon: React.ElementType;
    }[] = [
        { id: "personal", label: "Personal", icon: User },
        { id: "professional", label: "Professional", icon: Briefcase },
        { id: "availability", label: "Availability", icon: Clock },
    ];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-2 shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                Edit Profile
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Update your professional information
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <div className="px-6 pt-2">
                    <div className="flex border-b">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                                        activeTab === tab.id
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {/* Personal Information Tab */}
                    {activeTab === "personal" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="full_name"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <User className="w-4 h-4" />
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="full_name"
                                            name="full_name"
                                            value={formData.full_name || ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className="bg-background"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="email"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email || ""}
                                            onChange={handleInputChange}
                                            placeholder="your.email@example.com"
                                            className="bg-background"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="role"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Role *
                                        </Label>
                                        <Select
                                            value={formData.role || ""}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "role",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select your role" />
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Professional Information Tab */}
                    {activeTab === "professional" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="specialization"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Award className="w-4 h-4" />
                                            Specialization
                                        </Label>
                                        <Input
                                            id="specialization"
                                            name="specialization"
                                            value={
                                                formData.specialization || ""
                                            }
                                            onChange={handleInputChange}
                                            placeholder="e.g., Cardiology, Neurology"
                                            className="bg-background"
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="license_number"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            License Number
                                        </Label>
                                        <Input
                                            id="license_number"
                                            name="license_number"
                                            value={
                                                formData.license_number || ""
                                            }
                                            onChange={handleInputChange}
                                            placeholder="License ID"
                                            className="bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="years_of_experience"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Years of Experience
                                        </Label>
                                        <Input
                                            id="years_of_experience"
                                            name="years_of_experience"
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={
                                                formData.years_of_experience ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleNumberChange(
                                                    "years_of_experience",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Number of years"
                                            className="bg-background"
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="facility_id"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Building2 className="w-4 h-4" />
                                            Facility ID
                                        </Label>
                                        <Input
                                            id="facility_id"
                                            name="facility_id"
                                            value={formData.facility_id || ""}
                                            onChange={handleInputChange}
                                            placeholder="Facility identifier"
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Availability Tab */}
                    {activeTab === "availability" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4" />
                                            Availability Status
                                        </Label>
                                        <Select
                                            value={
                                                formData.availability
                                                    ?.available !== undefined
                                                    ? String(
                                                          formData.availability
                                                              .available
                                                      )
                                                    : "true"
                                            }
                                            onValueChange={(value) => {
                                                const availability = {
                                                    ...formData.availability,
                                                    available: value === "true",
                                                    updated_at:
                                                        new Date().toISOString(),
                                                };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    availability,
                                                }));
                                            }}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select availability" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        Available
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="false">
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        Unavailable
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {formData.availability && (
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="availability_schedule"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Schedule
                                        </Label>
                                        <Input
                                            id="availability_schedule"
                                            value={
                                                formData.availability
                                                    .schedule || ""
                                            }
                                            onChange={(e) => {
                                                const availability = {
                                                    ...formData.availability,
                                                    schedule: e.target.value,
                                                };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    availability,
                                                }));
                                            }}
                                            placeholder="e.g., Monday-Friday 9AM-5PM"
                                            className="bg-background"
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="availability_notes"
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Availability Notes
                                        </Label>
                                        <Textarea
                                            id="availability_notes"
                                            value={
                                                formData.availability.notes ||
                                                ""
                                            }
                                            onChange={(e) => {
                                                const availability = {
                                                    ...formData.availability,
                                                    notes: e.target.value,
                                                };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    availability,
                                                }));
                                            }}
                                            placeholder="Add any notes about your availability"
                                            className="min-h-[80px] bg-background"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form Actions */}
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        {activeTab !== "availability" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const nextTab =
                                        tabs[
                                            (tabs.findIndex(
                                                (t) => t.id === activeTab
                                            ) +
                                                1) %
                                                tabs.length
                                        ];
                                    setActiveTab(nextTab.id);
                                }}
                                className="w-full sm:w-auto"
                            >
                                Next:{" "}
                                {
                                    tabs[
                                        (tabs.findIndex(
                                            (t) => t.id === activeTab
                                        ) +
                                            1) %
                                            tabs.length
                                    ].label
                                }
                            </Button>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
