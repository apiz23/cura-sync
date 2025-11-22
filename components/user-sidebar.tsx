"use client";

import {
    LayoutDashboard,
    Brain,
    FileText,
    CalendarDays,
    ShieldCheck,
    Settings,
    User,
    Stethoscope,
    Pill,
    Heart,
    Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const userMenu = [
    {
        title: "Health Overview",
        items: [
            {
                title: "Dashboard",
                url: "/user/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Vitals & Tracking",
                url: "/user/vitals",
                icon: Activity,
            },
            {
                title: "Health Score",
                url: "/user/health-score",
                icon: Heart,
            },
        ],
    },
    {
        title: "AI & Consultation",
        items: [
            {
                title: "AI Symptom Check",
                url: "/user/symptom-check",
                icon: Brain,
            },
            {
                title: "Appointments",
                url: "/user/appointments",
                icon: CalendarDays,
            },
            {
                title: "Find Doctors",
                url: "/user/doctors",
                icon: Stethoscope,
            },

            {
                title: "Medication Manager",
                url: "/user/medications",
                icon: Pill,
            },
        ],
    },
    {
        title: "Medical Records",
        items: [
            {
                title: "Medical History",
                url: "/user/records",
                icon: FileText,
            },
            {
                title: "Blockchain Security",
                url: "/user/blockchain",
                icon: ShieldCheck,
            },
        ],
    },
    {
        title: "Account",
        items: [
            {
                title: "Profile Settings",
                url: "/user/profile",
                icon: User,
            },
            {
                title: "App Settings",
                url: "/user/settings",
                icon: Settings,
            },
        ],
    },
];

export function UserSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar {...props}>
            <SidebarHeader className="border-b p-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            CuraSync
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Health Management
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Map through menu groups */}
                {userMenu.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    // Check if the current path starts with the item url
                                    // Using startsWith helps keep 'active' state even on sub-pages if desired,
                                    // or use strict equality (===) for exact match.
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

            <SidebarRail />
        </Sidebar>
    );
}
