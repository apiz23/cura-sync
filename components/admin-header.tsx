"use client";

import { useAuth } from "@/components/authprovideradmin";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/getPageTitle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

export function AdminHeader() {
    const { staff, loading } = useAuth();
    const pathname = usePathname();
    const pageTitle = getPageTitle(pathname);

    if (loading) {
        return (
            <header className="flex h-16 items-center justify-between border-b bg-background/95 px-6">
                Loading...
            </header>
        );
    }

    if (!staff) return null;

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background/90 px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9" />
                <p className="text-sm font-semibold">{pageTitle}</p>
            </div>

            <div className="flex items-center gap-3">
                <AnimatedThemeToggler />
            </div>
        </header>
    );
}
