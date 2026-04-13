import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/components/authprovideradmin";

export const metadata: Metadata = {
	title: "Admin Dashboard | CuraSync",
	description: "Admin panel for managing CuraSync platform",
};

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<AuthProvider>
			<SidebarProvider
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 72)",
						"--sidebar-width-mobile": "22rem",
						"--header-height": "calc(var(--spacing) * 12)",
					} as React.CSSProperties
				}
			>
				<AdminSidebar />
				<SidebarInset className="overflow-hidden bg-background text-foreground">
					<AdminHeader />
					<div className="@container/main flex flex-1 flex-col overflow-auto bg-background text-foreground">
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</AuthProvider>
	);
}
