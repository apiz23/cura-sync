import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import ChatbotLauncher from "@/components/chatbot-launcher";
import Footer from "@/components/footer";
export const metadata: Metadata = {
    title: "CuraSync",
    description: "AI-powered symptom analysis platform",
};

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <ChatbotLauncher />
            {children}
            <Footer />
        </>
    );
}
