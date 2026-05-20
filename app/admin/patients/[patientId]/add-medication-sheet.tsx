"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Check,
    Pill,
    CalendarIcon,
    Clock,
    AlertCircle,
    Clock3,
    Stethoscope,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    getDefaultScheduleForFrequency,
    getScheduleOptionsForFrequency,
    MEDICATION_FREQUENCY_OPTIONS,
    normalizeMedicationFrequency,
    normalizeMedicationSchedule,
} from "@/lib/medication-options";

/* ================= TYPES ================= */

type MedicationFormData = {
    name: string;
    dosage: string;
    frequency: string;
    schedule: string;
    status: string;
    start_date: Date;
    end_date?: Date;
    notes: string;
    prescribed_by: string;
};

type FormErrors = Partial<Record<keyof MedicationFormData | "submit", string>>;

/* ================= CONSTANTS ================= */

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "STOPPED", label: "Stopped" },
];

/* ================= COMPONENT ================= */

export default function AddMedicationSheet({
    children,
    profileId,
    onSuccess,
    doctorName = "",
}: {
    children: React.ReactNode;
    profileId: string;
    onSuccess: () => void;
    doctorName?: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<MedicationFormData>({
        name: "",
        dosage: "",
        frequency: "Once daily",
        schedule: getDefaultScheduleForFrequency("Once daily"),
        status: "ACTIVE",
        start_date: new Date(),
        end_date: undefined,
        notes: "",
        prescribed_by: doctorName || "",
    });

    const [errors, setErrors] = useState<FormErrors>({});

    /* ================= HANDLERS ================= */

    const handleInputChange = <K extends keyof MedicationFormData>(
        field: K,
        value: MedicationFormData[K]
    ) => {
        if (field === "frequency") {
            const nextFrequency = normalizeMedicationFrequency(String(value));
            setFormData((prev) => ({
                ...prev,
                frequency: nextFrequency,
                schedule: normalizeMedicationSchedule(
                    nextFrequency,
                    prev.schedule
                ),
            }));
        } else if (field === "schedule") {
            setFormData((prev) => ({
                ...prev,
                schedule: normalizeMedicationSchedule(
                    prev.frequency,
                    String(value)
                ),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Medication name is required";
        }
        if (!formData.dosage.trim()) {
            newErrors.dosage = "Dosage is required";
        }
        if (!formData.frequency) {
            newErrors.frequency = "Frequency is required";
        }
        if (!formData.schedule) {
            newErrors.schedule = "Schedule is required";
        }
        if (!formData.start_date) {
            newErrors.start_date = "Start date is required";
        }
        if (formData.end_date && formData.end_date < formData.start_date) {
            newErrors.end_date = "End date cannot be before start date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                profile_id: profileId, // Use the profileId prop
                name: formData.name.trim(),
                dosage: formData.dosage.trim(),
                frequency: normalizeMedicationFrequency(formData.frequency),
                schedule: normalizeMedicationSchedule(
                    formData.frequency,
                    formData.schedule
                ),
                status: formData.status,
                start_date: format(formData.start_date, "yyyy-MM-dd"),
                end_date: formData.end_date
                    ? format(formData.end_date, "yyyy-MM-dd")
                    : null,
                notes: formData.notes.trim() || null,
                prescribed_by: formData.prescribed_by.trim() || null,
            };

            const response = await fetch("/api/medications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to add medication");
            }

            // Reset form
            setFormData({
                name: "",
                dosage: "",
                frequency: "Once daily",
                schedule: getDefaultScheduleForFrequency("Once daily"),
                status: "ACTIVE",
                start_date: new Date(),
                end_date: undefined,
                notes: "",
                prescribed_by: doctorName || "",
            });

            setErrors({});
            setOpen(false);
            onSuccess();
        } catch (error) {
            setErrors({
                submit:
                    error instanceof Error
                        ? error.message
                        : "Failed to add medication. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            // Reset form when opening
            setFormData({
                name: "",
                dosage: "",
                frequency: "Once daily",
                schedule: getDefaultScheduleForFrequency("Once daily"),
                status: "ACTIVE",
                start_date: new Date(),
                end_date: undefined,
                notes: "",
                prescribed_by: doctorName || "",
            });
            setErrors({});
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent className="sm:max-w-[500px] overflow-y-auto p-0">
                <div className="p-6">
                    <SheetHeader className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
                                <Pill className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold">
                                    Add New Medication
                                </SheetTitle>
                                <SheetDescription className="text-muted-foreground">
                                    Prescribe medication for patient
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {(() => {
                        const scheduleOptions = getScheduleOptionsForFrequency(
                            formData.frequency
                        );

                        return (
                    <div className="space-y-5 py-2">
                        {/* Medication Name */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Medication Name *
                                </Label>
                                {errors.name && (
                                    <span className="text-xs text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.name}
                                    </span>
                                )}
                            </div>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                }
                                placeholder="e.g., Metformin, Ibuprofen, Amoxicillin"
                                className={cn(
                                    "rounded-lg h-10",
                                    errors.name &&
                                        "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                        </div>

                        {/* Dosage */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="dosage"
                                    className="text-sm font-medium"
                                >
                                    Dosage *
                                </Label>
                                {errors.dosage && (
                                    <span className="text-xs text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.dosage}
                                    </span>
                                )}
                            </div>
                            <Input
                                id="dosage"
                                value={formData.dosage}
                                onChange={(e) =>
                                    handleInputChange("dosage", e.target.value)
                                }
                                placeholder="e.g., 500mg, 200mg, 5ml"
                                className={cn(
                                    "rounded-lg h-10",
                                    errors.dosage &&
                                        "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                        </div>

                        {/* Frequency & Schedule Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="frequency"
                                    className="text-sm font-medium"
                                >
                                    Frequency *
                                </Label>
                                <Select
                                    value={formData.frequency}
                                    onValueChange={(value) =>
                                        handleInputChange("frequency", value)
                                    }
                                >
                                    <SelectTrigger className="h-10 rounded-lg">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {MEDICATION_FREQUENCY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="rounded-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="schedule"
                                    className="text-sm font-medium"
                                >
                                    Schedule *
                                </Label>
                                <Select
                                    value={formData.schedule}
                                    onValueChange={(value) =>
                                        handleInputChange("schedule", value)
                                    }
                                >
                                    <SelectTrigger className="h-10 rounded-lg">
                                        <SelectValue placeholder="Select schedule" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {scheduleOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="rounded-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dates Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Start Date *
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-10 justify-start text-left font-normal rounded-lg",
                                                !formData.start_date &&
                                                    "text-muted-foreground",
                                                errors.start_date &&
                                                    "border-destructive"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.start_date ? (
                                                format(
                                                    formData.start_date,
                                                    "MMM d, yyyy"
                                                )
                                            ) : (
                                                <span>Select date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 rounded-lg"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={formData.start_date}
                                            onSelect={(date) =>
                                                date &&
                                                handleInputChange(
                                                    "start_date",
                                                    date
                                                )
                                            }
                                            initialFocus
                                            className="rounded-lg"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    End Date (Optional)
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-10 justify-start text-left font-normal rounded-lg",
                                                !formData.end_date &&
                                                    "text-muted-foreground",
                                                errors.end_date &&
                                                    "border-destructive"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.end_date ? (
                                                format(
                                                    formData.end_date,
                                                    "MMM d, yyyy"
                                                )
                                            ) : (
                                                <span>Select date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 rounded-lg"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={formData.end_date}
                                            onSelect={(date) =>
                                                handleInputChange(
                                                    "end_date",
                                                    date
                                                )
                                            }
                                            initialFocus
                                            disabled={(date) =>
                                                formData.start_date
                                                    ? date < formData.start_date
                                                    : false
                                            }
                                            className="rounded-lg"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Prescribed By */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="prescribed_by"
                                className="text-sm font-medium flex items-center gap-2"
                            >
                                <Stethoscope className="h-3.5 w-3.5" />
                                Prescribed By (Optional)
                            </Label>
                            <Input
                                id="prescribed_by"
                                value={formData.prescribed_by}
                                onChange={(e) =>
                                    handleInputChange(
                                        "prescribed_by",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g., Dr. Smith"
                                className="rounded-lg h-10"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="status"
                                className="text-sm font-medium"
                            >
                                Status
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    handleInputChange("status", value)
                                }
                            >
                                <SelectTrigger className="h-10 rounded-lg">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="rounded-md"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`h-2 w-2 rounded-full ${
                                                        option.value ===
                                                        "ACTIVE"
                                                            ? "bg-green-500"
                                                            : option.value ===
                                                              "COMPLETED"
                                                            ? "bg-blue-500"
                                                            : "bg-red-500"
                                                    }`}
                                                />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="notes"
                                className="text-sm font-medium"
                            >
                                Additional Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    handleInputChange("notes", e.target.value)
                                }
                                placeholder="Special instructions, side effects, storage requirements..."
                                className="min-h-[100px] resize-none rounded-lg"
                            />
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.submit}
                                </p>
                            </div>
                        )}
                    </div>
                        );
                    })()}

                    <SheetFooter className="pt-6 border-t">
                        <div className="flex items-center justify-end gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="rounded-lg h-10"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="rounded-lg h-10 gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Add Medication
                                    </>
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}
