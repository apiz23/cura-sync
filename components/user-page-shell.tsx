"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface UserPageShellProps {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

interface UserPageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: React.ReactNode;
    meta?: React.ReactNode;
    align?: "left" | "center";
    className?: string;
}

export function UserPageShell({
    children,
    className,
    contentClassName,
}: UserPageShellProps) {
    return (
        <section
            className={cn(
                "min-h-full bg-linear-to-b from-background via-background to-primary/5",
                className
            )}
        >
            <div
                className={cn(
                    "mx-auto flex w-full flex-col gap-8 px-4 py-6 md:px-6 md:py-8",
                    contentClassName
                )}
            >
                {children}
            </div>
        </section>
    );
}

export function UserPageHeader({
    title,
    description,
    icon: Icon,
    actions,
    meta,
    align = "left",
    className,
}: UserPageHeaderProps) {
    const centered = align === "center";

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8",
                className
            )}
        >
            <div
                className={cn(
                    "relative flex gap-6",
                    centered
                        ? "flex-col items-center text-center"
                        : "flex-col justify-between lg:flex-row lg:items-center"
                )}
            >
                <div
                    className={cn(
                        "flex gap-4",
                        centered
                            ? "flex-col items-center"
                            : "items-start"
                    )}
                >
                    {Icon ? (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/10">
                            <Icon className="h-7 w-7" />
                        </div>
                    ) : null}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                            {title}
                        </h1>
                        {description ? (
                            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                                {description}
                            </p>
                        ) : null}
                        {meta ? (
                            <div
                                className={cn(
                                    "flex flex-wrap gap-2 pt-2",
                                    centered && "justify-center"
                                )}
                            >
                                {meta}
                            </div>
                        ) : null}
                    </div>
                </div>

                {actions ? (
                    <div
                        className={cn(
                            "relative z-10 flex shrink-0 flex-wrap gap-3",
                            centered && "justify-center"
                        )}
                    >
                        {actions}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
