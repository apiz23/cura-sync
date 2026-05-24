"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { userMenu } from "@/lib/user-menu";
import UserProfileMenu from "./user-profile-menu";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "./brand-logo";

export function UserSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const { isLoaded } = useUser();

	const isMenuActive = (itemUrl: string) => {
		if (itemUrl === "/user") {
			return pathname === "/user";
		}
		return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
	};

	return (
		<Sidebar variant="inset" className="overflow-x-hidden" {...props}>
			{/* ================= HEADER ================= */}
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg">
							<BrandLogo className="bg-background size-8 rounded-full" />
							<div className="grid text-left text-base leading-tight group-data-[collapsible=icon]:hidden">
								<span className="truncate font-semibold">CuraSync</span>
								<span className="truncate text-base text-muted-foreground">
									Patient Portal
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* ================= CONTENT ================= */}
			<SidebarContent className="overflow-x-hidden">
				{userMenu.map((group) => (
					<SidebarGroup key={group.title}>
						<SidebarGroupLabel className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
                                                    data-[active=true]:bg-primary/90
                                                    data-[active=true]:text-primary-foreground
                                                    group-data-[collapsible=icon]:justify-center
                                                "
											>
												<Link
													href={item.url}
													className="flex w-full items-center gap-3 overflow-hidden"
												>
													<Icon className="size-4 shrink-0" />
													<span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
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
				{!isLoaded ? (
					<div className="flex items-center gap-3 p-2">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<div className="flex-1 space-y-1 group-data-[collapsible=icon]:hidden">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-2 w-16" />
						</div>
						<Skeleton className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
					</div>
				) : (
					<UserProfileMenu />
				)}
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
