import type { Metadata } from "next";
import { Shield, Stethoscope } from "lucide-react";
import Link from "next/link";
import { AdminLoginForm } from "./loginform";

export const metadata: Metadata = {
    title: "Admin Login | CuraSync",
    description: "Secure admin access to CuraSync management system",
};

export default function AdminLoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2 bg-linear-to-br from-background to-muted/20">
            {/* Left Column - Form */}
            <div className="flex flex-col gap-8 p-6 md:p-12">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity group"
                    >
                        <div className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground flex size-10 items-center justify-center rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Stethoscope className="size-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-foreground">CuraSync</span>
                            <span className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-medium">
                                Admin
                            </span>
                        </div>
                    </Link>

                    <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
                        Restricted Access
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full max-w-md">
                        <AdminLoginForm />
                    </div>
                </div>

                {/* Footer - Mobile only */}
                <div className="text-center lg:hidden">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} CuraSync Healthcare
                        Platform
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-primary/60 animate-pulse" />
                            Enterprise Security
                        </span>
                        <div className="size-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3" />
                            Activity Logged
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Column - Security Info */}
            <div className="hidden lg:block relative bg-linear-to-br from-card to-card/80 overflow-hidden border-l border-border">
                {/* Animated Background Elements */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="relative h-full flex flex-col justify-center p-16 z-10">
                    <div className="space-y-12 max-w-lg">
                        {/* Header Section */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-sm px-4 py-2.5 rounded-full border border-primary/20">
                                <div className="size-2.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-sm font-medium text-primary">
                                    Secure Admin Portal
                                </span>
                            </div>

                            <h2 className="text-5xl font-bold tracking-tight text-foreground serif">
                                Advanced Security Monitoring
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Enterprise-grade security features for system
                                administrators
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="space-y-6">
                            {[
                                {
                                    icon: "🔐",
                                    title: "Multi-factor Authentication",
                                    desc: "Enterprise-grade security with multiple verification layers",
                                    color: "from-blue-500/10 to-blue-500/5",
                                },
                                {
                                    icon: "📊",
                                    title: "Audit Logging",
                                    desc: "All admin activities are logged and timestamped",
                                    color: "from-emerald-500/10 to-emerald-500/5",
                                },
                                {
                                    icon: "🚨",
                                    title: "Real-time Monitoring",
                                    desc: "Continuous security monitoring and alert systems",
                                    color: "from-orange-500/10 to-orange-500/5",
                                },
                                {
                                    icon: "👥",
                                    title: "Role-based Access",
                                    desc: "Granular permissions based on admin roles",
                                    color: "from-purple-500/10 to-purple-500/5",
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-5 rounded-xl bg-linear-to-r backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
                                >
                                    <div
                                        className={`size-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Status Footer */}
                        <div className="pt-8 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-sm font-medium text-foreground">
                                            System Status
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        • All systems operational
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Last updated: Today
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
