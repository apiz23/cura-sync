"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/authprovideradmin";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/getPageTitle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { ChevronDown, User, Settings, Shield, LogOut } from "lucide-react";

export function AdminHeader() {
    const { staff, loading } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

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

    const initials =
        (staff.full_name?.split(" ")[0]?.[0] || "") +
        (staff.full_name?.split(" ")[1]?.[0] || "");

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background/90 px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9" />
                {/* Replace static text with dynamic page name */}
                <p className="text-sm font-semibold">{pageTitle}</p>
            </div>

            <div className="flex items-center gap-3">
                <ModeToggle />

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/40 transition"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-bold truncate">
                                {staff.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {staff.role}
                            </p>
                        </div>

                        <ChevronDown
                            className={`w-4 transition ${
                                isDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-background shadow-xl border z-50">
                            <div className="p-4 border-b">
                                <p className="font-semibold">
                                    {staff.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {staff.email}
                                </p>
                            </div>

                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() =>
                                        (window.location.href =
                                            "/admin/profile")
                                    }
                                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-accent/60"
                                >
                                    <User className="w-4 text-blue-600" />
                                    Profile
                                </button>

                                <button
                                    onClick={() =>
                                        (window.location.href =
                                            "/admin/settings")
                                    }
                                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-accent/60"
                                >
                                    <Settings className="w-4 text-green-600" />
                                    Preferences
                                </button>

                                <button
                                    onClick={() =>
                                        (window.location.href =
                                            "/admin/security")
                                    }
                                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-accent/60"
                                >
                                    <Shield className="w-4 text-orange-600" />
                                    Security
                                </button>
                            </div>

                            <div className="p-2 border-t">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("staff_email");
                                        window.location.href = "/auth/login";
                                    }}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
