"use client";

import { useAuth } from "@/components/authprovideradmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    FileText,
    Activity,
    Shield,
    CheckCircle2,
    AlertCircle,
    UserPlus,
    Bell,
    Cpu,
    HardDrive,
    MemoryStick,
    Download,
    Settings,
    UserCog,
    ArrowUpRight,
    BarChart3,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const { user: initialStaff, loading } = useAuth();

    return (
        <div className="flex flex-1 flex-col gap-8 p-6">
            {/* Header Section */}
            <div className="space-y-2">
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back,{" "}
                            <span className="font-semibold text-foreground">
                                {initialStaff?.full_name ?? "Admin"}
                            </span>
                            ! Here&apos;s your system overview.
                        </p>
                    </>
                )}
            </div>

            {/* Stats Cards Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">
                                Total Users
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">2,458</div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center text-xs text-green-600">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +12% from last month
                            </div>
                            <Badge variant="outline" className="text-xs">
                                Active
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">
                                Reports
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1,245</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge
                                variant="secondary"
                                className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                                5 pending review
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                32 today
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">
                                Active Sessions
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">87</div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center text-xs text-blue-600">
                                <Clock className="h-3 w-3 mr-1" />3 in last hour
                            </div>
                            <Badge variant="outline" className="text-xs">
                                Live
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">
                                System Health
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold text-emerald-600">
                                98%
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Optimal
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="border-2 h-full">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Recent Activity
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                >
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                {
                                    icon: CheckCircle2,
                                    color: "text-green-600",
                                    bg: "bg-green-100",
                                    time: "2 min ago",
                                    text: 'User "hafiz_admin" added a new report',
                                },
                                {
                                    icon: Settings,
                                    color: "text-blue-600",
                                    bg: "bg-blue-100",
                                    time: "15 min ago",
                                    text: "System backup completed successfully",
                                },
                                {
                                    icon: UserPlus,
                                    color: "text-purple-600",
                                    bg: "bg-purple-100",
                                    time: "30 min ago",
                                    text: 'New user "alyah" registered',
                                },
                                {
                                    icon: Bell,
                                    color: "text-amber-600",
                                    bg: "bg-amber-100",
                                    time: "1 hour ago",
                                    text: "Security alert: Multiple login attempts detected",
                                },
                                {
                                    icon: CheckCircle2,
                                    color: "text-green-600",
                                    bg: "bg-green-100",
                                    time: "2 hours ago",
                                    text: "Database optimization completed",
                                },
                                {
                                    icon: AlertCircle,
                                    color: "text-red-600",
                                    bg: "bg-red-100",
                                    time: "4 hours ago",
                                    text: "Server maintenance scheduled for tonight",
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div
                                        className={`p-2 rounded-lg ${item.bg} ${item.color} flex-shrink-0 group-hover:scale-105 transition-transform`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                            {item.text}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Performance */}
                <div className="space-y-6">
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">
                                            CPU Usage
                                        </span>
                                    </div>
                                    <span className="font-bold">42%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-blue-600 rounded-full h-2"
                                        style={{ width: "42%" }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MemoryStick className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium">
                                            Memory
                                        </span>
                                    </div>
                                    <span className="font-bold">68%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-purple-600 rounded-full h-2"
                                        style={{ width: "68%" }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm font-medium">
                                            Storage
                                        </span>
                                    </div>
                                    <span className="font-bold">35%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-emerald-600 rounded-full h-2"
                                        style={{ width: "35%" }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full h-12 justify-start gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                            >
                                <Download className="h-4 w-4" />
                                <span>Generate Report</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-12 justify-start gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                            >
                                <UserCog className="h-4 w-4" />
                                <span>Manage Users</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-12 justify-start gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                            >
                                <Settings className="h-4 w-4" />
                                <span>System Settings</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Additional Info Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            User Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Administrators</span>
                                <span className="font-bold">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Doctors</span>
                                <span className="font-bold">156</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Nurses</span>
                                <span className="font-bold">289</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Patients</span>
                                <span className="font-bold">2,001</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Reports Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-sm">Completed</span>
                                </div>
                                <span className="font-bold">1,189</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-sm">
                                        Pending Review
                                    </span>
                                </div>
                                <span className="font-bold">56</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-sm">In Progress</span>
                                </div>
                                <span className="font-bold">32</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Security Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Last Backup</span>
                                <Badge variant="outline" className="text-xs">
                                    Today, 02:00
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">SSL Certificate</span>
                                <Badge className="bg-green-100 text-green-800">
                                    Valid
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Security Scan</span>
                                <Badge className="bg-emerald-100 text-emerald-800">
                                    No Threats
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
