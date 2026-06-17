import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono, Noto_Serif_Georgian } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

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
	title: {
		default: "CuraSync — AI-Powered Healthcare Platform",
		template: "%s | CuraSync",
	},
	description:
		"CuraSync connects patients with clinics through AI-powered health tracking, appointment management, and real-time monitoring. Available across Malaysia.",
	keywords: [
		"healthcare platform Malaysia",
		"clinic management system",
		"AI health tracking",
		"patient management",
		"appointment booking Malaysia",
		"CuraSync",
	],
	metadataBase: new URL("https://cura-sync.my"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "CuraSync — AI-Powered Healthcare Platform",
		description:
			"Connect patients with clinics through AI health tracking and real-time monitoring.",
		url: "https://cura-sync.my",
		siteName: "CuraSync",
		locale: "en_MY",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "CuraSync — AI-Powered Healthcare Platform",
		description:
			"Connect patients with clinics through AI health tracking and real-time monitoring.",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
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
					<Analytics />
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
