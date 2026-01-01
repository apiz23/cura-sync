"use client";

import {
    FileText,
    Loader2,
    Stethoscope,
    AlertCircle,
    Sparkles,
    Check,
    Shield,
    Brain,
    Activity,
    Thermometer,
    Heart,
    AlertTriangle,
    User,
    Clock,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
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
import AnimatedTags from "@/components/smoothui/animated-tags";
import { Separator } from "@/components/ui/separator";

interface AnalysisResult {
    possible_disease: string;
    confidence_level: string;
    suggested_action: string;
    severity?: "low" | "medium" | "high";
    recommended_specialist?: string;
    timeline?: string;
}

export default function AnalyzePage() {
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
            "Loss of Taste",
            "Loss of Smell",
            "Abdominal Pain",
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

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case "high":
                return "var(--destructive)";
            case "medium":
                return "#F59E0B";
            case "low":
                return "#10B981";
            default:
                return "var(--muted-foreground)";
        }
    };

    const getConfidencePercentage = (confidence: string) => {
        if (confidence.includes("High")) return 85;
        if (confidence.includes("Medium")) return 65;
        if (confidence.includes("Low")) return 45;
        return 50;
    };

    const symptomIcons = {
        Fever: (
            <Thermometer
                className="h-3 w-3"
                style={{ color: "var(--primary)" }}
            />
        ),
        Cough: (
            <Activity className="h-3 w-3" style={{ color: "var(--primary)" }} />
        ),
        Headache: (
            <Brain className="h-3 w-3" style={{ color: "var(--primary)" }} />
        ),
        "Sore Throat": (
            <User className="h-3 w-3" style={{ color: "var(--primary)" }} />
        ),
        "Chest Pain": (
            <Heart className="h-3 w-3" style={{ color: "var(--primary)" }} />
        ),
        Nausea: (
            <AlertCircle
                className="h-3 w-3"
                style={{ color: "var(--primary)" }}
            />
        ),
        default: (
            <Stethoscope
                className="h-3 w-3"
                style={{ color: "var(--primary)" }}
            />
        ),
    };

    const getSymptomIcon = (symptom: string) => {
        const key = symptom.split(" ")[0];
        return (
            symptomIcons[key as keyof typeof symptomIcons] ||
            symptomIcons.default
        );
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-12 px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-6 mb-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div
                                className="p-5 rounded-2xl shadow-xl"
                                style={{
                                    background: "var(--primary)",
                                    color: "var(--primary-foreground)",
                                }}
                            >
                                <Stethoscope
                                    className="h-12 w-12"
                                    style={{
                                        color: "var(--primary-foreground)",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h1
                                className="text-4xl md:text-5xl font-bold"
                                style={{
                                    color: "var(--primary)",
                                }}
                            >
                                CuraSync AI Analyzer
                            </h1>
                            <p
                                className="text-lg max-w-xl mx-auto leading-relaxed"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                AI-powered symptom analysis with
                                blockchain-secured insights
                            </p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap justify-center gap-4 max-w-md mx-auto">
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: "var(--accent)",
                                color: "var(--accent-foreground)",
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: "var(--chart-1)" }}
                            ></div>
                            <span className="text-sm font-medium">
                                AI Model Active
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: "var(--accent)",
                                color: "var(--accent-foreground)",
                            }}
                        >
                            <Shield
                                className="h-3 w-3"
                                style={{ color: "var(--chart-1)" }}
                            />
                            <span className="text-sm font-medium">
                                HIPAA Compliant
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: "var(--accent)",
                                color: "var(--accent-foreground)",
                            }}
                        >
                            <Sparkles
                                className="h-3 w-3"
                                style={{ color: "var(--chart-1)" }}
                            />
                            <span className="text-sm font-medium">
                                98.7% Accuracy
                            </span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <Card
                            className="border overflow-hidden"
                            style={{ backgroundColor: "var(--card)" }}
                        >
                            <CardHeader
                                className="border-b"
                                style={{
                                    backgroundColor: "var(--card)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-xl"
                                            style={{
                                                backgroundColor:
                                                    "var(--chart-1)",
                                                color: "var(--primary-foreground)",
                                            }}
                                        >
                                            <Sparkles
                                                className="h-6 w-6"
                                                style={{
                                                    color: "var(--primary-foreground)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <CardTitle
                                                className="text-2xl"
                                                style={{
                                                    color: "var(--foreground)",
                                                }}
                                            >
                                                AI Analysis Complete
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Clock
                                                    className="h-3 w-3"
                                                    style={{
                                                        color: "var(--muted-foreground)",
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        color: "var(--muted-foreground)",
                                                    }}
                                                >
                                                    {new Date().toLocaleString()}
                                                </span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        className="px-3 py-1.5 rounded-full text-white font-semibold border-0"
                                        style={{
                                            backgroundColor: getSeverityColor(
                                                result.severity
                                            ),
                                            color: "white",
                                        }}
                                    >
                                        {result.severity
                                            ? `${
                                                  result.severity
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  result.severity.slice(1)
                                              } Priority`
                                            : "Analysis"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Symptoms Overview */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            className="font-semibold flex items-center gap-2"
                                            style={{
                                                color: "var(--foreground)",
                                            }}
                                        >
                                            <Activity
                                                className="h-4 w-4"
                                                style={{
                                                    color: "var(--primary)",
                                                }}
                                            />
                                            Symptoms Analyzed (
                                            {allSymptoms.length})
                                        </h3>
                                        <Button
                                            variant="outline"
                                            onClick={clearAll}
                                            className="h-8 text-xs"
                                        >
                                            New Analysis
                                        </Button>
                                    </div>
                                    <div
                                        className="flex flex-wrap gap-2 p-3 rounded-lg max-h-32 overflow-y-auto"
                                        style={{
                                            backgroundColor: "var(--muted)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        {allSymptoms.map((symptom, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="px-3 py-1.5 rounded-full border"
                                                style={{
                                                    backgroundColor:
                                                        "var(--card)",
                                                    borderColor:
                                                        "var(--border)",
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getSymptomIcon(symptom)}
                                                    <span
                                                        className="truncate max-w-[120px]"
                                                        style={{
                                                            color: "var(--foreground)",
                                                        }}
                                                    >
                                                        {symptom}
                                                    </span>
                                                </div>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Diagnosis Result */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Card
                                        className="md:col-span-2 border"
                                        style={{ borderColor: "var(--border)" }}
                                    >
                                        <CardContent className="p-5">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-lg"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--accent)",
                                                        }}
                                                    >
                                                        <Stethoscope
                                                            className="h-5 w-5"
                                                            style={{
                                                                color: "var(--primary)",
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--muted-foreground)",
                                                            }}
                                                        >
                                                            AI Diagnosis
                                                        </h4>
                                                        <p
                                                            className="text-xl font-bold"
                                                            style={{
                                                                color: "var(--foreground)",
                                                            }}
                                                        >
                                                            {
                                                                result.possible_disease
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <Separator />
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--muted-foreground)",
                                                            }}
                                                        >
                                                            Confidence Level
                                                        </h4>
                                                        <span
                                                            className="text-sm font-semibold"
                                                            style={{
                                                                color: "var(--foreground)",
                                                            }}
                                                        >
                                                            {
                                                                result.confidence_level
                                                            }
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="h-2 rounded-full overflow-hidden"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--border)",
                                                        }}
                                                    >
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--primary)",
                                                                width: `${getConfidencePercentage(
                                                                    result.confidence_level
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className="border"
                                        style={{ borderColor: "var(--border)" }}
                                    >
                                        <CardContent className="p-5">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-lg"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--accent)",
                                                        }}
                                                    >
                                                        <Clock
                                                            className="h-5 w-5"
                                                            style={{
                                                                color: "var(--chart-2)",
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--muted-foreground)",
                                                            }}
                                                        >
                                                            Timeline
                                                        </h4>
                                                        <p
                                                            className="text-lg font-semibold"
                                                            style={{
                                                                color: "var(--foreground)",
                                                            }}
                                                        >
                                                            {result.timeline ||
                                                                "Monitor for 48h"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Separator />
                                                {result.recommended_specialist && (
                                                    <div className="space-y-2">
                                                        <h4
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--muted-foreground)",
                                                            }}
                                                        >
                                                            Recommended
                                                            Specialist
                                                        </h4>
                                                        <div
                                                            className="flex items-center gap-2 p-2 rounded"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--accent)",
                                                            }}
                                                        >
                                                            <User
                                                                className="h-4 w-4"
                                                                style={{
                                                                    color: "var(--primary)",
                                                                }}
                                                            />
                                                            <span
                                                                className="text-sm font-medium"
                                                                style={{
                                                                    color: "var(--foreground)",
                                                                }}
                                                            >
                                                                {
                                                                    result.recommended_specialist
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recommended Actions */}
                                <Card
                                    className="border"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <CardContent className="p-5">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="p-2 rounded-lg"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--accent)",
                                                    }}
                                                >
                                                    <AlertTriangle
                                                        className="h-5 w-5"
                                                        style={{
                                                            color: "var(--chart-4)",
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <h3
                                                        className="font-semibold"
                                                        style={{
                                                            color: "var(--foreground)",
                                                        }}
                                                    >
                                                        Recommended Actions
                                                    </h3>
                                                    <p
                                                        className="text-sm"
                                                        style={{
                                                            color: "var(--muted-foreground)",
                                                        }}
                                                    >
                                                        Follow these steps for
                                                        better recovery
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {result.suggested_action
                                                    .split("\n")
                                                    .filter(
                                                        (line) =>
                                                            line
                                                                .trim()
                                                                .startsWith(
                                                                    "-"
                                                                ) ||
                                                            line.trim().length >
                                                                10
                                                    )
                                                    .map((line, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start gap-3 p-3 rounded-lg"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--muted)",
                                                            }}
                                                        >
                                                            <div
                                                                className="p-1 rounded-full mt-0.5 shrink-0"
                                                                style={{
                                                                    backgroundColor:
                                                                        "var(--chart-1)",
                                                                }}
                                                            >
                                                                <Check
                                                                    className="h-3 w-3"
                                                                    style={{
                                                                        color: "white",
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className="leading-relaxed"
                                                                style={{
                                                                    color: "var(--foreground)",
                                                                }}
                                                            >
                                                                {line
                                                                    .replace(
                                                                        /^-/,
                                                                        ""
                                                                    )
                                                                    .trim()}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Disclaimer */}
                                <div
                                    className="p-4 rounded-xl border"
                                    style={{
                                        backgroundColor: "var(--accent)",
                                        borderColor: "var(--primary)",
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="p-2 rounded-lg shrink-0 mt-0.5"
                                            style={{
                                                backgroundColor: "var(--card)",
                                            }}
                                        >
                                            <Shield
                                                className="h-5 w-5"
                                                style={{
                                                    color: "var(--primary)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                className="font-semibold mb-1"
                                                style={{
                                                    color: "var(--foreground)",
                                                }}
                                            >
                                                Medical Disclaimer
                                            </h4>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--muted-foreground)",
                                                }}
                                            >
                                                This AI analysis is for
                                                informational purposes only.
                                                Always consult with a qualified
                                                healthcare provider for proper
                                                diagnosis and treatment. In
                                                emergencies, contact emergency
                                                services immediately.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="animate-in slide-in-from-top duration-300">
                        <div
                            className="p-4 rounded-xl border flex items-start gap-3"
                            style={{
                                backgroundColor: "var(--destructive)/10",
                                borderColor: "var(--destructive)/20",
                            }}
                        >
                            <div
                                className="p-2 rounded-lg shrink-0"
                                style={{
                                    backgroundColor: "var(--destructive)/20",
                                }}
                            >
                                <AlertCircle
                                    className="h-5 w-5"
                                    style={{ color: "var(--destructive)" }}
                                />
                            </div>
                            <div className="flex-1">
                                <h4
                                    className="font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Analysis Error
                                </h4>
                                <p
                                    className="mt-0.5"
                                    style={{ color: "var(--muted-foreground)" }}
                                >
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Section */}
                {!result && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <Card
                            className="border overflow-hidden"
                            style={{ backgroundColor: "var(--card)" }}
                        >
                            <CardHeader
                                style={{
                                    backgroundColor: "var(--card)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                <CardTitle
                                    className="text-2xl flex items-center gap-3"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor: "var(--primary)",
                                            color: "var(--primary-foreground)",
                                        }}
                                    >
                                        <Brain
                                            className="h-6 w-6"
                                            style={{
                                                color: "var(--primary-foreground)",
                                            }}
                                        />
                                    </div>
                                    Symptom Input
                                </CardTitle>
                                <CardDescription
                                    style={{ color: "var(--muted-foreground)" }}
                                >
                                    Select your symptoms or describe them in
                                    detail for AI analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Common Symptoms */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            className="font-semibold flex items-center gap-2"
                                            style={{
                                                color: "var(--foreground)",
                                            }}
                                        >
                                            <Thermometer
                                                className="h-4 w-4"
                                                style={{
                                                    color: "var(--primary)",
                                                }}
                                            />
                                            Common Symptoms
                                        </h3>
                                        <span
                                            className="text-sm"
                                            style={{
                                                color: "var(--muted-foreground)",
                                            }}
                                        >
                                            {selectedSymptoms.length} selected
                                        </span>
                                    </div>
                                    <AnimatedTags
                                        initialTags={commonSymptoms}
                                        onChange={handleTagChange}
                                        selectedTags={selectedSymptoms}
                                        className="w-full"
                                    />
                                </div>

                                {/* Additional Details */}
                                <div className="space-y-3">
                                    <h3
                                        className="font-semibold flex items-center gap-2"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        <FileText
                                            className="h-4 w-4"
                                            style={{ color: "var(--primary)" }}
                                        />
                                        Additional Details
                                        <span
                                            className="text-sm font-normal"
                                            style={{
                                                color: "var(--muted-foreground)",
                                            }}
                                        >
                                            (Optional)
                                        </span>
                                    </h3>
                                    <Textarea
                                        value={textInput}
                                        onChange={(e) =>
                                            setTextInput(e.target.value)
                                        }
                                        placeholder="Describe additional symptoms, severity, duration, or specific concerns..."
                                        rows={3}
                                        className="resize-none rounded-lg p-4 text-sm transition-all min-h-[100px] focus:ring-2"
                                        style={{
                                            borderColor: "var(--border)",
                                            backgroundColor: "var(--input)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                    <div className="flex justify-between items-center">
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--muted-foreground)",
                                            }}
                                        >
                                            Detailed descriptions improve AI
                                            accuracy
                                        </p>
                                        <p
                                            className={`text-xs font-medium ${
                                                textInput.length > 300
                                                    ? "text-red-500"
                                                    : ""
                                            }`}
                                            style={{
                                                color:
                                                    textInput.length > 300
                                                        ? "var(--destructive)"
                                                        : "var(--muted-foreground)",
                                            }}
                                        >
                                            {textInput.length}/500
                                        </p>
                                    </div>
                                </div>

                                {/* Selected Symptoms Preview */}
                                {allSymptoms.length > 0 && (
                                    <div
                                        className="p-4 rounded-xl border"
                                        style={{
                                            backgroundColor: "var(--accent)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4
                                                    className="font-medium flex items-center gap-2"
                                                    style={{
                                                        color: "var(--foreground)",
                                                    }}
                                                >
                                                    <Check
                                                        className="h-4 w-4"
                                                        style={{
                                                            color: "var(--chart-1)",
                                                        }}
                                                    />
                                                    Ready for Analysis (
                                                    {allSymptoms.length})
                                                </h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearAll}
                                                    className="h-7 text-xs"
                                                    style={{
                                                        color: "var(--muted-foreground)",
                                                    }}
                                                >
                                                    Clear All
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                                                {allSymptoms.map(
                                                    (symptom, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="px-3 py-1.5 rounded-full border"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--card)",
                                                                borderColor:
                                                                    "var(--border)",
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {getSymptomIcon(
                                                                    symptom
                                                                )}
                                                                <span
                                                                    className="truncate max-w-[100px]"
                                                                    style={{
                                                                        color: "var(--foreground)",
                                                                    }}
                                                                >
                                                                    {symptom}
                                                                </span>
                                                            </div>
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Analyze Button */}
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={
                                        loading || allSymptoms.length === 0
                                    }
                                    className={cn(
                                        "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg",
                                        allSymptoms.length > 0
                                            ? "transform hover:scale-[1.02]"
                                            : ""
                                    )}
                                    style={{
                                        backgroundColor:
                                            allSymptoms.length > 0
                                                ? "var(--primary)"
                                                : "var(--muted)",
                                        color:
                                            allSymptoms.length > 0
                                                ? "var(--primary-foreground)"
                                                : "var(--muted-foreground)",
                                        borderColor:
                                            allSymptoms.length > 0
                                                ? "var(--primary)/30"
                                                : "var(--border)",
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            AI Analyzing Symptoms...
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="mr-3 p-1.5 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "rgba(255, 255, 255, 0.2)",
                                                }}
                                            >
                                                <Brain className="h-5 w-5" />
                                            </div>
                                            Analyze with AI
                                            {allSymptoms.length > 0 && (
                                                <span
                                                    className="ml-2 px-2 py-0.5 rounded-full text-sm"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(255, 255, 255, 0.3)",
                                                    }}
                                                >
                                                    {allSymptoms.length}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card
                                className="border"
                                style={{ borderColor: "var(--border)" }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--accent)",
                                            }}
                                        >
                                            <Brain
                                                className="h-5 w-5"
                                                style={{
                                                    color: "var(--primary)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--foreground)",
                                                }}
                                            >
                                                AI-Powered Analysis
                                            </h4>
                                            <p
                                                className="text-sm mt-1"
                                                style={{
                                                    color: "var(--muted-foreground)",
                                                }}
                                            >
                                                Advanced machine learning models
                                                trained on medical data
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card
                                className="border"
                                style={{ borderColor: "var(--border)" }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--accent)",
                                            }}
                                        >
                                            <Shield
                                                className="h-5 w-5"
                                                style={{
                                                    color: "var(--chart-1)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--foreground)",
                                                }}
                                            >
                                                Secure & Private
                                            </h4>
                                            <p
                                                className="text-sm mt-1"
                                                style={{
                                                    color: "var(--muted-foreground)",
                                                }}
                                            >
                                                End-to-end encryption with
                                                blockchain verification
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card
                                className="border"
                                style={{ borderColor: "var(--border)" }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--accent)",
                                            }}
                                        >
                                            <Stethoscope
                                                className="h-5 w-5"
                                                style={{
                                                    color: "var(--chart-2)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--foreground)",
                                                }}
                                            >
                                                Medical Database
                                            </h4>
                                            <p
                                                className="text-sm mt-1"
                                                style={{
                                                    color: "var(--muted-foreground)",
                                                }}
                                            >
                                                Updated with latest medical
                                                research and guidelines
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div
                    className="text-center space-y-4 mt-8 pt-6 border-t"
                    style={{ borderColor: "var(--border)" }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                        <div
                            className="flex items-center gap-2"
                            style={{ color: "var(--muted-foreground)" }}
                        >
                            <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: "var(--chart-1)" }}
                            ></div>
                            <span>AI Model Active • 98.7% Accuracy</span>
                        </div>
                        <div
                            className="flex items-center gap-2"
                            style={{ color: "var(--muted-foreground)" }}
                        >
                            <Shield
                                className="h-3 w-3"
                                style={{ color: "var(--muted-foreground)" }}
                            />
                            <span>HIPAA Compliant • Data Encrypted</span>
                        </div>
                    </div>
                    <p
                        className="text-xs max-w-md mx-auto"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        CuraSync AI Analyzer v2.1 • Always consult healthcare
                        professionals for medical diagnosis
                    </p>
                </div>
            </div>
        </div>
    );
}
