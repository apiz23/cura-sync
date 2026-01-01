"use client";

import {
    Loader2,
    AlertCircle,
    Sparkles,
    Check,
    Shield,
    Activity,
    RefreshCcw,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AnimatedTags from "@/components/smoothui/animated-tags";

interface AnalysisResult {
    possible_disease: string;
    confidence_level: string;
    suggested_action: string;
}

export default function SymptomsCheckPage() {
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

    // Wrapper to handle tag changes and reset results
    const handleTagChange = useCallback(
        (items: string[]) => {
            setSelectedSymptoms(items);
            if (result) {
                setResult(null);
                setError(null);
            }
        },
        [result]
    );

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

    // Function to truncate long symptom text for display
    const truncateSymptom = (symptom: string, maxLength: number = 30) => {
        if (symptom.length <= maxLength) return symptom;
        return symptom.substring(0, maxLength) + "...";
    };

    return (
        <div className="min-h-screen bg-background pt-8 pb-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8 pt-4">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Activity className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-foreground">
                                Symptom Checker
                            </h1>
                            <p className="text-muted-foreground">
                                AI-powered preliminary health assessment
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex items-start gap-3 animate-in fade-in">
                        <div className="p-1.5 bg-destructive/20 rounded-lg shrink-0 mt-0.5">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">
                                Attention Required
                            </p>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                {error}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </Button>
                    </div>
                )}

                {/* Results Card */}
                {result && (
                    <Card className="border-border shadow-lg animate-in fade-in slide-in-from-bottom-4">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">
                                                Analysis Result
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Based on your provided symptoms
                                            </p>
                                        </div>
                                    </div>

                                    {/* Symptoms Display */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Selected Symptoms (
                                            {allSymptoms.length}):
                                        </p>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                            {allSymptoms.map(
                                                (symptom, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm"
                                                        title={symptom}
                                                    >
                                                        <span className="truncate">
                                                            {truncateSymptom(
                                                                symptom,
                                                                25
                                                            )}
                                                        </span>
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-card border border-border p-4 rounded-xl">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Possible Condition
                                        </h3>
                                        <p className="text-lg font-bold text-foreground">
                                            {result.possible_disease}
                                        </p>
                                    </div>
                                    <div className="bg-card border border-border p-4 rounded-xl">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Confidence
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className="bg-blue-50 text-blue-700 border-blue-200 text-base py-1"
                                        >
                                            {result.confidence_level}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="bg-card border border-border p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
                                                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                                                >
                                                    <div className="p-1 bg-primary rounded-full mt-0.5 shrink-0">
                                                        <Check className="h-3 w-3 text-primary-foreground" />
                                                    </div>
                                                    <span className="text-foreground text-sm leading-relaxed">
                                                        {line
                                                            .replace(/^-/, "")
                                                            .trim()}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={clearAll}
                                    variant="outline"
                                    className="w-full gap-2"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Check Another Condition
                                </Button>

                                {/* Disclaimer */}
                                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-accent rounded-lg shrink-0 mt-0.5">
                                            <Shield className="h-4 w-4 text-accent-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground text-sm">
                                                Important Medical Disclaimer
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                This AI analysis is for
                                                informational purposes only and
                                                is not a substitute for
                                                professional medical advice.
                                                Always consult with a qualified
                                                healthcare provider for proper
                                                diagnosis and treatment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Input Section - Only show when no result */}
                {!result && (
                    <Card className="border-border shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            {/* Common Symptoms - Now using AnimatedTags */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Common Symptoms
                                    </label>
                                    <div className="w-full">
                                        <AnimatedTags
                                            initialTags={commonSymptoms}
                                            onChange={handleTagChange}
                                            selectedTags={selectedSymptoms}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    Other Details
                                </label>
                                <div className="space-y-2">
                                    <Textarea
                                        value={textInput}
                                        onChange={(e) =>
                                            setTextInput(e.target.value)
                                        }
                                        placeholder="Describe specific pains, duration, or other symptoms..."
                                        rows={3}
                                        className="resize-none border border-border focus:border-primary rounded-lg p-3 text-sm transition-colors bg-input min-h-[100px]"
                                    />
                                    {textInput.length > 50 && (
                                        <p className="text-xs text-muted-foreground">
                                            {textInput.length} characters
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selected Symptoms Preview */}
                            {allSymptoms.length > 0 && (
                                <div className="p-3 bg-primary/5 rounded-lg border border-border">
                                    <p className="text-sm font-medium text-foreground mb-2">
                                        Symptoms to analyze (
                                        {allSymptoms.length}
                                        ):
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                                        {allSymptoms.map((symptom, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-background text-foreground px-2 py-1 rounded-full text-xs"
                                            >
                                                <span className="truncate">
                                                    {truncateSymptom(
                                                        symptom,
                                                        20
                                                    )}
                                                </span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="space-y-3">
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={
                                        loading || allSymptoms.length === 0
                                    }
                                    className={cn(
                                        "w-full py-6 text-lg gap-2",
                                        allSymptoms.length > 0
                                            ? "bg-primary hover:bg-primary/90"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Analyzing Symptoms...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5" />
                                            Analyze Symptoms
                                            {allSymptoms.length > 0 &&
                                                ` (${allSymptoms.length})`}
                                        </>
                                    )}
                                </Button>

                                {allSymptoms.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={clearAll}
                                        className="w-full text-sm"
                                    >
                                        Clear All Symptoms
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="text-center space-y-3 pt-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="p-1 bg-primary/10 rounded">
                            <Shield className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-medium">
                            Your privacy is protected • HIPAA compliant
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Always consult a healthcare professional for medical
                        diagnosis. In case of emergency, contact emergency
                        services immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}
