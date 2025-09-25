"use client";

import {
    FileText,
    Loader2,
    Stethoscope,
    AlertCircle,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function AnalyzePage() {
    const [symptoms, setSymptoms] = useState("");
    const [result, setResult] = useState<{
        possible_disease: string;
        confidence_level: string;
        suggested_action: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) {
            setError("Please describe your symptoms before analyzing.");
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_CURA_SYNC_AI}/analyze`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ symptoms }),
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(
                    errData.detail ||
                        "Failed to analyze symptoms. Please try again."
                );
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNewAnalysis = () => {
        setSymptoms("");
        setResult(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-8 px-4 md:pt-24 md:pb-12 md:px-6">
            <div className="max-w-4xl mx-auto w-full space-y-6">
                {/* Header Section - Fixed at top */}
                <div className="text-center space-y-4 sticky top-4 bg-background/80 backdrop-blur-sm z-10 py-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl border-2 border-primary shadow-sm">
                            <Stethoscope className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                            Symptom Checker
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Describe your symptoms for a preliminary AI-powered
                        assessment
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-yellow-400">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span className="text-sm font-medium">
                            AI-Powered Analysis
                        </span>
                    </div>
                </div>

                {/* Results Section - Appears between header and input */}
                {result && (
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                        {/* User's Symptoms */}
                        <Card className="border-2 border-primary/30 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary-foreground">
                                            U
                                        </span>
                                    </div>
                                    <span>Your Symptoms</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground whitespace-pre-wrap">
                                    {symptoms}
                                </p>
                            </CardContent>
                        </Card>

                        {/* AI Analysis Result */}
                        <Card className="border-2 border-primary shadow-sm">
                            <CardHeader className="pb-3 bg-primary/5 border-b-2 border-foreground/10">
                                <CardTitle className="text-sm font-semibold text-primary flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                    <span>AI Analysis</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Possible Condition
                                        </h3>
                                        <p className="text-lg font-bold text-foreground bg-secondary/30 p-3 rounded-lg border border-foreground/10">
                                            {result.possible_disease}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Confidence Level
                                        </h3>
                                        <div className="bg-secondary/30 p-3 rounded-lg border border-foreground/10">
                                            <p className="text-lg font-bold text-foreground">
                                                {result.confidence_level}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Recommended Action
                                    </h3>
                                    <ul className="list-disc list-inside space-y-2 text-base text-foreground leading-relaxed bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                                        {result.suggested_action
                                            .split("\n")
                                            .filter((line) =>
                                                line.trim().startsWith("-")
                                            )
                                            .map((line, idx) => (
                                                <li key={idx}>
                                                    {line
                                                        .replace(/^-/, "")
                                                        .trim()}
                                                </li>
                                            ))}
                                    </ul>
                                </div>

                                <div className="pt-4 border-t-2 border-foreground/10 text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg">
                                    <span className="font-semibold text-foreground">
                                        Note:
                                    </span>{" "}
                                    This is a preliminary assessment only and
                                    not a medical diagnosis. Please consult a
                                    healthcare professional for proper medical
                                    advice.
                                </div>
                            </CardContent>
                        </Card>

                        {/* New Analysis Button */}
                        <div className="text-center pt-4">
                            <Button
                                onClick={handleNewAnalysis}
                                variant="outline"
                                className="border-2 border-foreground shadow-sm"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Start New Analysis
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && !result && (
                    <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex items-start space-x-3 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-destructive">
                                Error
                            </p>
                            <p className="text-sm text-destructive/90">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Input Form - Only show when no result or during new analysis */}
                {!result && (
                    <Card className="border-2 border-foreground shadow-sm sticky bottom-4 bg-background/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span>Describe Your Symptoms</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Textarea
                                    value={symptoms}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>
                                    ) => setSymptoms(e.target.value)}
                                    placeholder="Example: Headache, fever, and sore throat for the past two days. Include details like severity, duration, and any other relevant information..."
                                    rows={6}
                                    className="resize-none border-2 border-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Be as detailed as possible for better
                                    accuracy
                                </p>
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-foreground shadow-sm hover:shadow-md transition-all duration-200 font-semibold py-3 text-base"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing Symptoms...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="mr-2 h-5 w-5" />
                                        Analyze Symptoms
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Footer Note */}
                <div className="text-center text-xs text-muted-foreground pt-4">
                    <p>
                        Your privacy is important. Symptom descriptions are
                        processed securely and not stored.
                    </p>
                </div>
            </div>
        </div>
    );
}
