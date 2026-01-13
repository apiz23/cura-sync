"use client";

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
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
import { useState, useEffect } from "react";
import { Medication } from "@/app/types";
import {
    Pill,
    Calendar as CIcon,
    User,
    AlertCircle,
    Save,
    Trash2,
    Loader2,
    X,
    PillBottle,
    Syringe,
    CalendarDays,
    BellRing,
    FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

interface EditMedicationSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medication: Medication;
    onUpdated: () => void;
}

export default function EditMedicationSheet({
    open,
    onOpenChange,
    medication,
    onUpdated,
}: EditMedicationSheetProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        schedule: medication.schedule ?? "",
        start_date: medication.start_date,
        end_date: medication.end_date ?? "",
        notes: medication.notes ?? "",
        prescribed_by: medication.prescribed_by ?? "",
        status: medication.status,
        is_ongoing: !medication.end_date,
    });

    const statusColors = {
        ACTIVE: "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800",
        COMPLETED:
            "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800",
        STOPPED:
            "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800",
    };

    useEffect(() => {
        if (open) {
            setForm({
                name: medication.name,
                dosage: medication.dosage,
                frequency: medication.frequency,
                schedule: medication.schedule ?? "",
                start_date: medication.start_date,
                end_date: medication.end_date ?? "",
                notes: medication.notes ?? "",
                prescribed_by: medication.prescribed_by ?? "",
                status: medication.status,
                is_ongoing: !medication.end_date,
            });
            setError(null);
        }
    }, [open, medication]);

    function updateField<K extends keyof typeof form>(
        key: K,
        value: (typeof form)[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function validateForm(): boolean {
        if (!form.name.trim()) {
            setError("Medication name is required");
            return false;
        }
        if (!form.dosage.trim()) {
            setError("Dosage is required");
            return false;
        }
        if (!form.frequency.trim()) {
            setError("Frequency is required");
            return false;
        }
        if (!form.start_date) {
            setError("Start date is required");
            return false;
        }
        if (
            !form.is_ongoing &&
            form.end_date &&
            new Date(form.end_date) < new Date(form.start_date)
        ) {
            setError("End date cannot be before start date");
            return false;
        }
        return true;
    }

    function formatDate(date?: Date) {
        if (!date) return "";
        return date.toISOString().split("T")[0];
    }

    const startDate = form.start_date ? new Date(form.start_date) : undefined;

    const endDate = form.end_date ? new Date(form.end_date) : undefined;

    async function handleSave() {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: form.name,
                dosage: form.dosage,
                frequency: form.frequency,
                schedule: form.schedule,
                start_date: form.start_date,
                end_date: form.is_ongoing ? null : form.end_date || null,
                notes: form.notes || null,
                prescribed_by: form.prescribed_by || null,
                status: form.status,
                updated_at: new Date().toISOString(),
            };

            const response = await fetch(`/api/medications/${medication.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to update medication");
            }

            onUpdated();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
            console.error("Update failed", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (
            !confirm(
                "Are you sure you want to delete this medication? This action cannot be undone."
            )
        )
            return;

        setLoading(true);
        try {
            const response = await fetch(`/api/medications/${medication.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete medication");
            }

            onUpdated();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
            console.error("Delete failed", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 border-border/40 shadow-xl dark:shadow-none">
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                                <Pill className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-semibold text-foreground">
                                    Edit Medication
                                </SheetTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Update medication details
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`${
                                    statusColors[medication.status]
                                } font-medium px-3 py-1 rounded-full border`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className={`h-2 w-2 rounded-full ${
                                            medication.status === "ACTIVE"
                                                ? "bg-green-500"
                                                : medication.status ===
                                                  "COMPLETED"
                                                ? "bg-blue-500"
                                                : "bg-red-500"
                                        }`}
                                    />
                                    {medication.status.charAt(0) +
                                        medication.status
                                            .slice(1)
                                            .toLowerCase()}
                                </div>
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="h-9 w-9 rounded-xl hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {error && (
                        <Alert
                            variant="destructive"
                            className="rounded-xl border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="font-medium">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Basic Information Card */}
                    <Card className="p-5 border-border/50 bg-linear-to-br from-background to-muted/30 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <PillBottle className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">
                                Basic Information
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        <Pill className="h-3.5 w-3.5 text-primary/70" />
                                        Medication Name *
                                    </Label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) =>
                                            updateField("name", e.target.value)
                                        }
                                        placeholder="e.g., Metformin"
                                        className="bg-background border-border/60 focus:border-primary rounded-xl h-11"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        <Syringe className="h-3.5 w-3.5 text-primary/70" />
                                        Dosage *
                                    </Label>
                                    <Input
                                        value={form.dosage}
                                        onChange={(e) =>
                                            updateField(
                                                "dosage",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g., 500mg"
                                        className="bg-background border-border/60 focus:border-primary rounded-xl h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Schedule Card */}
                    <Card className="p-5 border-border/50 bg-linear-to-br from-background to-muted/30 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BellRing className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">
                                Schedule
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label className="text-sm font-medium text-foreground">
                                        Frequency *
                                    </Label>
                                    <Input
                                        value={form.frequency}
                                        onChange={(e) =>
                                            updateField(
                                                "frequency",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g., Twice daily"
                                        className="bg-background border-border/60 focus:border-primary rounded-xl h-11"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-sm font-medium text-foreground">
                                        Specific Schedule
                                    </Label>
                                    <Input
                                        value={form.schedule}
                                        onChange={(e) =>
                                            updateField(
                                                "schedule",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g., 8:00 AM & 8:00 PM"
                                        className="bg-background border-border/60 focus:border-primary rounded-xl h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Dates Card */}
                    <Card className="p-5 border-border/50 bg-linear-to-br from-background to-muted/30 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <CalendarDays className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">
                                Dates
                            </h3>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label className="text-sm font-medium text-foreground">
                                    Start Date *
                                </Label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal h-11 rounded-xl border-border/60"
                                        >
                                            <CIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {startDate
                                                ? startDate.toLocaleDateString()
                                                : "Pick a start date"}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(date) =>
                                                updateField(
                                                    "start_date",
                                                    formatDate(date)
                                                )
                                            }
                                            captionLayout="dropdown"
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/40">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium text-foreground">
                                        Ongoing Medication
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        No end date required
                                    </p>
                                </div>
                                <Switch
                                    checked={form.is_ongoing}
                                    onCheckedChange={(checked) => {
                                        updateField("is_ongoing", checked);
                                        if (checked)
                                            updateField("end_date", "");
                                    }}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>

                            {!form.is_ongoing && (
                                <div className="space-y-2.5">
                                    <Label className="text-sm font-medium text-foreground">
                                        End Date
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-11 rounded-xl border-border/60"
                                            >
                                                <CIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {endDate
                                                    ? endDate.toLocaleDateString()
                                                    : "Pick an end date"}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={(date) =>
                                                    updateField(
                                                        "end_date",
                                                        formatDate(date)
                                                    )
                                                }
                                                captionLayout="dropdown"
                                                disabled={(date) =>
                                                    startDate
                                                        ? date < startDate
                                                        : false
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Additional Information Card */}
                    <Card className="p-5 border-border/50 bg-linear-to-br from-background to-muted/30 rounded-2xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">
                                Additional Information
                            </h3>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                                    <User className="h-3.5 w-3.5 text-primary/70" />
                                    Prescribed By
                                </Label>
                                <Input
                                    value={form.prescribed_by}
                                    disabled
                                    onChange={(e) =>
                                        updateField(
                                            "prescribed_by",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g., Dr. Smith"
                                    className="bg-background border-border/60 focus:border-primary rounded-xl h-11"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-sm font-medium text-foreground">
                                    Status
                                </Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v: Medication["status"]) =>
                                        updateField("status", v)
                                    }
                                >
                                    <SelectTrigger className="bg-background border-border/60 focus:border-primary rounded-xl h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/60">
                                        <SelectItem
                                            value="ACTIVE"
                                            className="rounded-lg focus:bg-muted"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                Active
                                            </div>
                                        </SelectItem>
                                        <SelectItem
                                            value="COMPLETED"
                                            className="rounded-lg focus:bg-muted"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                Completed
                                            </div>
                                        </SelectItem>
                                        <SelectItem
                                            value="STOPPED"
                                            className="rounded-lg focus:bg-muted"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                Stopped
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-sm font-medium text-foreground">
                                    Notes
                                </Label>
                                <Textarea
                                    rows={3}
                                    value={form.notes}
                                    onChange={(e) =>
                                        updateField("notes", e.target.value)
                                    }
                                    placeholder="Additional notes, side effects, special instructions..."
                                    className="bg-background border-border/60 focus:border-primary rounded-xl resize-none min-h-[100px]"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Footer */}
                <SheetFooter className="grid grid-cols-2 gap-4">
                    {/* Left: Delete */}
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="gap-2 rounded-xl h-11 sm:w-auto w-full"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="gap-2 rounded-xl h-11 sm:w-auto w-full bg-primary hover:bg-primary/90"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
