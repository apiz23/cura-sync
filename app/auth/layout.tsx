import type { Metadata } from "next";
export const metadata: Metadata = {
	title: "CuraSync",
	description: "Modern Healthcare Management System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
