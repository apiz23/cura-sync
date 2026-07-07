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
	useSidebar,
} from "@/components/ui/sidebar";
import { userMenu } from "@/lib/user-menu";
import UserProfileMenu from "./user-profile-menu";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "./brand-logo";

export function UserSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const { isLoaded } = useUser();
	const { isMobile, setOpenMobile } = useSidebar();

	const isMenuActive = (itemUrl: string) => {
		if (itemUrl === "/user") {
			return pathname === "/user";
		}
		return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
	};

	return (
		<Sidebar className="overflow-x-hidden" {...props}>
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
						<SidebarGroupLabel className="px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
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
