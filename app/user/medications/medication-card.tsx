import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Pill,
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    Edit,
} from "lucide-react";
import { useState } from "react";
import { Medication } from "@/app/types";
import EditMedicationSheet from "./edit-medication-sheet";

interface MedicationCardProps {
    medication: Medication;
    onUpdate: () => void;
}

export default function MedicationCard({
    medication,
    onUpdate,
}: MedicationCardProps) {
    const [isTaking, setIsTaking] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            case "ACTIVE":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "STOPPED":
                return "bg-amber-100 text-amber-800 border-amber-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4" />;
            case "ACTIVE":
                return <Clock className="h-4 w-4" />;
            case "STOPPED":
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Pill className="h-4 w-4" />;
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

    async function markAsTaken() {
        setIsTaking(true);
        try {
            const res = await fetch(`/api/medications/${medication.id}`, {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed to log intake");
            }

            onUpdate();
        } catch (error) {
            console.error("Failed to mark as taken:", error);
        } finally {
            setIsTaking(false);
        }
    }

    async function markAsStopped() {
        try {
            await fetch(`/api/medications/${medication.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "STOPPED" }),
            });
            onUpdate();
        } catch (error) {
            console.error("Failed to mark as stopped:", error);
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isActive = medication.status === "ACTIVE";
    const isCompleted = medication.status === "COMPLETED";
    const isStopped = medication.status === "STOPPED";

    const isExpired = medication.end_date
        ? new Date(medication.end_date) < new Date()
        : false;

    return (
        <Card
            className={`group hover:shadow-lg transition-all duration-300 border-2 ${
                isActive
                    ? "border-blue-200 hover:border-blue-300"
                    : isCompleted
                    ? "border-green-200 hover:border-green-300"
                    : isStopped || isExpired
                    ? "border-amber-200 hover:border-amber-300"
                    : "border-gray-200 hover:border-gray-300"
            }`}
        >
            <CardHeader className="p-0">
                <div className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div
                                className={`p-2.5 rounded-xl ${
                                    isActive
                                        ? "bg-blue-100"
                                        : isCompleted
                                        ? "bg-green-100"
                                        : isStopped || isExpired
                                        ? "bg-amber-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                <Pill
                                    className={`h-5 w-5 ${
                                        isActive
                                            ? "text-blue-600"
                                            : isCompleted
                                            ? "text-green-600"
                                            : isStopped || isExpired
                                            ? "text-amber-600"
                                            : "text-gray-600"
                                    }`}
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                    {medication.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {medication.dosage}
                                </p>
                            </div>
                        </div>

                        <Badge
                            className={`flex items-center gap-1.5 px-3 py-1.5 border ${getStatusColor(
                                medication.status
                            )}`}
                            variant="outline"
                        >
                            {getStatusIcon(medication.status)}
                            {getStatusLabel(medication.status)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                    {/* Main info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">
                                Frequency
                            </p>
                            <p className="font-semibold">
                                {medication.frequency}
                            </p>
                        </div>
                    </div>

                    {/* Dates section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Start Date</span>
                            </div>
                            <span className="font-medium">
                                {formatDate(medication.start_date)}
                            </span>
                        </div>

                        {medication.end_date && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>End Date</span>
                                </div>
                                <span
                                    className={`font-medium ${
                                        isExpired ? "text-amber-600" : ""
                                    }`}
                                >
                                    {formatDate(medication.end_date)}
                                    {isExpired && " (Expired)"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Instructions (collapsible) */}
                    {medication.notes && (
                        <div className="border-t pt-3">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <span>Instructions</span>
                                <svg
                                    className={`w-4 h-4 transform transition-transform ${
                                        showDetails ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                            {showDetails && (
                                <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                                    <p className="text-sm">
                                        {medication.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Schedule */}
                    {medication.schedule && (
                        <div className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded-lg">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">Schedule:</span>
                            <span>{medication.schedule}</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 space-y-2">
                        {isActive && (
                            <>
                                <Button
                                    onClick={markAsTaken}
                                    disabled={isTaking}
                                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                    size="sm"
                                >
                                    {isTaking ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Marking...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Mark as Taken
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={markAsStopped}
                                    variant="outline"
                                    className="w-full gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                    size="sm"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    Stop Medication
                                </Button>
                            </>
                        )}

                        {isCompleted && (
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                                Completed
                            </div>
                        )}

                        {isStopped && (
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 p-2 bg-amber-50 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                Medication Stopped
                            </div>
                        )}

                        {isExpired && medication.status === "ACTIVE" && (
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 p-2 bg-amber-50 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                Expired - Review needed
                            </div>
                        )}
                    </div>

                    {/* Edit button (optional) */}
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditOpen(true)}
                        >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                        </Button>

                        <EditMedicationSheet
                            open={editOpen}
                            onOpenChange={setEditOpen}
                            medication={medication}
                            onUpdated={onUpdate}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
