"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { EASE } from "@/hooks/use-motion-config";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const themeOptions: { value: string; label: string; icon: typeof Sun }[] = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];

    return (
        <UserPageShell>
            <motion.div
                className="contents"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
            >
            <UserPageHeader
                sectionLabel="Preferences"
                title="App Settings"
                description="Manage your display preferences and application settings."
            />

            {/* Appearance */}
            <section>
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Appearance
                </p>
                <div className="h-px bg-border/50 mb-5" />
                <div>
                    <p className="text-sm font-medium text-foreground">Theme</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose how CuraSync looks on your device.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {themeOptions.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
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
            <section>
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Language & Region
                </p>
                <div className="h-px bg-border/50 mb-5" />
                <div className="space-y-0">
                    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-4">
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Language</p>
                                <p className="text-xs text-muted-foreground">
                                    English (United Kingdom)
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            Change
                        </Button>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-4">
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Time zone</p>
                                <p className="text-xs text-muted-foreground">
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
            <section>
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    About
                </p>
                <div className="h-px bg-border/50 mb-5" />
                <div>
                    <div className="flex items-start gap-3 mb-4">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">CuraSync Platform</p>
                    </div>
                    {[
                        { label: "Platform", value: "CuraSync Web" },
                        { label: "Version", value: "1.0.0" },
                        { label: "Environment", value: process.env.NODE_ENV ?? "production" },
                        { label: "Project", value: "UTHM FYP 2025/2026" },
                    ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-4 border-b border-border/70 py-3 last:border-0">
                            <span className="text-sm text-muted-foreground">{row.label}</span>
                            <span className="text-sm font-medium text-foreground">{row.value}</span>
                        </div>
                    ))}
                </div>
            </section>
            </motion.div>
        </UserPageShell>
    );
}
