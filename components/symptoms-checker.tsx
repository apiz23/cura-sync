"use client";

import {
    FileText,
    Loader2,
    Stethoscope,
    AlertCircle,
    Sparkles,
    Check,
    Shield,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AnimatedTags from "@/components/smoothui/animated-tags";

export interface AnalysisResult {
    possible_disease: string;
    confidence_level: string;
    suggested_action: string;
}

interface SymptomCheckerProps {
    className?: string;
}

export function SymptomChecker({ className }: SymptomCheckerProps) {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [textInput, setTextInput] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const commonSymptoms = useMemo(
        () => [
            "Fever",
            "Cough",
            "Headache",
            "Sore Throat",
            "Fatigue",
            "Chest Pain",
            "Dizziness",
            "Runny Nose",
            "Body Chills",
            "Nausea",
            "Shortness of Breath",
            "Muscle Aches",
            "Sneezing",
        ],
        []
    );

    const handleTagChange = useCallback((items: string[]) => {
        setSelectedSymptoms(items);
        setResult(null);
        setError(null);
    }, []);

    const clearAll = useCallback(() => {
        setSelectedSymptoms([]);
        setTextInput("");
        setResult(null);
        setError(null);
    }, []);

    const allSymptoms = useMemo(() => {
        const symptomsList = [...selectedSymptoms];
        if (textInput.trim()) {
            const additionalSymptoms = textInput
                .trim()
                .split(/[.,]/)
                .filter((s) => s.trim());
            return [
                ...symptomsList,
                ...additionalSymptoms.map((s) => s.trim()),
            ];
        }
        return symptomsList;
    }, [selectedSymptoms, textInput]);

    const handleAnalyze = async () => {
        if (allSymptoms.length === 0) {
            setError("Please select or describe your symptoms first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms: allSymptoms.join(", ") }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const truncateSymptom = (symptom: string, maxLength: number = 30) => {
        if (symptom.length <= maxLength) return symptom;
        return symptom.substring(0, maxLength) + "...";
    };

    return (
        <div className={cn("w-full max-w-4xl mx-auto space-y-8", className)}>
            {/* Header */}
            <div className="text-center space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-primary rounded-3xl shadow-lg">
                        <Stethoscope className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                            Symptom Checker
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                            AI-powered health insights with professional
                            guidance
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Card */}
            {result && (
                <Card className="border-border shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent rounded-lg">
                                        <Sparkles className="h-6 w-6 text-accent-foreground" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Analysis Complete
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Selected Symptoms ({allSymptoms.length}
                                        ):
                                    </p>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                        {allSymptoms.map((symptom, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full"
                                                title={symptom}
                                            >
                                                <span className="truncate block max-w-[200px]">
                                                    {truncateSymptom(symptom)}
                                                </span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={clearAll}
                                className="border-border hover:bg-accent shrink-0"
                            >
                                New Analysis
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-card border border-border p-4 rounded-xl">
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Possible Condition
                                </h3>
                                <p className="text-xl font-bold text-foreground break-words">
                                    {result.possible_disease}
                                </p>
                            </div>

                            <div className="bg-card border border-border p-4 rounded-xl">
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Confidence Level
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse shrink-0" />
                                    <p className="text-lg font-semibold text-foreground">
                                        {result.confidence_level}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-card border border-border p-4 rounded-xl md:col-span-1">
                                <div className="h-full flex flex-col justify-center items-center text-muted-foreground text-sm text-center">
                                    <Shield className="h-6 w-6 mb-2 opacity-50" />
                                    AI Prediction Model v1.0
                                </div>
                            </div>
                        </div>

                        {/* Recommendations - Full Width */}
                        <div className="bg-card border border-border p-4 rounded-xl">
                            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-primary" />
                                Recommended Actions
                            </h3>
                            <div className="space-y-2">
                                {result.suggested_action
                                    .split("\n")
                                    .filter((line) =>
                                        line.trim().startsWith("-")
                                    )
                                    .map((line, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                                        >
                                            <div className="p-1 bg-primary rounded-full mt-0.5 shrink-0">
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                            <span className="text-foreground leading-relaxed">
                                                {line.replace(/^-/, "").trim()}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="p-4 bg-muted rounded-xl border border-border">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-accent rounded-lg shrink-0 mt-0.5">
                                    <Shield className="h-4 w-4 text-accent-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground text-sm">
                                        Important Medical Disclaimer
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        This AI analysis is for informational
                                        purposes only and is not a substitute
                                        for professional medical advice. Always
                                        consult with a qualified healthcare
                                        provider.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Alert */}
            {error && (
                <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                            Attention Required
                        </p>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Input Section */}
            {!result && (
                <Card className="border-border shadow-lg">
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent rounded-lg">
                                    <FileText className="h-5 w-5 text-accent-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">
                                        Select Your Symptoms
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Click to add or remove symptoms
                                    </p>
                                </div>
                            </div>

                            <div className="w-full">
                                <AnimatedTags
                                    initialTags={commonSymptoms}
                                    onChange={handleTagChange}
                                    selectedTags={selectedSymptoms}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium text-foreground flex items-center gap-2">
                                <span className="p-1 bg-accent rounded">
                                    <FileText className="h-3 w-3 text-accent-foreground" />
                                </span>
                                Additional Details
                                <span className="text-sm text-muted-foreground font-normal">
                                    (Optional)
                                </span>
                            </h3>
                            <div className="space-y-2">
                                <Textarea
                                    value={textInput}
                                    onChange={(e) =>
                                        setTextInput(e.target.value)
                                    }
                                    placeholder="Describe other symptoms, severity, duration, or any specific concerns..."
                                    rows={3}
                                    className="resize-none border border-border focus:border-primary rounded-lg p-3 text-sm transition-colors bg-input min-h-[80px]"
                                />
                                {textInput.length > 100 && (
                                    <p className="text-xs text-muted-foreground">
                                        {textInput.length} characters
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Selected Symptoms Preview */}
                        {allSymptoms.length > 0 && (
                            <div className="p-3 bg-accent/30 rounded-lg border border-border">
                                <p className="text-sm font-medium text-foreground mb-2">
                                    All Symptoms to Analyze (
                                    {allSymptoms.length}):
                                </p>
                                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                                    {allSymptoms.map((symptom, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-background text-foreground px-2 py-1 rounded-full text-xs"
                                        >
                                            <span className="truncate block max-w-[150px]">
                                                {truncateSymptom(symptom, 25)}
                                            </span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || allSymptoms.length === 0}
                                className={cn(
                                    "w-full py-3 text-base font-semibold rounded-lg transition-all duration-200 shadow",
                                    allSymptoms.length > 0
                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md transform hover:scale-[1.01]"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Symptoms...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Analyze{" "}
                                        {allSymptoms.length > 0 &&
                                            `(${allSymptoms.length})`}
                                    </>
                                )}
                            </Button>

                            {allSymptoms.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={clearAll}
                                    className="w-full py-2 rounded-lg border border-border hover:bg-accent hover:border-destructive/50 text-sm"
                                >
                                    Clear All Symptoms
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Footer */}
            <div className="text-center space-y-3 pb-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="p-1 bg-accent rounded">
                        <Shield className="h-3 w-3 text-accent-foreground" />
                    </div>
                    <span className="text-xs font-medium">
                        Your privacy is protected • HIPAA compliant
                    </span>
                </div>
            </div>
        </div>
    );
}
