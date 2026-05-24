import type { Metadata } from "next";
import { UserSidebar } from "@/components/user-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserHeader } from "@/components/user-header";

export const metadata: Metadata = {
	title: "User Dashboard | CuraSync",
	description: "Personal healthcare dashboard for CuraSync users",
};

export default function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--sidebar-width-mobile": "22rem",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<UserSidebar />
			<SidebarInset className="overflow-hidden bg-background text-foreground">
				<UserHeader />
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="@container/main flex flex-1 flex-col overflow-auto bg-background">
						{children}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
