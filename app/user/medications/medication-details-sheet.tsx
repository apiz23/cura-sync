"use client";

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetHeader,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Pill,
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    User,
    FileText,
    BellRing,
    Syringe,
    AlertTriangle,
    X,
} from "lucide-react";
import { useState } from "react";
import { Medication } from "@/app/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isMedicationExpired, parseEndDate, parseStartDate } from "@/lib/medication-dates";

interface MedicationDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medication: Medication;
    onUpdate: () => void;
}

export default function MedicationDetailsSheet({
    open,
    onOpenChange,
    medication,
    onUpdate,
}: MedicationDetailsSheetProps) {
    const [isTaking, setIsTaking] = useState(false);
    const prescribedByLabel =
        medication.prescribed_by_display ||
        medication.prescribed_by_name ||
        medication.prescribed_by;

    const getStatusConfig = (status: string) => {
        const configs = {
            COMPLETED: {
                color: "bg-chart-3/10 text-chart-3 border-chart-3/30",
                icon: <CheckCircle className="h-4 w-4" />,
                label: "Completed",
                accent: "emerald",
                pillColor: "bg-chart-3",
            },
            ACTIVE: {
                color: "bg-chart-2/10 text-chart-2 border-chart-2/30",
                icon: <Clock className="h-4 w-4" />,
                label: "Active",
                accent: "blue",
                pillColor: "bg-chart-2",
            },
            STOPPED: {
                color: "bg-chart-5/10 text-chart-5 border-chart-5/30",
                icon: <AlertCircle className="h-4 w-4" />,
                label: "Stopped",
                accent: "amber",
                pillColor: "bg-chart-5",
            },
            default: {
                color: "bg-muted text-muted-foreground border-border",
                icon: <Pill className="h-4 w-4" />,
                label: "Unknown",
                accent: "gray",
                pillColor: "bg-muted0",
            },
        };

        return configs[status as keyof typeof configs] || configs.default;
    };

    const calculateProgress = () => {
        if (!medication.start_date || !medication.end_date) return 0;

        const start = parseStartDate(medication.start_date)?.getTime();
        const end = parseEndDate(medication.end_date)?.getTime();
        if (start === undefined || end === undefined) return 0;
        if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
        const now = new Date().getTime();

        if (now >= end) return 100;
        if (now <= start) return 0;

        return Math.round(((now - start) / (end - start)) * 100);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    async function markAsTaken() {
        setIsTaking(true);
        const intakePromise = fetch(`/api/medications/${medication.id}/logs`, {
            method: "POST",
        }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to log intake");
            return res.json().catch(() => null);
        });

        toast.promise(intakePromise, {
            loading: "Logging intake...",
            success: "Medication marked as taken",
            error: (error) =>
                error instanceof Error ? error.message : "Failed to log intake",
        });

        try {
            await intakePromise;
            onUpdate();
        } catch (error) {
            console.error("Failed to mark as taken:", error);
        } finally {
            setIsTaking(false);
        }
    }

    const statusConfig = getStatusConfig(medication.status);
    const isActive = medication.status === "ACTIVE";
    const isExpired = isMedicationExpired(medication.end_date);
    const progress = isActive ? calculateProgress() : 0;
    const lastUpdated = medication.updated_at
        ? new Date(medication.updated_at)
        : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg h-full p-0 border-border/40 shadow-lg dark:shadow-none">
                <SheetHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2.5 rounded-xl ${
                                    statusConfig.color
                                } border ${statusConfig.color
                                    .split(" ")[0]
                                    .replace("text", "border")}`}
                            >
                                <Pill className="h-5 w-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-semibold text-foreground">
                                    {medication.name}
                                </SheetTitle>
                                <p className="text-base text-muted-foreground mt-1">
                                    {medication.dosage}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={`flex items-center gap-1.5 px-3 py-1.5 border ${statusConfig.color} font-medium`}
                                variant="outline"
                            >
                                {statusConfig.icon}
                                {statusConfig.label}
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
                </SheetHeader>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Status Card */}
                    <Card className="rounded-2xl border-border/50 bg-card p-5">
                        <div className="space-y-4">
                            {isActive && progress > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-base">
                                        <span className="font-medium text-foreground">
                                            Course Progress
                                        </span>
                                        <span className="font-semibold text-chart-2">
                                            {progress}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={progress}
                                        className="h-2"
                                    />
                                </div>
                            )}

                            {isExpired && medication.status === "ACTIVE" && (
                                <div className="flex items-center gap-2 p-3 bg-chart-5/10 rounded-lg border border-chart-5/30">
                                    <AlertTriangle className="h-4 w-4 text-chart-5" />
                                    <div>
                                        <p className="text-base font-medium text-chart-5">
                                            Course Expired
                                        </p>
                                        <p className="text-base text-chart-5">
                                            Review with your healthcare provider
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-base text-muted-foreground uppercase tracking-wide">
                                    <Syringe className="h-3.5 w-3.5" />
                                    <span>Dosage</span>
                                </div>
                                <p className="font-semibold text-base">
                                    {medication.dosage}
                                </p>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-base text-muted-foreground uppercase tracking-wide">
                                    <BellRing className="h-3.5 w-3.5" />
                                    <span>Frequency</span>
                                </div>
                                <p className="font-semibold text-base">
                                    {medication.frequency}
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Schedule Card */}
                    {medication.schedule && (
                        <Card className="p-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-base text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Schedule</span>
                                </div>
                                <div className="p-3 bg-chart-2/10 rounded-lg border border-chart-2/30">
                                    <p className="font-semibold text-chart-2 text-center">
                                        {medication.schedule}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="flex items-center gap-2 text-base text-chart-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse" />
                                        Next dose coming up
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Dates Card */}
                    <Card className="p-4">
                        <div className="space-y-4">
                            <h4 className="font-medium text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Treatment Period
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-base text-muted-foreground">
                                        Start Date
                                    </span>
                                    <span className="font-medium text-base">
                                        {formatDate(medication.start_date)}
                                    </span>
                                </div>
                                {medication.end_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-base text-muted-foreground">
                                            End Date
                                        </span>
                                        <span
                                            className={cn(
                                                "font-medium text-base",
                                                isExpired && "text-chart-5"
                                            )}
                                        >
                                            {formatDate(medication.end_date)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Additional Information */}
                    {(prescribedByLabel || medication.notes) && (
                        <Card className="p-4">
                            <div className="space-y-4">
                                {prescribedByLabel && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-base text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>Prescribed By</span>
                                        </div>
                                        <p className="font-medium text-base">
                                            {prescribedByLabel}
                                        </p>
                                    </div>
                                )}

                                {medication.notes && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-base text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            <span>Instructions & Notes</span>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-base leading-relaxed">
                                                {medication.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <SheetFooter className="space-y-2 pt-2">
                        {isActive && (
                            <Button
                                onClick={markAsTaken}
                                disabled={isTaking}
                                className="w-full gap-2 bg-primary hover:bg-primary/90"
                            >
                                {isTaking ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-card border-t-transparent rounded-full animate-spin" />
                                        Logging Intake...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Mark as Taken Now
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => onOpenChange(false)}
                        >
                            Close Details
                        </Button>
                    </SheetFooter>

                    {/* Last Updated */}
                    {lastUpdated && (
                        <div className="text-center text-base text-muted-foreground pt-4 border-t border-border/50">
                            Last updated: {formatDate(medication.updated_at)} at{" "}
                            {formatTime(medication.updated_at)}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
