import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "../globals.css";

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
    title: "CuraSync",
    description: "Modern Healthcare Management System",
};

export default function RootLayout({
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
                      {children}
                        <Toaster
                            position="top-right"
                            theme="dark"
                            richColors
                            closeButton
                        />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
