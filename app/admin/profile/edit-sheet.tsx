"use client";

import React, { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    Mail,
    Award,
    Calendar,
    FileText,
    Check,
    UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthUser } from "@/app/types";

interface EditStaffProfileModalProps {
    user: AuthUser;
    onSave: (updatedData: Partial<AuthUser>) => Promise<boolean>;
    onClose: () => void;
}

export default function EditStaffProfileModal({
    user,
    onSave,
    onClose,
}: EditStaffProfileModalProps) {
    const [formData, setFormData] = useState<Partial<AuthUser>>({
        full_name: user.full_name,
        email: user.email,
        specialization: user.specialization,
        license_number: user.license_number,
        years_of_experience: user.years_of_experience,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            full_name: user.full_name,
            email: user.email,
            specialization: user.specialization,
            license_number: user.license_number,
            years_of_experience: user.years_of_experience,
        });
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.full_name?.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!formData.email?.trim()) {
            toast.error("Email is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const ok = await onSave({
                full_name: formData.full_name,
                email: formData.email,
                specialization: formData.specialization,
                license_number: formData.license_number,
                years_of_experience:
                    formData.years_of_experience === null ||
                    formData.years_of_experience === undefined
                        ? null
                        : Number(formData.years_of_experience),
            });

            if (ok) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl overflow-y-auto p-0 border-l">
                <SheetHeader className="p-6 border-b bg-linear-to-r from-background to-muted/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <UserCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-2xl font-bold text-foreground">
                                Edit My Profile
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground mt-1">
                                Personal details live here. Role and facility assignments are read-only from your account view.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="p-6">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="full_name" className="mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />
                                        Full Name
                                        <Badge variant="outline" className="ml-2 text-xs">
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
                                    <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        Email Address
                                        <Badge variant="outline" className="ml-2 text-xs">
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
                                    <Label htmlFor="specialization" className="mb-2 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-primary" />
                                        Specialization
                                    </Label>
                                    <Input
                                        id="specialization"
                                        name="specialization"
                                        value={formData.specialization || ""}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Cardiology, Neurology"
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="license_number" className="mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        License Number
                                    </Label>
                                    <Input
                                        id="license_number"
                                        name="license_number"
                                        value={formData.license_number || ""}
                                        onChange={handleInputChange}
                                        placeholder="Enter license ID"
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="years_of_experience" className="mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Years of Experience
                                    </Label>
                                    <Input
                                        id="years_of_experience"
                                        name="years_of_experience"
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={formData.years_of_experience ?? ""}
                                        onChange={handleInputChange}
                                        placeholder="Number of years"
                                        className="h-12"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <SheetFooter className="flex flex-col sm:flex-row gap-3 pt-8">
                        <div className="flex gap-3 sm:ml-auto">
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
