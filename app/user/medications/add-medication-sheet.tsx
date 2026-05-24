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
import { Check, Pill, CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

/* ================= TYPES ================= */

type MedicationFormData = {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    startDate: Date;
    endDate?: Date;
};

type FormErrors = Partial<Record<keyof MedicationFormData | "submit", string>>;

/* ================= CONSTANTS ================= */

const FREQUENCY_OPTIONS = [
    { value: "once", label: "Once daily" },
    { value: "twice", label: "Twice daily" },
    { value: "thrice", label: "Three times daily" },
    { value: "weekly", label: "Weekly" },
    { value: "as_needed", label: "As needed" },
    { value: "other", label: "Custom schedule" },
];

const DURATION_OPTIONS = [
    { value: "7", label: "7 days" },
    { value: "14", label: "14 days" },
    { value: "30", label: "30 days" },
    { value: "60", label: "60 days" },
    { value: "90", label: "90 days" },
    { value: "ongoing", label: "Ongoing" },
];

/* ================= COMPONENT ================= */

export default function AddMedicationSheet({
    children,
    onSuccess,
}: {
    children: React.ReactNode;
    onSuccess: () => void;
}) {
    const { user, isLoaded } = useUser();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<MedicationFormData>({
        name: "",
        dosage: "",
        frequency: "once",
        duration: "ongoing",
        instructions: "",
        startDate: new Date(),
        endDate: undefined,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    /* ================= HANDLERS ================= */

    const handleInputChange = <K extends keyof MedicationFormData>(
        field: K,
        value: MedicationFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (!isLoaded || !user) {
            setErrors({ submit: "You must be signed in to add medication." });
            return;
        }

        setLoading(true);
        try {
            const startDateStr = format(formData.startDate, "yyyy-MM-dd");

            let endDate: Date | undefined = formData.endDate;
            if (!endDate && formData.duration !== "ongoing") {
                const days = Number(formData.duration);
                if (!Number.isNaN(days) && days > 0) {
                    const computed = new Date(formData.startDate);
                    computed.setDate(computed.getDate() + days);
                    endDate = computed;
                }
            }

            const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : null;

            const scheduleByFrequency: Record<string, string> = {
                once: "Morning",
                twice: "Morning / Night",
                thrice: "Morning / Afternoon / Night",
                weekly: "Weekly",
                as_needed: "As needed",
                other: formData.instructions?.trim() || "Custom schedule",
            };

            const schedule =
                scheduleByFrequency[formData.frequency] ?? "As directed";

            const submitPromise = fetch("/api/medications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    dosage: formData.dosage,
                    frequency: formData.frequency,
                    schedule,
                    start_date: startDateStr,
                    end_date: endDateStr,
                    notes: formData.instructions?.trim() || null,
                    status: "ACTIVE",
                }),
            }).then(async (response) => {
                if (!response.ok) {
                    const json = await response.json().catch(() => null);
                    throw new Error(json?.error || "Failed to add medication");
                }

                return response.json().catch(() => null);
            });

            toast.promise(submitPromise, {
                loading: "Adding medication...",
                success: "Medication added",
                error: (error) =>
                    error instanceof Error
                        ? error.message
                        : "Failed to add medication",
            });

            await submitPromise;

            setFormData({
                name: "",
                dosage: "",
                frequency: "once",
                duration: "ongoing",
                instructions: "",
                startDate: new Date(),
                endDate: undefined,
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
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent className="sm:max-w-[500px] overflow-y-auto p-4">
                <SheetHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Pill className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <SheetTitle className="text-2xl">
                                Add New Medication
                            </SheetTitle>
                            <SheetDescription>
                                Enter the details for your new medication
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 py-4">
                    {/* Medication Name */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="name" className="font-medium">
                                Medication Name *
                            </Label>
                            {errors.name && (
                                <span className="text-base text-destructive flex items-center gap-1">
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
                            placeholder="e.g., Ibuprofen, Metformin"
                            className={cn(
                                "h-11",
                                errors.name &&
                                    "border-destructive focus-visible:ring-destructive"
                            )}
                        />
                    </div>

                    {/* Dosage */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dosage" className="font-medium">
                                Dosage *
                            </Label>
                            {errors.dosage && (
                                <span className="text-base text-destructive flex items-center gap-1">
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
                            placeholder="e.g., 200mg, 500mg twice daily"
                            className={cn(
                                "h-11",
                                errors.dosage &&
                                    "border-destructive focus-visible:ring-destructive"
                            )}
                        />
                    </div>

                    {/* Frequency & Duration Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frequency" className="font-medium">
                                Frequency *
                            </Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value) =>
                                    handleInputChange("frequency", value)
                                }
                            >
                                <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FREQUENCY_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration" className="font-medium">
                                Duration
                            </Label>
                            <Select
                                value={formData.duration}
                                onValueChange={(value) =>
                                    handleInputChange("duration", value)
                                }
                            >
                                <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DURATION_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-medium">Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-11 justify-start text-left font-normal",
                                            !formData.startDate &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.startDate ? (
                                            format(formData.startDate, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.startDate}
                                        onSelect={(date) =>
                                            date &&
                                            handleInputChange("startDate", date)
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {formData.duration !== "ongoing" && (
                            <div className="space-y-2">
                                <Label className="font-medium">End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-11 justify-start text-left font-normal",
                                                !formData.endDate &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.endDate ? (
                                                format(formData.endDate, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.endDate}
                                            onSelect={(date) =>
                                                handleInputChange(
                                                    "endDate",
                                                    date
                                                )
                                            }
                                            initialFocus
                                            disabled={(date) =>
                                                date < formData.startDate
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2">
                        <Label htmlFor="instructions" className="font-medium">
                            Additional Instructions
                        </Label>
                        <Textarea
                            id="instructions"
                            value={formData.instructions}
                            onChange={(e) =>
                                handleInputChange(
                                    "instructions",
                                    e.target.value
                                )
                            }
                            placeholder="e.g., Take with food, Avoid alcohol, Store at room temperature"
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-base text-destructive flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {errors.submit}
                            </p>
                        </div>
                    )}
                </div>

                <SheetFooter className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 sm:flex-none gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-card border-t-transparent rounded-full animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Add Medication
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
