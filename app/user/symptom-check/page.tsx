"use client";

import { useState } from "react";
import {
    Loader2,
    Sparkles,
    Check,
    AlertCircle,
    RefreshCcw,
    Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnalysisResult {
    possible_disease: string;
    confidence_level: string;
    suggested_action: string;
}

const COMMON_SYMPTOMS = [
    "Fever",
    "Cough",
    "Headache",
    "Sore Throat",
    "Fatigue",
    "Chest Pain",
    "Dizziness",
    "Nausea",
    "Shortness of Breath",
    "Muscle Aches",
];

export default function SymptomsCheckPage() {
    const [selected, setSelected] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleSymptom = (symptom: string) => {
        setSelected((prev) =>
            prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleAnalyze = async () => {
        // Combine selected chips and text input
        const customSymptoms = customInput
            .split(/[.,]/)
            .map((s) => s.trim())
            .filter(Boolean);
        const allSymptoms = [...selected, ...customSymptoms];

        if (allSymptoms.length === 0) {
            setError("Please enter at least one symptom.");
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
            setResult(await res.json());
        } catch (err) {
            console.error(err);
            setError("Failed to analyze symptoms. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setSelected([]);
        setCustomInput("");
        setError(null);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            {/* Minimal Header */}
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Activity className="w-8 h-8 text-primary" />
                    Symptom Checker
                </h1>
                <p className="text-muted-foreground">
                    AI-powered preliminary health assessment
                </p>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {result ? (
                /* Result View */
                <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="text-2xl text-primary">
                            Analysis Result
                        </CardTitle>
                        <CardDescription>
                            Based on your provided symptoms
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Possible Condition
                                </span>
                                <p className="text-xl font-bold">
                                    {result.possible_disease}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Confidence
                                </span>
                                <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                    {result.confidence_level}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Recommended Actions
                            </span>
                            <div className="text-sm space-y-2">
                                {result.suggested_action.split("\n").map(
                                    (line, i) =>
                                        line.trim() && (
                                            <div
                                                key={i}
                                                className="flex gap-2 items-start"
                                            >
                                                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                <span>
                                                    {line.replace(/^-\s*/, "")}
                                                </span>
                                            </div>
                                        )
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={reset}
                            variant="outline"
                            className="w-full gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" /> Check Another
                            Condition
                        </Button>

                        <p className="text-xs text-center text-muted-foreground pt-2">
                            Disclaimer: This is AI-generated advice. Consult a
                            doctor for medical diagnosis.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                /* Input View */
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                Common Symptoms
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_SYMPTOMS.map((symptom) => (
                                    <Badge
                                        key={symptom}
                                        variant={
                                            selected.includes(symptom)
                                                ? "default"
                                                : "outline"
                                        }
                                        className={cn(
                                            "cursor-pointer px-3 py-1.5 text-sm hover:bg-primary/90 transition-all select-none",
                                            !selected.includes(symptom) &&
                                                "hover:bg-muted text-muted-foreground font-normal"
                                        )}
                                        onClick={() => toggleSymptom(symptom)}
                                    >
                                        {symptom}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                Other Details
                            </label>
                            <Textarea
                                placeholder="Describe specific pains, duration, or other symptoms..."
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                className="min-h-[100px] resize-none"
                            />
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            disabled={
                                loading ||
                                (selected.length === 0 && !customInput.trim())
                            }
                            className="w-full gap-2 py-6 text-lg"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                            Analyze Symptoms
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
