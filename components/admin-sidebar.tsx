"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/authprovideradmin";
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Pill,
    Shield,
    ClipboardList,
    Settings,
    UserCircle,
    BarChart3,
    UserPlus,
    Hospital,
    Stethoscope,
} from "lucide-react";

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

interface MenuItem {
    title: string;
    url: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    isActive?: boolean;
    adminOnly?: boolean;
}

interface MenuGroup {
    title: string;
    items: MenuItem[];
}

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const { staff } = useAuth();
    const role = staff?.role || "";
    const pathname = usePathname();

    if (!staff) return null;

    const adminMenu: MenuGroup[] = [
        {
            title: "Platform Overview",
            items: [
                {
                    title: "Dashboard Home",
                    url: "/admin/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    title: "Analytics & Reports",
                    url: "/analytics",
                    icon: BarChart3,
                },
            ],
        },
        {
            title: "Management & Workflow",
            items: [
                {
                    title: "Patient Management",
                    url: "/admin/patients",
                    icon: Users,
                },
                {
                    title: "Record Verification",
                    url: "/records/verify",
                    icon: FileCheck,
                },
                {
                    title: "Prescription Queue",
                    url: "/prescriptions",
                    icon: Pill,
                },
                {
                    title: "Appointments",
                    url: "/admin/appointments",
                    icon: ClipboardList,
                },
                {
                    title: "Staff",
                    url: "/admin/staff",
                    icon: UserPlus,
                    adminOnly: true,
                },
            ],
        },
        {
            title: "System & Security",
            items: [
                {
                    title: "Blockchain Status",
                    url: "/blockchain-status",
                    icon: Shield,
                },
                {
                    title: "Staff Accounts",
                    url: "/admin/profile",
                    icon: UserCircle,
                },
                { title: "System Settings", url: "/settings", icon: Settings },
                {
                    title: "Edit Health Center",
                    url: "/admin/health-center",
                    icon: Hospital,
                    adminOnly: true,
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <Stethoscope className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-xs">CuraSync Admin</span>
                    </div>
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent>
                {adminMenu.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items
                                    .filter(
                                        (item) =>
                                            !(
                                                item.adminOnly &&
                                                role !== "admin"
                                            )
                                    )
                                    .map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.url;

                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                                >
                                                    <Link
                                                        href={item.url}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        <span className="text-sm font-medium">
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
            <SidebarFooter>
                <AdminProfileMenu staff={staff} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
