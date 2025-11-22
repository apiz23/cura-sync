"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserDashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome Back, Hafiz 👋
                </h1>
                <p className="text-muted-foreground">
                    Here’s your health overview and recent updates.
                </p>
            </div>

            {/* Stats Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            AI Predictions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last 7 days symptom checks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            Saved Health Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Synced with blockchain vault
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            Upcoming Appointments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Next one: 18 Nov, 10:00 AM
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            Health Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            Stable
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            No alerts detected
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
                <div className="bg-muted/50 p-6 rounded-lg space-y-4 border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                            ✓
                        </div>
                        <p>AI analysis: “Mild flu symptoms detected.”</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            💊
                        </div>
                        <p>New prescription added by Dr. Aisyah.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            📅
                        </div>
                        <p>Upcoming appointment confirmed with Klinik Sehat.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                            ⚠️
                        </div>
                        <p>Reminder: Update your blood pressure reading.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                            ⛓️
                        </div>
                        <p>Health data securely synced to blockchain.</p>
                    </div>
                </div>
            </div>

            {/* Health Insights */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Health Insights</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Health Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>Heart Rate</span>
                                <span className="font-medium">76 bpm</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Blood Pressure</span>
                                <span className="font-medium">
                                    118 / 79 mmHg
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Body Temperature</span>
                                <span className="font-medium">36.7°C</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sleep Hours</span>
                                <span className="font-medium">7.2 hrs</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                Check New Symptoms
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                View Medical Records
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                Book Appointment
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
