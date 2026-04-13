import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import ChatbotLauncher from "@/components/chatbot-launcher";
import IntroGate from "./intro-gate";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/en.json";

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
		<NextIntlClientProvider locale="en" messages={messages}>
			<Navbar />
			<ChatbotLauncher />
			{children}
			<IntroGate />
		</NextIntlClientProvider>
	);
}
