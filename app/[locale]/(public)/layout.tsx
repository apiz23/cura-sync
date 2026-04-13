import Navbar from "@/components/navbar";
import ChatbotLauncher from "@/components/chatbot-launcher";
import IntroGate from "@/app/(public)/intro-gate";

export default function LocalizedPublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <ChatbotLauncher />
            {children}
            <IntroGate />
        </>
    );
}
