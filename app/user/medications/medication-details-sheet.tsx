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

    const getStatusConfig = (status: string) => {
        const configs = {
            COMPLETED: {
                color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                icon: <CheckCircle className="h-4 w-4" />,
                label: "Completed",
                accent: "emerald",
                pillColor: "bg-emerald-500",
            },
            ACTIVE: {
                color: "bg-blue-500/10 text-blue-700 border-blue-200",
                icon: <Clock className="h-4 w-4" />,
                label: "Active",
                accent: "blue",
                pillColor: "bg-blue-500",
            },
            STOPPED: {
                color: "bg-amber-500/10 text-amber-700 border-amber-200",
                icon: <AlertCircle className="h-4 w-4" />,
                label: "Stopped",
                accent: "amber",
                pillColor: "bg-amber-500",
            },
            default: {
                color: "bg-gray-500/10 text-gray-700 border-gray-200",
                icon: <Pill className="h-4 w-4" />,
                label: "Unknown",
                accent: "gray",
                pillColor: "bg-gray-500",
            },
        };

        return configs[status as keyof typeof configs] || configs.default;
    };

    const calculateProgress = () => {
        if (!medication.start_date || !medication.end_date) return 0;

        const start = new Date(medication.start_date).getTime();
        const end = new Date(medication.end_date).getTime();
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
    const isExpired = medication.end_date
        ? new Date(medication.end_date) < new Date()
        : false;
    const progress = isActive ? calculateProgress() : 0;
    const lastUpdated = medication.updated_at
        ? new Date(medication.updated_at)
        : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg h-full p-0 border-border/40 shadow-xl dark:shadow-none">
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
                                <p className="text-sm text-muted-foreground mt-1">
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
                    <Card className="p-5 border-border/50 bg-gradient-to-br from-card to-muted/30 rounded-2xl">
                        <div className="space-y-4">
                            {isActive && progress > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">
                                            Course Progress
                                        </span>
                                        <span className="font-semibold text-blue-600">
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
                                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-700">
                                            Course Expired
                                        </p>
                                        <p className="text-xs text-amber-600">
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
                                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                                    <Syringe className="h-3.5 w-3.5" />
                                    <span>Dosage</span>
                                </div>
                                <p className="font-semibold text-sm">
                                    {medication.dosage}
                                </p>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                                    <BellRing className="h-3.5 w-3.5" />
                                    <span>Frequency</span>
                                </div>
                                <p className="font-semibold text-sm">
                                    {medication.frequency}
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Schedule Card */}
                    {medication.schedule && (
                        <Card className="p-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Schedule</span>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="font-semibold text-blue-700 text-center">
                                        {medication.schedule}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        Next dose coming up
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Dates Card */}
                    <Card className="p-4">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Treatment Period
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Start Date
                                    </span>
                                    <span className="font-medium text-sm">
                                        {formatDate(medication.start_date)}
                                    </span>
                                </div>
                                {medication.end_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            End Date
                                        </span>
                                        <span
                                            className={cn(
                                                "font-medium text-sm",
                                                isExpired && "text-amber-600"
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
                    {(medication.prescribed_by || medication.notes) && (
                        <Card className="p-4">
                            <div className="space-y-4">
                                {medication.prescribed_by && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>Prescribed By</span>
                                        </div>
                                        <p className="font-medium text-sm">
                                            Dr. {medication.prescribed_by}
                                        </p>
                                    </div>
                                )}

                                {medication.notes && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            <span>Instructions & Notes</span>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-sm leading-relaxed">
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
                                className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            >
                                {isTaking ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
                            Last updated: {formatDate(medication.updated_at)} at{" "}
                            {formatTime(medication.updated_at)}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
