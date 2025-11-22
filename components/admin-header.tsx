"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import {
    Settings,
    User,
    Shield,
    LogOut,
    ChevronDown,
    Mail,
    BadgeCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AdminHeader() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const initials = (
        (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || "AD"
    ).toUpperCase();

    const fullName =
        user?.firstName || user?.lastName
            ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
            : "Admin User";

    const email =
        user?.emailAddresses?.[0]?.emailAddress || "admin@curasync.com";
    const userRole = (user?.publicMetadata?.role as string) || "Administrator";
    const userImage = user?.imageUrl;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isLoaded) {
        return (
            <header className="flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 px-6">
                <div className="h-4 w-48 bg-muted animate-pulse rounded-lg"></div>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-muted animate-pulse rounded-lg"></div>
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                </div>
            </header>
        );
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9 data-[state=open]:bg-accent transition-all duration-200 hover:scale-105" />
                <Separator
                    orientation="vertical"
                    className="h-6 data-[orientation=vertical]:h-6"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-sm font-semibold">
                                Dashboard
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
                <ModeToggle />

                <div className="relative" ref={dropdownRef}>
                    {/* User Avatar Button */}
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 p-2 rounded-xl cursor-pointer hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50 active:scale-95"
                    >
                        <Avatar className="h-8 w-8 ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
                            {/* Uses Google Image if available */}
                            <AvatarImage src={userImage} alt={fullName} />
                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold shadow-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="hidden sm:block text-left max-w-32">
                            <p className="text-sm font-semibold leading-none truncate">
                                {fullName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {userRole}
                            </p>
                        </div>

                        <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                                isDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl border bg-background/95 backdrop-blur-xl shadow-2xl z-50 border-border/50 animate-in fade-in-80 slide-in-from-top-2">
                            {/* User Info Section */}
                            <div className="p-4 border-b border-border/50 bg-linear-to-r from-muted/20 to-transparent">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-14 w-14 shadow-lg ring-2 ring-primary/10">
                                        <AvatarImage
                                            src={userImage}
                                            alt={fullName}
                                        />
                                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-base font-semibold truncate">
                                                {fullName}
                                            </p>
                                            {isSignedIn && (
                                                <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="w-3 h-3" />
                                            <p className="text-xs truncate flex-1">
                                                {email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    isSignedIn
                                                        ? "bg-green-500 animate-pulse"
                                                        : "bg-muted-foreground"
                                                }`}
                                            ></div>
                                            <span className="text-xs text-muted-foreground">
                                                {isSignedIn
                                                    ? "Online"
                                                    : "Offline"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => {
                                        window.location.href = "/admin/profile"; // Changed to admin route
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/80 hover:shadow-sm transition-all duration-200 group"
                                >
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium">
                                            Profile
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Manage admin info
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        window.location.href =
                                            "/admin/settings"; // Changed to admin route
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/80 hover:shadow-sm transition-all duration-200 group"
                                >
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                                        <Settings className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium">
                                            Preferences
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Dashboard settings
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        window.location.href =
                                            "/admin/security"; // Changed to admin route
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/80 hover:shadow-sm transition-all duration-200 group"
                                >
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                                        <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium">
                                            Security
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            System safety
                                        </p>
                                    </div>
                                </button>
                            </div>

                            {/* Sign Out Section */}
                            <div className="p-2 border-t border-border/50 bg-muted/10">
                                <button
                                    onClick={() => {
                                        signOut({ redirectUrl: "/auth/login" });
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 group"
                                >
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:scale-110 transition-transform">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium">
                                            Sign Out
                                        </p>
                                        <p className="text-xs text-red-500/70">
                                            End admin session
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
