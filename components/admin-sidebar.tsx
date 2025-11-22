import * as React from "react";
import Link from "next/link"; // Assuming 'a' tags should be replaced with Next.js Link
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
} from "lucide-react";

import { SearchForm } from "@/components/search-form";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

// 1. New Data structure for Admin Navigation
const adminMenu = [
    {
        title: "Platform Overview",
        items: [
            {
                title: "Dashboard Home",
                url: "/dashboard",
                icon: LayoutDashboard,
                isActive: true,
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
                url: "/patients",
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
                url: "/appointments",
                icon: ClipboardList,
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
                url: "/staff-accounts",
                icon: UserCircle,
            },
            {
                title: "System Settings",
                url: "/settings",
                icon: Settings,
            },
        ],
    },
];

export function AdminSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-lg shadow-lg">
                        A
                    </div>
                    <h1 className="text-lg font-bold">CuraSync Admin</h1>
                </div>
                <SearchForm className="mt-4" />
            </SidebarHeader>

            <SidebarContent>
                {/* Map through the Admin menu groups */}
                {adminMenu.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={item.isActive}
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
            <SidebarRail />
        </Sidebar>
    );
}
