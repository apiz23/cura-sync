import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/components/authprovideradmin";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
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
                    className={`${inter.className} ${jetbrainsMono.className} antialiased bg-background text-foreground`}
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
