"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/getPageTitle";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { Separator } from "./ui/separator";

export function UserHeader() {
    const { isLoaded, isSignedIn } = useUser();
    const pathname = usePathname();
    const pageTitle = getPageTitle(pathname);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        fetch("/api/auth/sync", { method: "POST" }).catch(() => {
            console.error("User sync failed");
        });
    }, [isLoaded, isSignedIn]);

    if (!isLoaded) {
        return (
            <header className="flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur sticky top-0 z-50 px-6">
                <div className="h-4 w-48 bg-muted animate-pulse rounded-lg" />
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-muted animate-pulse rounded-lg" />
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                </div>
            </header>
        );
    }

    return (
        <header className="flex h-(--header-height) shrink-0 rounded-t-3xl items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) justify-between bg-background/90 p-3">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-sm font-semibold text-foreground">
                                {pageTitle}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
                <AnimatedThemeToggler />
            </div>
        </header>
    );
}
