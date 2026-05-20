import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
    title: "Caregiver | CuraSync",
    description: "Caregiver portal — monitor linked patient health data",
};

export default function CaregiverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <div className="min-h-screen bg-background">{children}</div>
        </ClerkProvider>
    );
}
