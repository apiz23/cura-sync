"use client";

import {
    FileText,
    Loader2,
    Stethoscope,
    AlertCircle,
    Sparkles,
    Check,
    Shield,
    Plus,
    X,
} from "lucide-react";
import { useState, useCallback, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnalysisResult, analyzeSymptoms } from "./action";

const COMMON_SYMPTOMS = [
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
] as const;

export default function AnalyzeClient() {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [textInput, setTextInput] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const allSymptoms = useMemo(() => {
        const symptoms = [...selectedSymptoms];
        if (textInput.trim()) {
            symptoms.push(textInput.trim());
        }
        return symptoms;
    }, [selectedSymptoms, textInput]);

    const toggleSymptom = useCallback((symptom: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom]
        );
        setResult(null);
        setError(null);
    }, []);

    const clearAll = useCallback(() => {
        setSelectedSymptoms([]);
        setTextInput("");
        setResult(null);
        setError(null);
    }, []);

    const handleAnalyze = useCallback(() => {
        if (allSymptoms.length === 0) {
            setError("Please select or describe your symptoms first.");
            return;
        }

        setError(null);

        startTransition(async () => {
            try {
                const response = await analyzeSymptoms(allSymptoms.join(", "));

                if (!response.success) {
                    setError(
                        response.error ||
                            "Analysis failed. Please try again later."
                    );
                    return;
                }

                if (response.data) {
                    setResult(response.data);
                }
            } catch (err) {
                console.error("Analysis error:", err);
                setError(
                    "An unexpected error occurred. Please check your connection and try again."
                );
            }
        });
    }, [allSymptoms]);

    return (
        <div className="min-h-screen bg-background pt-20 pb-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8 pt-8">
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-primary rounded-3xl shadow-lg">
                            <Stethoscope className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold text-foreground">
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
                    <Card className="border-border shadow-lg animate-in fade-in duration-500">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-accent rounded-lg">
                                            <Sparkles className="h-6 w-6 text-accent-foreground" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">
                                            Analysis Complete
                                        </h2>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {allSymptoms.map((symptom, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                                            >
                                                {symptom}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={clearAll}
                                    className="border-border hover:bg-accent"
                                >
                                    New Analysis
                                </Button>
                            </div>

                            <div className="grid gap-6">
                                <div className="bg-card border border-border p-6 rounded-2xl">
                                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Possible Condition
                                    </h3>
                                    <p className="text-2xl font-bold text-foreground">
                                        {result.possible_disease}
                                    </p>
                                </div>

                                <div className="bg-card border border-border p-6 rounded-2xl">
                                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Confidence Level
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                        <p className="text-xl font-semibold text-foreground">
                                            {result.confidence_level}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-card border border-border p-6 rounded-2xl">
                                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Stethoscope className="h-4 w-4 text-primary" />
                                        Recommended Actions
                                    </h3>
                                    <div className="space-y-3">
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
                                                    <div className="p-1 bg-primary rounded-full mt-1 flex-shrink-0">
                                                        <Check className="h-3 w-3 text-primary-foreground" />
                                                    </div>
                                                    <span className="text-foreground leading-relaxed">
                                                        {line
                                                            .replace(/^-/, "")
                                                            .trim()}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-muted rounded-2xl border border-border">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-accent rounded-lg flex-shrink-0">
                                        <Shield className="h-5 w-5 text-accent-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-semibold text-foreground">
                                            Important Medical Disclaimer
                                        </p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            This AI analysis is for
                                            informational purposes only and is
                                            not a substitute for professional
                                            medical advice. Always consult with
                                            a qualified healthcare provider for
                                            proper diagnosis and treatment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="p-6 bg-destructive/10 rounded-2xl border border-destructive/20 flex items-center gap-4 shadow-lg animate-in fade-in duration-300">
                        <div className="p-2 bg-destructive/20 rounded-lg flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">
                                Attention Required
                            </p>
                            <p className="text-muted-foreground mt-1">
                                {error}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="flex-shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Input Section */}
                {!result && (
                    <Card className="border-border shadow-lg">
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent rounded-lg">
                                        <FileText className="h-5 w-5 text-accent-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground">
                                            Select Your Symptoms
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Click to add or remove symptoms
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {COMMON_SYMPTOMS.map((symptom) => {
                                        const isSelected =
                                            selectedSymptoms.includes(symptom);
                                        return (
                                            <Button
                                                key={symptom}
                                                type="button"
                                                variant={
                                                    isSelected
                                                        ? "default"
                                                        : "outline"
                                                }
                                                disabled={isPending}
                                                className={cn(
                                                    "rounded-full transition-all duration-200 border-2",
                                                    isSelected
                                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary shadow-lg scale-105"
                                                        : "border-border hover:border-primary/50 hover:bg-accent"
                                                )}
                                                onClick={() =>
                                                    toggleSymptom(symptom)
                                                }
                                            >
                                                {isSelected ? (
                                                    <X className="h-4 w-4 mr-2" />
                                                ) : (
                                                    <Plus className="h-4 w-4 mr-2" />
                                                )}
                                                {symptom}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-foreground flex items-center gap-2">
                                    <span className="p-1 bg-accent rounded">
                                        <FileText className="h-4 w-4 text-accent-foreground" />
                                    </span>
                                    Additional Details
                                    <span className="text-sm text-muted-foreground font-normal">
                                        (Optional)
                                    </span>
                                </h3>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) =>
                                        setTextInput(e.target.value)
                                    }
                                    disabled={isPending}
                                    placeholder="Describe other symptoms, severity, duration, or any specific concerns..."
                                    rows={4}
                                    className="resize-none border-2 border-border focus:border-primary rounded-xl p-4 text-lg transition-colors bg-input"
                                />
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={
                                        isPending || allSymptoms.length === 0
                                    }
                                    className={cn(
                                        "w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg",
                                        allSymptoms.length > 0
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl transform hover:scale-[1.02]"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            Analyzing Symptoms...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-3 h-5 w-5" />
                                            Analyze
                                            {allSymptoms.length > 0 &&
                                                `(${allSymptoms.length} symptom${allSymptoms.length !== 1 ? "s" : ""})`}
                                        </>
                                    )}
                                </Button>

                                {allSymptoms.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={clearAll}
                                        disabled={isPending}
                                        className="w-full py-3 rounded-xl border-2 border-border hover:bg-accent hover:border-destructive/50"
                                    >
                                        Clear All Symptoms
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}