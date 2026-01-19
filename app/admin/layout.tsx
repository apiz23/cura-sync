import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/components/authprovideradmin";

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
});

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-mono",
});

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
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body
                    className={`${dmSans.className} ${spaceMono.variable} antialiased bg-background text-foreground`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <AuthProvider>
                            <SidebarProvider
                                style={
                                    {
                                        "--sidebar-width": "16rem",
                                        "--sidebar-width-mobile": "20rem",
                                    } as React.CSSProperties
                                }
                            >
                                <AdminSidebar />
                                <SidebarInset>
                                    <AdminHeader />
                                    {children}
                                </SidebarInset>
                            </SidebarProvider>
                        </AuthProvider>
                        <Toaster richColors />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
