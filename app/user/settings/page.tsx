"use client";

import { useTheme } from "next-themes";
import { Settings, Sun, Moon, Monitor, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const themeOptions: { value: string; label: string; icon: typeof Sun }[] = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];

    return (
        <UserPageShell>
            <UserPageHeader
                icon={Settings}
                title="App Settings"
                description="Manage your display preferences and application settings."
            />

            {/* Appearance */}
            <section className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                    Appearance
                </h2>
                <div className="rounded-xl border border-border bg-card p-5">
                    <p className="font-medium text-foreground">Theme</p>
                    <p className="mt-1 text-base text-muted-foreground">
                        Choose how CuraSync looks on your device.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {themeOptions.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-base font-medium transition-colors ${
                                    theme === value
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Language & Region */}
            <section className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                    Language & Region
                </h2>
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Globe className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Language</p>
                                <p className="text-base text-muted-foreground">
                                    English (United Kingdom)
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            Change
                        </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Globe className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Time zone</p>
                                <p className="text-base text-muted-foreground">
                                    Asia/Kuala_Lumpur (UTC+8)
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            Change
                        </Button>
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                    About
                </h2>
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Info className="h-4 w-4" />
                        </div>
                        <div className="space-y-1.5 text-base">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Platform</span>
                                <span className="font-medium text-foreground">CuraSync Web</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Version</span>
                                <span className="font-medium text-foreground">1.0.0</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Environment</span>
                                <span className="font-medium text-foreground">
                                    {process.env.NODE_ENV ?? "production"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Project</span>
                                <span className="font-medium text-foreground">UTHM FYP 2025/2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </UserPageShell>
    );
}
