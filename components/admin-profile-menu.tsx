"use client";

import Link from "next/link";
import { User, Settings, Shield, LogOut, ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { AuthUser } from "@/app/types";
import { getStaffRoleLabel } from "@/lib/staff-role";

interface AdminProfileMenuProps {
    user: AuthUser;
}

export function AdminProfileMenu({ user }: AdminProfileMenuProps) {
    const { isMobile } = useSidebar();

    const initials =
        (user.full_name?.split(" ")[0]?.[0] || "") +
        (user.full_name?.split(" ")[1]?.[0] || "");

    const handleLogout = () => {
        fetch("/api/auth/staff/logout", { method: "POST" }).finally(() => {
            window.location.href = "/auth/admin";
        });
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="
                                gap-3
                                data-[state=open]:bg-sidebar-accent
                                data-[state=open]:text-sidebar-accent-foreground
                                group-data-[collapsible=icon]:justify-center
                            "
                        >
                            {/* Avatar */}
                            <Avatar className="h-8 w-8 rounded-lg shrink-0">
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            {/* Text */}
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-medium">
                                    {user.full_name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {getStaffRoleLabel(user.role)}
                                </span>
                            </div>

                            <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.full_name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/admin/profile"
                                    className="flex items-center gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    href="/admin/settings"
                                    className="flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Preferences</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    href="/admin/security"
                                    className="flex items-center gap-2"
                                >
                                    <Shield className="h-4 w-4" />
                                    <span>Security</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
