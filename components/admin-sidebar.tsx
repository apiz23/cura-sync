"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/authprovideradmin";

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
	useSidebar,
} from "@/components/ui/sidebar";
import { AdminProfileMenu } from "./admin-profile-menu";
import { adminMenu } from "@/lib/admin-menu";
import { BrandLogo } from "./brand-logo";
import { getStaffRoleLabel } from "@/lib/staff-role";

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { user, loading } = useAuth();
	const pathname = usePathname();
	const { isMobile, setOpenMobile } = useSidebar();

	// 🔑 IMPORTANT: handle loading FIRST
	if (loading) return null;
	if (!user) return null;

	const role = user.role;
	const roleLabel = getStaffRoleLabel(role);

	const isMenuActive = (itemUrl: string) => {
		if (itemUrl === "/admin") {
			return pathname === "/admin";
		}
		return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
	};

	return (
		<Sidebar className="overflow-x-hidden" {...props}>
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
							<BrandLogo className="bg-background size-8 rounded-full" />
							<div className="grid text-left text-base leading-tight group-data-[collapsible=icon]:hidden">
								<span className="font-semibold">CuraSync</span>
								<span className="text-base text-muted-foreground">{roleLabel} Console</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* ================= CONTENT ================= */}
			<SidebarContent>
				{adminMenu
					.filter((group) => !group.roles || group.roles.includes(role))
					.map((group) => (
						<SidebarGroup key={group.title}>
							<SidebarGroupLabel className="px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
								{group.title}
							</SidebarGroupLabel>

							<SidebarGroupContent>
								<SidebarMenu>
									{group.items
										.filter(
											(item) => !(item as any).roles || (item as any).roles.includes(role),
										)
										.map((item) => {
											const Icon = item.icon;
											const active = isMenuActive(item.url);

											return (
												<SidebarMenuItem key={item.title}>
													<SidebarMenuButton
														asChild
														isActive={active}
														tooltip={item.title}
														className="rounded-none gap-3 transition-colors data-[active=true]:bg-transparent data-[active=true]:text-foreground data-[active=true]:font-semibold hover:bg-muted/20 group-data-[collapsible=icon]:justify-center"
													>
														<Link
															href={item.url}
															className="flex w-full items-center gap-3 overflow-hidden"
															onClick={() => {
																if (isMobile) setOpenMobile(false);
															}}
														>
															<Icon className={active ? "size-4 shrink-0 text-primary" : "size-4 shrink-0 text-muted-foreground"} />
															<span className={`truncate text-sm group-data-[collapsible=icon]:hidden ${active ? "font-semibold text-foreground" : "font-normal text-muted-foreground"}`}>
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
				<AdminProfileMenu user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
