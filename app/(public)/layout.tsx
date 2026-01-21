import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import ChatbotLauncher from "@/components/chatbot-launcher";
import { ClerkProvider } from "@clerk/nextjs";
import IntroGate from "./intro-gate";

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
    title: "CuraSync",
    description: "AI-powered symptom analysis platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body
                    className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
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
                        <Toaster richColors />
                        <IntroGate />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
