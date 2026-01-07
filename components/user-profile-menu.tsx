"use client";

import { User, Settings, Shield, LogOut, ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export default function UserProfileMenu() {
    const { user, isSignedIn } = useUser();
    const { isMobile } = useSidebar();

    if (!isSignedIn || !user) {
        return null; // Or show a sign-in button
    }

    const initials = (
        (user.firstName?.[0] || "") + (user.lastName?.[0] || "") || "GU"
    ).toUpperCase();

    const fullName =
        user.firstName || user.lastName
            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
            : "Guest User";

    const email = user.emailAddresses?.[0]?.emailAddress || "user@example.com";
    const userRole = (user.publicMetadata?.role as string) || "Patient";
    const userImage = user.imageUrl;

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
                                {userImage ? (
                                    <AvatarImage
                                        src={userImage}
                                        alt={fullName}
                                    />
                                ) : null}
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {fullName}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {userRole}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "top" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {userImage ? (
                                        <AvatarImage
                                            src={userImage}
                                            alt={fullName}
                                        />
                                    ) : null}
                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {fullName}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = "/user/profile")
                                }
                                className="cursor-pointer"
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = "/user/settings")
                                }
                                className="cursor-pointer"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Preferences</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = "/user/security")
                                }
                                className="cursor-pointer"
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Security</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <SignOutButton>
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </SignOutButton>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
