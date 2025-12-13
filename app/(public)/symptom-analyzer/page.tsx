import { Metadata } from "next";
import { SymptomChecker } from "@/components/symptoms-checker";

export const metadata: Metadata = {
    title: "Symptom Analyzer | CuraSync",
    description:
        "Analyze your symptoms with AI-powered health insights. Get instant preliminary health assessments and professional guidance recommendations.",
    keywords: [
        "symptom checker",
        "AI health analysis",
        "medical diagnosis",
        "health assessment",
        "symptom analyzer",
    ],
};

export default function AnalyzePage() {
    return <SymptomChecker className="mt-10" />;
}
