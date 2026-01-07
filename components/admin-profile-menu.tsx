"use client";

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

interface AdminProfileMenuProps {
    staff: {
        full_name: string;
        email: string;
        role: string | null;
    };
}

export function AdminProfileMenu({ staff }: AdminProfileMenuProps) {
    const { isMobile } = useSidebar();

    const initials =
        (staff.full_name?.split(" ")[0]?.[0] || "") +
        (staff.full_name?.split(" ")[1]?.[0] || "");

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = "/auth/admin";
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {staff.full_name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {staff.role || "Administrator"}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
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
                                        {staff.full_name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {staff.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = "/admin/profile")
                                }
                                className="cursor-pointer"
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = "/admin/settings")
                                }
                                className="cursor-pointer"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Preferences</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = "/admin/security")
                                }
                                className="cursor-pointer"
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Security</span>
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
