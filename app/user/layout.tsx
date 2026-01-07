import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { UserSidebar } from "@/components/user-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserHeader } from "@/components/user-header";
import { ClerkProvider } from "@clerk/nextjs";

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
                    className={`${dmSans.className} ${spaceMono.variable} antialiased bg-background text-foreground`}
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
                                </main>
                            </SidebarInset>
                        </SidebarProvider>

                        <Toaster theme="dark" richColors closeButton />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
