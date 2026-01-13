"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/authprovideradmin";
import { Stethoscope } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { AdminProfileMenu } from "./admin-profile-menu";
import { adminMenu } from "@/lib/admin-menu";

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const { staff } = useAuth();
    const role = staff?.role || "";
    const pathname = usePathname();

    if (!staff) return null;

    const isMenuActive = (itemUrl: string) => {
        if (itemUrl === "/admin") {
            return pathname === "/admin";
        }

        return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
    };

    return (
        <Sidebar variant="inset" className="overflow-x-hidden" {...props}>
            {/* ================= HEADER ================= */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="
                                gap-3
                                justify-start
                                group-data-[collapsible=icon]:justify-center
                                group-data-[collapsible=icon]:px-0
                            "
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
                                <Stethoscope className="size-4" />
                            </div>
                            <div className="grid text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="font-semibold">CuraSync</span>
                                <span className="text-xs text-muted-foreground">
                                    Admin
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ================= CONTENT ================= */}
            <SidebarContent>
                {adminMenu
                    .filter(
                        (group) => !group.roles || group.roles.includes(role)
                    )
                    .map((group) => (
                        <SidebarGroup key={group.title}>
                            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                                {group.title}
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isMenuActive(item.url);

                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={active}
                                                    tooltip={item.title}
                                                    className="
                                                        gap-3
                                                        data-[active=true]:bg-primary/10
                                                        data-[active=true]:text-primary
                                                        group-data-[collapsible=icon]:justify-center
                                                    "
                                                >
                                                    <Link href={item.url}>
                                                        <Icon className="size-4 shrink-0" />
                                                        <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                                                            {item.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
            </SidebarContent>

            {/* ================= FOOTER ================= */}
            <SidebarFooter>
                <AdminProfileMenu staff={staff} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
