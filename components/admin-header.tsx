"use client";

import { useAuth } from "@/components/authprovideradmin";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/getPageTitle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { ModeToggle } from "./mode-toggle";

export function AdminHeader() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const pageTitle = getPageTitle(pathname);

    if (loading) {
        return (
            <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6">
                <div className="h-4 w-48 bg-muted animate-pulse rounded-lg" />
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-muted animate-pulse rounded-lg" />
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                </div>
            </header>
        );
    }

    if (!user) return null;

    return (
        <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <p className="text-sm font-semibold">{pageTitle}</p>
            </div>

            <div className="flex items-center gap-3">
                <ModeToggle />
            </div>
        </header>
    );
}
