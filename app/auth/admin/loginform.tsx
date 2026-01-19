"use client";

import { useState } from "react";
import { Shield, Lock, Eye, EyeOff, Loader2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function AdminLoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        if (loading) return;
        setLoading(true);

        toast.promise(
            (async () => {
                const res = await fetch("/api/auth/admin-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Invalid credentials");
                }

                sessionStorage.setItem(
                    "cura-auth",
                    JSON.stringify({
                        email,
                        userId: data.id,
                        role: data.role,
                        sessionId: data.sessionId || Date.now().toString(),
                        loggedInAt: Date.now(),
                    })
                );

                if (data.facilityId) {
                    sessionStorage.setItem("facilityId", data.facilityId);
                }

                return data;
            })(),
            {
                loading: "Authenticating admin...",
                success: () => {
                    setTimeout(() => {
                        window.location.href = "/admin/dashboard";
                    }, 800);

                    return "Admin login successful!";
                },
                error: (err) => err.message || "Login failed",
                finally: () => setLoading(false),
            }
        );
    }

    return (
        <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
            <Card className="border shadow-lg bg-card">
                <CardHeader className="text-center space-y-6 pb-8">
                    <div className="flex justify-center">
                        <div className="size-20 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                            <Shield className="size-10 text-primary-foreground" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                            Admin Portal
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-base">
                            Secure access to system administration
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    <form onSubmit={handleLogin}>
                        <FieldGroup className="space-y-6">
                            {/* Email Field */}
                            <Field>
                                <FieldLabel
                                    htmlFor="email"
                                    className="text-foreground/90 font-medium"
                                >
                                    Email Address
                                </FieldLabel>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden" />
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            placeholder="admin@example.com"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className="h-12 pl-11 rounded-xl border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            disabled={loading}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Field>

                            {/* Password Field */}
                            <Field>
                                <FieldLabel
                                    htmlFor="password"
                                    className="text-foreground/90 font-medium"
                                >
                                    Password
                                </FieldLabel>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden" />
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            required
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            className="h-12 pl-11 pr-11 rounded-xl border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            disabled={loading}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            disabled={loading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Field>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Key className="w-5 h-5 mr-2" />
                                        Sign In
                                    </>
                                )}
                            </Button>
                        </FieldGroup>
                    </form>

                    {/* Security Note */}
                    <div className="p-5 rounded-xl bg-accent/50 border border-border">
                        <div className="flex items-start gap-4">
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-sm font-medium text-foreground">
                                    Secure Access
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    This portal is restricted to authorized
                                    administrators only. All activities are
                                    logged and monitored for security
                                    compliance.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
