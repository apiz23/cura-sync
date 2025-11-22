import { Metadata } from "next";
import AnalyzeClient from "./analyze-client";

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
    return <AnalyzeClient />;
}
