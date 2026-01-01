"use client";

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
import { userMenu } from "@/lib/user-menu";
import { Stethoscope } from "lucide-react";

export function UserSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar {...props}>
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl shadow-lg">
                        <Stethoscope className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            CuraSync
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Health Management
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {userMenu.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
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
            <SidebarRail />
        </Sidebar>
    );
}
