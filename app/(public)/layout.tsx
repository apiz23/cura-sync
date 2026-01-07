import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import ChatbotLauncher from "@/components/chatbot-launcher";
import { ClerkProvider } from "@clerk/nextjs";

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    variable: "--font-sans",
});

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "CuraSync",
    description: "AI-powered symptom analysis platform",
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
                    className={`${dmSans.className} ${spaceMono.className} antialiased`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        <ChatbotLauncher />
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
