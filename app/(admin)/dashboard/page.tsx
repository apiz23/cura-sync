import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, admin! Here&apos;s an overview of the system.
                </p>
            </div>

            {/* Stats Cards Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">245</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +12 from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">32</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            5 pending review
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            Active Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            3 in last hour
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            Good
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
                <div className="bg-muted/50 p-6 rounded-lg space-y-4 border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                            ✓
                        </div>
                        <p>User &quot;hafiz_admin&quot; added a new report</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            ⚙️
                        </div>
                        <p>System backup completed successfully</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            👥
                        </div>
                        <p>New user &quot;alyah&quot; registered</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            🔔
                        </div>
                        <p>Security alert: Multiple login attempts detected</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                            ✓
                        </div>
                        <p>Database optimization completed</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">System Overview</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>CPU Usage</span>
                                <span className="font-medium">42%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Memory</span>
                                <span className="font-medium">68%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Storage</span>
                                <span className="font-medium">35%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                Generate Report
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                Manage Users
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                System Settings
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
