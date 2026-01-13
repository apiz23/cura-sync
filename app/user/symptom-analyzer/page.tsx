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
    Search,
    Brain,
    Stethoscope,
    HeartPulse,
    ChevronRight,
    AlertTriangle,
    Info,
    Clock,
    Thermometer,
    FileText,
    ArrowRight,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import AnimatedTags from "@/components/smoothui/animated-tags";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [activeTab, setActiveTab] = useState("symptoms");

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
        setActiveTab("symptoms");
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
            setError("Please select or describe at least one symptom.");
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
            setActiveTab("results");
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getConfidencePercentage = (level: string) => {
        const levels: Record<string, number> = {
            High: 85,
            Moderate: 60,
            Low: 40,
            "Very Low": 20,
        };
        return levels[level] || 50;
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 mb-4">
                        <div className="p-3 rounded-xl bg-primary/20">
                            <Brain className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
                        AI Symptom Analyzer
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Get instant AI-powered insights about your symptoms and
                        recommended next steps
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Panel - Progress & Info */}
                    <div className="space-y-6">
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Analysis Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">
                                            Symptom Input
                                        </span>
                                        <span
                                            className={cn(
                                                "font-bold",
                                                allSymptoms.length > 0
                                                    ? "text-green-600"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {allSymptoms.length} symptoms added
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(
                                            allSymptoms.length * 20,
                                            100
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">
                                            AI Analysis
                                        </span>
                                        <span
                                            className={cn(
                                                "font-bold",
                                                result
                                                    ? "text-green-600"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {result ? "Complete" : "Pending"}
                                        </span>
                                    </div>
                                    <Progress value={result ? 100 : 0} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Safety Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-800 dark:text-amber-300">
                                        <span className="font-bold">
                                            Emergency Warning:
                                        </span>{" "}
                                        If experiencing chest pain, difficulty
                                        breathing, or severe bleeding, seek
                                        immediate medical attention.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        This AI tool is for informational
                                        purposes only and does not replace
                                        professional medical advice.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Center Panel - Main Content */}
                    <div className="lg:col-span-2">
                        <Card className="border-2 shadow-lg">
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">
                                            Symptom Analysis
                                        </CardTitle>
                                        <CardDescription>
                                            Select your symptoms and get
                                            AI-powered insights
                                        </CardDescription>
                                    </div>
                                    {allSymptoms.length > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="gap-2"
                                        >
                                            <span className="font-bold">
                                                {allSymptoms.length}
                                            </span>
                                            Symptoms
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <CardContent className="pt-6">
                                    <TabsList className="grid grid-cols-2 mb-6">
                                        <TabsTrigger
                                            value="symptoms"
                                            className="gap-2"
                                        >
                                            <Search className="h-4 w-4" />
                                            Enter Symptoms
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="results"
                                            disabled={!result}
                                            className="gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Analysis Results
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="symptoms"
                                        className="space-y-6"
                                    >
                                        {/* Error Alert */}
                                        {error && (
                                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                                    <div>
                                                        <p className="font-medium text-destructive">
                                                            {error}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setError(null)
                                                        }
                                                        className="ml-auto h-8 w-8 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Symptoms Selection */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">
                                                    Select Symptoms
                                                </h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {selectedSymptoms.length} of{" "}
                                                    {commonSymptoms.length}{" "}
                                                    selected
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
                                            <label className="text-sm font-semibold flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4" />
                                                Additional Details
                                            </label>
                                            <Textarea
                                                value={textInput}
                                                onChange={(e) =>
                                                    setTextInput(e.target.value)
                                                }
                                                placeholder="Describe specific pains, duration, severity, or any other relevant information..."
                                                rows={4}
                                                className="min-h-[120px] resize-none border-2"
                                            />
                                            {textInput && (
                                                <p className="text-xs text-muted-foreground text-right">
                                                    {textInput.length}{" "}
                                                    characters
                                                </p>
                                            )}
                                        </div>

                                        {/* Selected Symptoms Preview */}
                                        {allSymptoms.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold">
                                                        Selected Symptoms
                                                    </h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearAll}
                                                        className="h-8 text-xs"
                                                    >
                                                        Clear All
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
                                                    {allSymptoms.map(
                                                        (symptom, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="gap-1.5 px-3 py-1.5"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                                {symptom}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Analyze Button */}
                                        <div className="space-y-3 pt-4">
                                            <Button
                                                onClick={handleAnalyze}
                                                disabled={
                                                    loading ||
                                                    allSymptoms.length === 0
                                                }
                                                size="lg"
                                                className="w-full h-14 text-base gap-3"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        Analyzing with AI...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-5 w-5" />
                                                        {allSymptoms.length >
                                                        0 ? (
                                                            <>
                                                                Analyze{" "}
                                                                {
                                                                    allSymptoms.length
                                                                }{" "}
                                                                Symptoms
                                                                <ArrowRight className="h-4 w-4 ml-2" />
                                                            </>
                                                        ) : (
                                                            "Select Symptoms to Begin"
                                                        )}
                                                    </>
                                                )}
                                            </Button>
                                            {allSymptoms.length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center">
                                                    Select at least one symptom
                                                    to begin analysis
                                                </p>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="results"
                                        className="space-y-6 animate-in fade-in"
                                    >
                                        {result && (
                                            <>
                                                {/* Result Header */}
                                                <div className="p-6 rounded-xl bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                        <div className="p-3 rounded-lg bg-primary/20">
                                                            <Sparkles className="h-8 w-8 text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-2xl font-bold">
                                                                Analysis
                                                                Complete
                                                            </h3>
                                                            <p className="text-muted-foreground">
                                                                Based on your{" "}
                                                                {
                                                                    allSymptoms.length
                                                                }{" "}
                                                                reported
                                                                symptoms
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-base px-4 py-2"
                                                        >
                                                            {new Date().toLocaleDateString()}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Diagnosis Section */}
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <HeartPulse className="h-5 w-5 text-primary" />
                                                                Possible
                                                                Condition
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-3xl font-bold text-primary mb-2">
                                                                {
                                                                    result.possible_disease
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                AI-powered
                                                                preliminary
                                                                diagnosis
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Thermometer className="h-5 w-5 text-primary" />
                                                                Confidence Level
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span>
                                                                        AI
                                                                        Confidence
                                                                    </span>
                                                                    <span className="font-bold">
                                                                        {
                                                                            result.confidence_level
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={getConfidencePercentage(
                                                                        result.confidence_level
                                                                    )}
                                                                />
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    result.confidence_level ===
                                                                    "High"
                                                                        ? "default"
                                                                        : "secondary"
                                                                }
                                                                className="w-fit"
                                                            >
                                                                {result.confidence_level ===
                                                                "High"
                                                                    ? "High Reliability"
                                                                    : "Seek Professional Advice"}
                                                            </Badge>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Recommended Actions */}
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Check className="h-5 w-5 text-primary" />
                                                            Recommended Actions
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-3">
                                                            {result.suggested_action
                                                                .split("\n")
                                                                .filter(
                                                                    (line) =>
                                                                        line
                                                                            .trim()
                                                                            .startsWith(
                                                                                "-"
                                                                            )
                                                                )
                                                                .map(
                                                                    (
                                                                        line,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                                        >
                                                                            <div className="p-1.5 rounded-md bg-primary/10 mt-0.5">
                                                                                <ChevronRight className="h-4 w-4 text-primary" />
                                                                            </div>
                                                                            <span className="text-sm">
                                                                                {line
                                                                                    .replace(
                                                                                        /^-/,
                                                                                        ""
                                                                                    )
                                                                                    .trim()}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <Button
                                                        onClick={clearAll}
                                                        variant="outline"
                                                        className="flex-1 gap-2"
                                                    >
                                                        <RefreshCcw className="h-4 w-4" />
                                                        Analyze New Symptoms
                                                    </Button>
                                                    <Button className="flex-1 gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        Schedule Doctor Visit
                                                    </Button>
                                                </div>

                                                {/* Disclaimer */}
                                                <div className="p-4 rounded-lg bg-muted/50 border">
                                                    <div className="flex items-start gap-3">
                                                        <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium mb-1">
                                                                Important
                                                                Disclaimer
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                This analysis is
                                                                generated by AI
                                                                and is for
                                                                informational
                                                                purposes only.
                                                                It is not a
                                                                substitute for
                                                                professional
                                                                medical advice,
                                                                diagnosis, or
                                                                treatment.
                                                                Always seek the
                                                                advice of your
                                                                physician or
                                                                other qualified
                                                                health provider
                                                                with any
                                                                questions you
                                                                may have
                                                                regarding a
                                                                medical
                                                                condition.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
