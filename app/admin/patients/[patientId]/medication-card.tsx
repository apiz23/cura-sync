import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Pill,
    Clock,
    CheckCircle,
    AlertCircle,
    Edit,
    CalendarDays,
    FileText,
    Stethoscope,
    Clock3,
    ChevronRight,
    Pencil,
} from "lucide-react";
import { useState } from "react";
import { Medication } from "@/app/types";
import EditMedicationSheet from "./edit-medication-sheet";
import { isMedicationExpired } from "@/lib/medication-dates";
import {
    normalizeMedicationFrequency,
    normalizeMedicationSchedule,
} from "@/lib/medication-options";

interface MedicationCardProps {
    medication: Medication;
    onUpdate: () => void;
    canEdit?: boolean;
}

export default function MedicationCard({
    medication,
    onUpdate,
    canEdit = true,
}: MedicationCardProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-chart-3/10 text-chart-3 dark:text-chart-3 border-chart-3/30 dark:border-chart-3/30";
            case "ACTIVE":
                return "bg-chart-2/10 text-chart-2 dark:text-chart-2 border-chart-2/30 dark:border-chart-2/30";
            case "STOPPED":
                return "bg-chart-5/10 text-chart-5 dark:text-chart-5 border-chart-5/30 dark:border-chart-5/30";
            default:
                return "bg-muted text-muted-foreground dark:text-muted-foreground border-border dark:border-border";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-3.5 w-3.5" />;
            case "ACTIVE":
                return <Clock className="h-3.5 w-3.5" />;
            case "STOPPED":
                return <AlertCircle className="h-3.5 w-3.5" />;
            default:
                return <Pill className="h-3.5 w-3.5" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "Completed";
            case "ACTIVE":
                return "Active";
            case "STOPPED":
                return "Stopped";
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isActive = medication.status === "ACTIVE";
    const isExpired = isMedicationExpired(medication.end_date);

    const getTimeRemaining = () => {
        if (!medication.end_date || !isActive) return null;

        const endDate = new Date(medication.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return "Expired";
        if (diffDays <= 7) return `${diffDays} days left`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks left`;
        return `${Math.floor(diffDays / 30)} months left`;
    };

    const timeRemaining = getTimeRemaining();
    const frequencyLabel = normalizeMedicationFrequency(medication.frequency);
    const scheduleLabel = normalizeMedicationSchedule(
        medication.frequency,
        medication.schedule
    );

    return (
        <>
            {/* Simple Card - Click to open Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Card className="border-border/40 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer group p-0">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {/* Header with Options */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-linear-to-br from-primary/15 to-primary/5 rounded-lg border border-primary/10">
                                            <Pill className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {medication.name}
                                            </h3>
                                            <p className="text-base text-muted-foreground">
                                                {medication.dosage}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {canEdit && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg opacity-100 group-hover:opacity-100 transition-opacity"
                                                onPointerDown={(e) => {
                                                    // Prevent Radix SheetTrigger from firing on pointer down.
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsEditSheetOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                {/* Status and Frequency */}
                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant="outline"
                                        className={`${getStatusColor(
                                            medication.status
                                        )} rounded-lg px-2.5 py-1 text-base font-medium`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {getStatusIcon(medication.status)}
                                            {getStatusLabel(medication.status)}
                                        </div>
                                    </Badge>
                                    <div className="text-base text-muted-foreground flex items-center gap-1">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        {frequencyLabel}
                                    </div>
                                </div>

                                {/* Dates and Time Remaining */}
                                <div className="flex items-center justify-between text-base">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                            {formatDate(medication.start_date)}
                                        </span>
                                    </div>
                                    {timeRemaining && (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`text-base font-medium px-2 py-1 rounded-full ${
                                                    timeRemaining === "Expired"
                                                        ? "bg-chart-5/10 text-chart-5"
                                                        : "bg-chart-3/10 text-chart-3"
                                                }`}
                                            >
                                                {timeRemaining}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Prescribed By (if available) */}
                                {medication.prescribed_by && (
                                    <div className="pt-2 border-t border-border/30">
                                        <div className="flex items-center gap-2 text-base text-muted-foreground">
                                            <Stethoscope className="h-3.5 w-3.5" />
                                            <span className="truncate font-medium">
                                                {medication.prescribed_by}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </SheetTrigger>

                {/* Detailed View Sheet */}
                <SheetContent className="sm:max-w-[500px] w-full p-0 border-border/40">
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-linear-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/10">
                                        <Pill className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-lg font-semibold text-foreground">
                                            {medication.name}
                                        </SheetTitle>
                                        <p className="text-base text-muted-foreground">
                                            {medication.dosage}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`${getStatusColor(
                                        medication.status
                                    )} px-3 py-1.5 rounded-full`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {getStatusIcon(medication.status)}
                                        {getStatusLabel(medication.status)}
                                    </div>
                                </Badge>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-base text-muted-foreground">
                                        <Clock3 className="h-4 w-4" />
                                        <span>Frequency</span>
                                    </div>
                                    <p className="font-medium text-foreground">
                                        {frequencyLabel}
                                    </p>
                                </div>

                                {scheduleLabel && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-base text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Schedule</span>
                                        </div>
                                        <p className="font-medium text-foreground">
                                            {scheduleLabel}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Dates Section */}
                            <div className="space-y-4 p-4 bg-linear-to-br from-muted/10 to-muted/5 rounded-xl border border-border/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-chart-2/10 rounded-lg">
                                            <CalendarDays className="h-4 w-4 text-chart-2" />
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-muted-foreground">
                                                Start Date
                                            </p>
                                            <p className="text-base font-semibold">
                                                {formatDate(
                                                    medication.start_date
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {medication.end_date ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`p-1.5 rounded-lg ${
                                                    isExpired
                                                        ? "bg-chart-5/10"
                                                        : "bg-chart-3/10"
                                                }`}
                                            >
                                                <CalendarDays
                                                    className={`h-4 w-4 ${
                                                        isExpired
                                                            ? "text-chart-5"
                                                            : "text-chart-3"
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-muted-foreground">
                                                    End Date
                                                </p>
                                                <p
                                                    className={`text-base font-semibold ${
                                                        isExpired
                                                            ? "text-chart-5"
                                                            : ""
                                                    }`}
                                                >
                                                    {formatDate(
                                                        medication.end_date
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {timeRemaining && (
                                            <div
                                                className={`text-base font-medium px-2 py-1 rounded-full ${
                                                    isExpired
                                                        ? "bg-chart-5/10 text-chart-5"
                                                        : "bg-chart-3/10 text-chart-3"
                                                }`}
                                            >
                                                {timeRemaining}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    isActive && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-chart-3/10 rounded-lg">
                                                    <CheckCircle className="h-4 w-4 text-chart-3" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-medium text-muted-foreground">
                                                        Duration
                                                    </p>
                                                    <p className="text-base font-semibold text-chart-3">
                                                        Ongoing
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Prescribed By */}
                            {medication.prescribed_by && (
                                <div className="flex items-center gap-3 p-3 bg-linear-to-br from-primary/5 to-primary/2 rounded-xl border border-primary/10">
                                    <Stethoscope className="h-4 w-4 text-primary" />
                                    <div>
                                        <p className="text-base text-muted-foreground">
                                            Prescribed by
                                        </p>
                                        <p className="font-medium">
                                            {medication.prescribed_by}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {medication.notes && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-base text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        <span>Notes & Instructions</span>
                                    </div>
                                    <div className="p-3 bg-linear-to-br from-muted/10 to-muted/5 rounded-lg border border-border/30">
                                        <p className="text-base text-foreground whitespace-pre-wrap">
                                            {medication.notes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Status Indicators */}
                            {isActive && isExpired && (
                                <div className="flex items-center gap-3 p-3 bg-chart-5/10 rounded-xl border border-chart-5/30/50">
                                    <AlertCircle className="h-4 w-4 text-chart-5" />
                                    <div>
                                        <p className="text-base font-medium text-chart-5">
                                            Expired
                                        </p>
                                        <p className="text-base text-chart-5/80">
                                            This medication needs review
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with Actions */}
                        <div className="sticky bottom-0 border-t border-border/30 bg-card/95 backdrop-blur-sm p-4">
                            <div className="flex items-center justify-between">
                                {canEdit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg gap-2"
                                        onClick={() => {
                                            setIsSheetOpen(false);
                                            setIsEditSheetOpen(true);
                                        }}
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        Edit Medication
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit Medication Sheet */}
            {canEdit && (
                <EditMedicationSheet
                    open={isEditSheetOpen}
                    onOpenChange={setIsEditSheetOpen}
                    medication={medication}
                    onUpdated={() => {
                        onUpdate();
                        setIsEditSheetOpen(false);
                    }}
                />
            )}
        </>
    );
}
