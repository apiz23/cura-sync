import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono, Noto_Serif_Georgian } from "next/font/google";
import "./globals.css";

const sans = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

const serif = Noto_Serif_Georgian({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-serif",
	display: "swap",
});

const mono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "CuraSync",
	description: "AI-powered healthcare platform",
	icons: {
		icon: [
			{ url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		shortcut: "/icons/favicon.ico",
		apple: "/icons/apple-touch-icon.png",
	},
	manifest: "/icons/site.webmanifest",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html
				lang="en"
				className={`${sans.variable} ${serif.variable} ${mono.variable} scroll-smooth`}
				suppressHydrationWarning
			>
				<body className="bg-background text-foreground font-sans antialiased">
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<Toaster richColors />
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
