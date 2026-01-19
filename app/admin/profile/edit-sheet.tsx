"use client";

import React, { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Calendar,
    Building2,
    FileText,
    Shield,
    Check,
    ChevronLeft,
    UserCircle,
    GraduationCap,
    Key,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthUser } from "@/app/types";

interface EditStaffProfileModalProps {
    user: AuthUser;
    onSave: (updatedData: Partial<AuthUser>) => Promise<void>;
    onClose: () => void;
}

export default function EditStaffProfileModal({
    user,
    onSave,
    onClose,
}: EditStaffProfileModalProps) {
    const [formData, setFormData] = useState<Partial<AuthUser>>({
        ...user,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"personal" | "professional">(
        "personal"
    );

    useEffect(() => {
        setFormData({ ...user });
    }, [user]);

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
        id: "personal" | "professional";
        label: string;
        icon: React.ElementType;
        description: string;
        color: string;
    }[] = [
        {
            id: "personal",
            label: "Personal Info",
            icon: UserCircle,
            description: "Update your personal details",
            color: "text-blue-600 bg-blue-50",
        },
        {
            id: "professional",
            label: "Professional",
            icon: GraduationCap,
            description: "Set your professional information",
            color: "text-purple-600 bg-purple-50",
        },
    ];

    const currentTab = tabs.find((tab) => tab.id === activeTab);

    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl overflow-y-auto p-0 border-l">
                {/* Header */}
                <SheetHeader className="p-6 border-b bg-linear-to-r from-background to-muted/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <UserCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-2xl font-bold text-foreground">
                                Edit Staff Profile
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground mt-1">
                                Update professional information for{" "}
                                <span className="font-semibold text-foreground">
                                    {user.full_name}
                                </span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* Tabs Navigation */}
                <div className="px-6 pt-4">
                    <div className="flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex-1 justify-center ${
                                        activeTab === tab.id
                                            ? `${tab.color.split(" ")[1]} ${
                                                  tab.color.split(" ")[0]
                                              } border shadow-sm`
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Tab Content Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    currentTab?.color.split(" ")[1]
                                }`}
                            >
                                {currentTab && (
                                    <currentTab.icon
                                        className={`w-5 h-5 ${
                                            currentTab.color.split(" ")[0]
                                        }`}
                                    />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {currentTab?.label}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {currentTab?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information Tab */}
                    {activeTab === "personal" && (
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="full_name"
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <User className="w-4 h-4 text-primary" />
                                            Full Name
                                            <Badge
                                                variant="outline"
                                                className="ml-2 text-xs"
                                            >
                                                Required
                                            </Badge>
                                        </Label>
                                        <Input
                                            id="full_name"
                                            name="full_name"
                                            value={formData.full_name || ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className="h-12"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="email"
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <Mail className="w-4 h-4 text-primary" />
                                            Email Address
                                            <Badge
                                                variant="outline"
                                                className="ml-2 text-xs"
                                            >
                                                Required
                                            </Badge>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email || ""}
                                            onChange={handleInputChange}
                                            placeholder="your.email@example.com"
                                            className="h-12"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="role"
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <Shield className="w-4 h-4 text-primary" />
                                            Role
                                            <Badge
                                                variant="outline"
                                                className="ml-2 text-xs"
                                            >
                                                Required
                                            </Badge>
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
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="doctor">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        Doctor
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="user">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        Staff
                                                    </div>
                                                </SelectItem>

                                                <SelectItem value="admin">
                                                    <div className="flex items-center gap-2">
                                                        <Key className="w-4 h-4" />
                                                        Administrator
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Professional Information Tab */}
                    {activeTab === "professional" && (
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="specialization"
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <Award className="w-4 h-4 text-primary" />
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
                                            className="h-12"
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="license_number"
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4 text-primary" />
                                            License Number
                                        </Label>
                                        <Input
                                            id="license_number"
                                            name="license_number"
                                            value={
                                                formData.license_number || ""
                                            }
                                            onChange={handleInputChange}
                                            placeholder="Enter license ID"
                                            className="h-12"
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="years_of_experience"
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4 text-primary" />
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
                                            className="h-12"
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="facility_id"
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <Building2 className="w-4 h-4 text-primary" />
                                            Facility ID
                                        </Label>
                                        <Input
                                            id="facility_id"
                                            name="facility_id"
                                            value={formData.facility_id || ""}
                                            onChange={handleInputChange}
                                            placeholder="Facility identifier"
                                            className="h-12"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Form Actions */}
                    <SheetFooter className="flex flex-col sm:flex-row gap-3 pt-8">
                        <div className="flex-1 flex gap-3">
                            {activeTab !== "personal" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const prevTab =
                                            tabs[
                                                (tabs.findIndex(
                                                    (t) => t.id === activeTab
                                                ) -
                                                    1 +
                                                    tabs.length) %
                                                    tabs.length
                                            ];
                                        setActiveTab(prevTab.id);
                                    }}
                                    className="gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="px-6"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="gap-2 px-6"
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
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
