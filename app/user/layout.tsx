import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { UserSidebar } from "@/components/user-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserHeader } from "@/components/user-header";
import { ClerkProvider } from "@clerk/nextjs";

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
    title: "User Dashboard | CuraSync",
    description: "Personal healthcare dashboard for CuraSync users",
};

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body
                    className={`${inter.className} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <SidebarProvider
                            style={
                                {
                                    "--sidebar-width": "16rem",
                                    "--sidebar-width-mobile": "20rem",
                                } as React.CSSProperties
                            }
                        >
                            <UserSidebar />
                            <SidebarInset>
                                <UserHeader />
                                <main className="flex-1 overflow-auto bg-linear-to-b from-background to-muted/20">
                                    {children}
                                    <Toaster richColors />
                                </main>
                            </SidebarInset>
                        </SidebarProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
