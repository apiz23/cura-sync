"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pill, Clock, Calendar, AlertCircle } from "lucide-react";
import { Medication } from "@/app/types";
import AddMedicationDialog from "./add-medication-sheet";
import MedicationCard from "./medication-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MedicationPage() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchMedications() {
        try {
            const res = await fetch("/api/medications");
            const data = await res.json();
            setMedications(data);
        } catch (error) {
            console.error("Failed to fetch medications:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMedications();
    }, []);

    const today = new Date();
    const todayMeds = medications.filter((med) => {
        const startDate = new Date(med.start_date);
        const endDate = med.end_date ? new Date(med.end_date) : null;

        return startDate <= today && (!endDate || endDate >= today);
    });

    const upcomingMeds = medications.filter((med) => {
        const startDate = new Date(med.start_date);
        return startDate > today;
    });

    const expiredMeds = medications.filter((med) => {
        if (!med.end_date) return false;
        const endDate = new Date(med.end_date);
        return endDate < today;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-background to-muted/20 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-64 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-linear-to-b from-background to-muted/20 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                                <Pill className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Medication Manager
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Manage your medications, track schedules, and stay
                            on top of your health
                        </p>
                    </div>

                    <AddMedicationDialog onSuccess={fetchMedications}>
                        <Button
                            size="lg"
                            className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                        >
                            <Plus className="h-5 w-5" />
                            Add Medication
                        </Button>
                    </AddMedicationDialog>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Active Today
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {todayMeds.length}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div className="mt-4 h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{
                                        width: `${
                                            (todayMeds.length /
                                                Math.max(
                                                    medications.length,
                                                    1
                                                )) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Upcoming
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {upcomingMeds.length}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-blue-500/10">
                                    <Calendar className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-muted-foreground">
                                Starting soon
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-destructive/10 hover:border-destructive/20 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Expired
                                    </p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {expiredMeds.length}
                                    </h3>
                                </div>
                                <div className="p-3 rounded-full bg-destructive/10">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                            </div>
                            {expiredMeds.length > 0 && (
                                <div className="mt-3 text-sm font-medium text-destructive">
                                    Review needed
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Medication Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            Your Medications
                        </h2>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-3 py-1.5">
                                Total: {medications.length}
                            </Badge>
                            {todayMeds.length > 0 && (
                                <Badge className="px-3 py-1.5 bg-primary">
                                    Active: {todayMeds.length}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {medications.length === 0 ? (
                        <Card className="border-2 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="p-4 rounded-full bg-muted mb-4">
                                    <Pill className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    No medications yet
                                </h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Start by adding your first medication to
                                    track your health journey
                                </p>
                                <AddMedicationDialog
                                    onSuccess={fetchMedications}
                                >
                                    <Button size="lg" variant="default">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Medication
                                    </Button>
                                </AddMedicationDialog>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {medications.map((med) => (
                                <MedicationCard
                                    key={med.id}
                                    medication={med}
                                    onUpdate={fetchMedications}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                {todayMeds.length > 0 && (
                    <div className="rounded-xl bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 p-4">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">
                                    Daily Reminder
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    You have {todayMeds.length} medication
                                    {todayMeds.length > 1 ? "s" : ""} scheduled
                                    for today. Remember to take them as
                                    prescribed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
