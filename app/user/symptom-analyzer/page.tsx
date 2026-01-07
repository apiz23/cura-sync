"use client";

import {
    Loader2,
    AlertCircle,
    Sparkles,
    Check,
    Shield,
    Activity,
    RefreshCcw,
    X,
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

    const truncateSymptom = (symptom: string, maxLength: number = 30) => {
        if (symptom.length <= maxLength) return symptom;
        return symptom.substring(0, maxLength) + "...";
    };

    return (
        <div className="pt-8 pb-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8 pt-4">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="p-4 border-2 border-primary bg-primary/10 neo-shadow">
                            <Activity className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-foreground font-sans uppercase tracking-tight">
                                Symptom Checker
                            </h1>
                            <p className="text-muted-foreground font-sans">
                                AI-powered preliminary health assessment
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Alert - Neo-brutalism style */}
                {error && (
                    <div className="p-4 border-2 border-destructive bg-destructive/10 flex items-start gap-3 animate-in fade-in">
                        <div className="p-2 border-2 border-destructive bg-destructive/20 shrink-0">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground text-sm font-sans">
                                Attention Required
                            </p>
                            <p className="text-muted-foreground text-sm mt-0.5 font-sans">
                                {error}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="border-2 border-border hover:border-destructive"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Results Card - Neo-brutalism style */}
                {result && (
                    <Card className="border-2 border-border shadow-lg animate-in fade-in slide-in-from-bottom-4">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 border-2 border-primary bg-primary/10">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground font-sans">
                                                Analysis Result
                                            </h2>
                                            <p className="text-sm text-muted-foreground font-sans">
                                                Based on your provided symptoms
                                            </p>
                                        </div>
                                    </div>

                                    {/* Symptoms Display */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-muted-foreground font-sans uppercase tracking-wide">
                                            Selected Symptoms (
                                            {allSymptoms.length}):
                                        </p>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                            {allSymptoms.map(
                                                (symptom, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="bg-secondary text-secondary-foreground px-3 py-1.5 border-2 border-border text-sm font-sans"
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
                                    <div className="bg-card border-2 border-border p-5">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 font-sans">
                                            Possible Condition
                                        </h3>
                                        <p className="text-xl font-black text-foreground font-sans">
                                            {result.possible_disease}
                                        </p>
                                    </div>
                                    <div className="bg-card border-2 border-border p-5">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 font-sans">
                                            Confidence
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className="border-2 border-primary bg-primary/10 text-primary px-4 py-2 text-base font-bold font-sans"
                                        >
                                            {result.confidence_level}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="bg-card border-2 border-border p-5">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 font-sans">
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
                                                    className="flex items-start gap-4 p-4 border-2 border-border bg-muted/30"
                                                >
                                                    <div className="p-2 border-2 border-primary bg-primary mt-0.5 shrink-0">
                                                        <Check className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                    <span className="text-foreground text-sm leading-relaxed font-sans">
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
                                    className="w-full gap-2 border-2 border-border py-4 font-bold font-sans neo-button"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                    Check Another Condition
                                </Button>

                                {/* Disclaimer */}
                                <div className="p-5 border-2 border-border bg-muted/30">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 border-2 border-accent bg-accent shrink-0 mt-0.5">
                                            <Shield className="h-5 w-5 text-accent-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-bold text-foreground text-sm font-sans">
                                                Important Medical Disclaimer
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
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
                    <Card className="border-2 border-border shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            {/* Common Symptoms */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground font-sans uppercase tracking-wide">
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
                                <label className="text-sm font-bold text-foreground font-sans uppercase tracking-wide">
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
                                        className="resize-none border-2 border-border focus:border-primary p-4 text-sm transition-colors bg-input min-h-[100px] font-sans neo-input"
                                    />
                                    {textInput.length > 50 && (
                                        <p className="text-xs text-muted-foreground font-sans">
                                            {textInput.length} characters
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selected Symptoms Preview */}
                            {allSymptoms.length > 0 && (
                                <div className="p-4 border-2 border-border bg-primary/5">
                                    <p className="text-sm font-bold text-foreground mb-3 font-sans uppercase tracking-wide">
                                        Symptoms to analyze (
                                        {allSymptoms.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                                        {allSymptoms.map((symptom, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-background text-foreground px-3 py-1.5 border-2 border-border text-xs font-sans"
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
                                        "w-full py-6 text-lg gap-2 border-2 border-border font-bold font-sans neo-button",
                                        allSymptoms.length > 0
                                            ? "bg-primary hover:bg-primary/90"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="font-sans">
                                                Analyzing Symptoms...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5" />
                                            <span className="font-sans">
                                                Analyze Symptoms
                                                {allSymptoms.length > 0 &&
                                                    ` (${allSymptoms.length})`}
                                            </span>
                                        </>
                                    )}
                                </Button>

                                {allSymptoms.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={clearAll}
                                        className="w-full text-sm border-2 border-border font-bold font-sans neo-button"
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
                        <div className="p-2 border-2 border-primary bg-primary/10">
                            <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider font-sans">
                            Your privacy is protected • HIPAA compliant
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-sans">
                        Always consult a healthcare professional for medical
                        diagnosis. In case of emergency, contact emergency
                        services immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}
