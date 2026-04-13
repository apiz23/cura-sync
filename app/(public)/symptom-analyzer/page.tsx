"use client";

import {
	AlertCircle,
	AlertTriangle,
	Brain,
	Check,
	Clock,
	FileText,
	Hospital,
	Loader2,
	MapPin,
	Shield,
	Sparkles,
	Stethoscope,
	Thermometer,
	User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnalysisResult } from "@/app/types";
import AnimatedTags from "@/components/smoothui/animated-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const COMMON_SYMPTOMS = [
	"Fever",
	"Cough",
	"Headache",
	"Sore Throat",
	"Fatigue",
	"Chest Pain",
	"Dizziness",
	"Runny Nose",
	"Nausea",
	"Shortness of Breath",
	"Muscle Aches",
	"Loss of Taste",
	"Loss of Smell",
	"Abdominal Pain",
];

type Facility = {
	id: string;
	name: string;
	type?: string | null;
	specialty?: string | null;
	address: string;
	latitude?: string | null;
	longitude?: string | null;
};

type Coordinates = {
	latitude: number;
	longitude: number;
};

function urgencyColor(urgency: AnalysisResult["urgency"]) {
	switch (urgency) {
		case "emergency":
			return "bg-red-600 text-white";
		case "high":
			return "bg-red-500 text-white";
		case "medium":
			return "bg-amber-500 text-white";
		case "low":
			return "bg-emerald-500 text-white";
		default:
			return "bg-muted text-foreground";
	}
}

function urgencyTimeline(urgency: AnalysisResult["urgency"]) {
	switch (urgency) {
		case "emergency":
			return "Immediate care";
		case "high":
			return "As soon as possible";
		case "medium":
			return "Within 2 to 3 days";
		case "low":
			return "Monitor and follow up as needed";
		default:
			return "Use clinical judgment";
	}
}

export default function AnalyzePage() {
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
	const [textInput, setTextInput] = useState("");
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

	useEffect(() => {
		let cancelled = false;

		const loadFacilities = async () => {
			try {
				const res = await fetch("/api/facilities");
				if (!res.ok) return;
				const data = (await res.json()) as Facility[];
				if (!cancelled) {
					setFacilities(Array.isArray(data) ? data : []);
				}
			} catch (facilityError) {
				console.error("Facility suggestion fetch error:", facilityError);
			}
		};

		void loadFacilities();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !("geolocation" in navigator)) return;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserLocation({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
			},
			() => {
				setUserLocation(null);
			},
			{ enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
		);
	}, []);

	const allSymptoms = useMemo(() => {
		const list = [...selectedSymptoms];
		if (textInput.trim()) {
			list.push(textInput.trim());
		}
		return list;
	}, [selectedSymptoms, textInput]);

	const actionLines = useMemo(() => {
		if (!result?.suggested_action) return [];
		return result.suggested_action
			.split("\n")
			.map((line) => line.replace(/^[-*]\s*/, "").trim())
			.filter(Boolean);
	}, [result]);

	const recommendedFacilities = useMemo(() => {
		const sorted = [...facilities].sort((left, right) => {
			const leftDistance = distanceFromUser(left, userLocation);
			const rightDistance = distanceFromUser(right, userLocation);

			if (leftDistance !== null && rightDistance !== null) {
				return leftDistance - rightDistance;
			}
			if (leftDistance !== null) return -1;
			if (rightDistance !== null) return 1;
			return left.name.localeCompare(right.name);
		});

		return sorted.slice(0, 3).map((facility) => ({
			...facility,
			distanceKm: distanceFromUser(facility, userLocation),
		}));
	}, [facilities, userLocation]);

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

	const handleAnalyze = async () => {
		if (allSymptoms.length === 0) {
			toast.warning("No symptoms selected", {
				description: "Please select or describe your symptoms first.",
			});
			return;
		}

		setLoading(true);
		setError(null);

		const analyzePromise = fetch("/api/public/analyze", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ symptoms: allSymptoms.join(", ") }),
		})
			.then(async (res) => {
				if (!res.ok) {
					const err = await res.json().catch(() => null);
					throw new Error(err?.error || "Analysis failed");
				}
				return res.json();
			})
			.then((data: AnalysisResult) => {
				setResult(data);
				return data;
			});

		toast.promise(analyzePromise, {
			loading: "Analyzing your symptoms...",
			success: "Analysis completed successfully",
			error: (err) => err.message,
		});

		try {
			await analyzePromise;
		} catch (err) {
			console.error(err);
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background px-4 pb-12 pt-20 md:px-6">
			<div className="mx-auto max-w-5xl space-y-8">
				<div className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
						<Stethoscope className="h-8 w-8" />
					</div>
					<h1 className="text-4xl font-bold text-primary md:text-5xl">
						CuraSync Symptom Analyzer
					</h1>
					<p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
						AI-powered symptom insights to help organize what you are feeling before
						you speak with a clinician.
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<Badge variant="secondary">AI-assisted review</Badge>
						<Badge variant="secondary">Privacy-conscious design</Badge>
						<Badge variant="secondary">Informational guidance only</Badge>
					</div>
				</div>

				{result ? (
					<div className="space-y-6">
						<Card className="border shadow-sm">
							<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle className="flex items-center gap-2 text-2xl">
										<Sparkles className="h-6 w-6 text-primary" />
										Analysis complete
									</CardTitle>
									<CardDescription>
										Review this summary with a qualified healthcare professional if you
										need medical advice.
									</CardDescription>
								</div>
								<Badge className={urgencyColor(result.urgency)}>
									{result.urgency.toUpperCase()}
								</Badge>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-4 md:grid-cols-2">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">Possible condition</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-2xl font-semibold text-primary">
												{result.possible_disease}
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle className="text-base">Suggested timeline</CardTitle>
										</CardHeader>
										<CardContent className="flex items-center gap-3">
											<Clock className="h-5 w-5 text-primary" />
											<p className="font-medium">{urgencyTimeline(result.urgency)}</p>
										</CardContent>
									</Card>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="rounded-xl border bg-muted/40 p-4">
										<div className="mb-2 flex items-center gap-2 text-sm font-semibold">
											<Thermometer className="h-4 w-4 text-primary" />
											Assessment confidence
										</div>
										<p className="text-lg font-medium capitalize">
											{result.confidence_level}
										</p>
									</div>
									<div className="rounded-xl border bg-muted/40 p-4">
										<div className="mb-2 flex items-center gap-2 text-sm font-semibold">
											<User className="h-4 w-4 text-primary" />
											Recommended follow-up
										</div>
										<p className="text-sm text-muted-foreground">
											Consult a qualified healthcare professional for diagnosis and
											treatment decisions.
										</p>
									</div>
								</div>

								{result.normalized_symptoms?.length ? (
									<div className="space-y-3">
										<h3 className="text-sm font-semibold">Recognized symptoms</h3>
										<div className="flex flex-wrap gap-2">
											{result.normalized_symptoms.map((symptom) => (
												<Badge key={symptom} variant="outline">
													{symptom}
												</Badge>
											))}
										</div>
									</div>
								) : null}

								<Separator />

								<div className="space-y-3">
									<h3 className="flex items-center gap-2 text-lg font-semibold">
										<AlertTriangle className="h-5 w-5 text-primary" />
										Recommended actions
									</h3>
									<div className="space-y-3">
										{actionLines.map((line, index) => (
											<div
												key={`${line}-${index}`}
												className="flex items-start gap-3 rounded-lg bg-muted p-3"
											>
												<div className="mt-0.5 rounded-full bg-primary/10 p-1">
													<Check className="h-3 w-3 text-primary" />
												</div>
												<span className="text-sm leading-relaxed">{line}</span>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-xl border bg-accent p-4">
									<div className="flex items-start gap-3">
										<Shield className="mt-0.5 h-5 w-5 text-primary" />
										<div>
											<p className="font-semibold">Medical disclaimer</p>
											<p className="mt-1 text-sm text-muted-foreground">
												{result.disclaimer ||
													"This analysis is for informational purposes only and does not replace professional medical advice."}
											</p>
										</div>
									</div>
								</div>

								{recommendedFacilities.length ? (
									<div className="space-y-4">
										<h3 className="flex items-center gap-2 text-lg font-semibold">
											<Hospital className="h-5 w-5 text-primary" />
											Registered care options nearby
										</h3>
										<div className="grid gap-3">
											{recommendedFacilities.map((facility) => (
												<div
													key={facility.id}
													className="rounded-xl border bg-muted/30 p-4"
												>
													<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
														<div className="space-y-2">
															<div className="flex flex-wrap items-center gap-2">
																<p className="font-semibold">
																	{facility.name}
																</p>
																{facility.type ? (
																	<Badge variant="secondary">
																		{facility.type}
																	</Badge>
																) : null}
																{facility.distanceKm !== null ? (
																	<Badge variant="outline">
																		{facility.distanceKm.toFixed(1)} km away
																	</Badge>
																) : null}
															</div>
															<p className="text-sm text-muted-foreground">
																{facility.specialty || "General care"}
															</p>
															<div className="flex items-start gap-2 text-sm text-muted-foreground">
																<MapPin className="mt-0.5 h-4 w-4 text-primary" />
																<span>{facility.address}</span>
															</div>
														</div>
														<div className="flex flex-wrap gap-2">
															<Button asChild variant="outline" size="sm">
																<a
																	href={mapHref(facility)}
																	target="_blank"
																	rel="noreferrer"
																>
																	Open map
																</a>
															</Button>
															<Button asChild size="sm">
																<Link href="/sign-in">
																	Sign in to book
																</Link>
															</Button>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								) : null}

								<Button onClick={clearAll} variant="outline" className="w-full">
									Start a new analysis
								</Button>
							</CardContent>
						</Card>
					</div>
				) : (
					<div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
						<Card className="border shadow-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Brain className="h-5 w-5 text-primary" />
									Symptom input
								</CardTitle>
								<CardDescription>
									Select symptoms or describe them in your own words. Detailed
									descriptions may improve the analysis.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-3">
									<h3 className="text-sm font-semibold">Common symptoms</h3>
									<AnimatedTags
										initialTags={COMMON_SYMPTOMS}
										onChange={handleTagChange}
										selectedTags={selectedSymptoms}
										className="w-full"
									/>
								</div>

								<div className="space-y-3">
									<label className="text-sm font-semibold">Additional details</label>
									<Textarea
										value={textInput}
										onChange={(e) => setTextInput(e.target.value)}
										placeholder="Describe duration, severity, or any other details..."
										rows={4}
										className="min-h-[120px] resize-none"
									/>
								</div>

								{allSymptoms.length > 0 ? (
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<h3 className="text-sm font-semibold">Ready to analyze</h3>
											<Button variant="ghost" size="sm" onClick={clearAll}>
												Clear all
											</Button>
										</div>
										<div className="flex flex-wrap gap-2 rounded-lg bg-muted p-3">
											{allSymptoms.map((symptom, index) => (
												<Badge key={`${symptom}-${index}`} variant="secondary">
													{symptom}
												</Badge>
											))}
										</div>
									</div>
								) : null}

								{error ? (
									<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
										<div className="flex items-center gap-2 font-medium">
											<AlertCircle className="h-4 w-4" />
											{error}
										</div>
									</div>
								) : null}

								<Button
									onClick={handleAnalyze}
									disabled={loading || allSymptoms.length === 0}
									className="h-12 w-full"
								>
									{loading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Analyzing symptoms...
										</>
									) : (
										<>
											<Sparkles className="mr-2 h-4 w-4" />
											Analyze with AI
										</>
									)}
								</Button>
							</CardContent>
						</Card>

						<Card className="border shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Important notes
						</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-muted-foreground">
								<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
									If you have chest pain, severe breathing difficulty, severe bleeding,
									or loss of consciousness, seek urgent medical care now.
								</div>
								<p>
									Public demo access is limited to 3 analyses per hour per device/IP.
								</p>
								<p>
									This tool is designed to help organize symptom information. It does
									not provide a diagnosis.
								</p>
								<p>
									Bring this summary to a clinician if you need help explaining what
									you have been experiencing.
								</p>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}

function distanceFromUser(facility: Facility, userLocation: Coordinates | null) {
	if (!userLocation || !facility.latitude || !facility.longitude) return null;

	const latitude = Number(facility.latitude);
	const longitude = Number(facility.longitude);

	if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

	return haversineKm(
		userLocation.latitude,
		userLocation.longitude,
		latitude,
		longitude,
	);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
	const toRad = (value: number) => (value * Math.PI) / 180;
	const earthRadiusKm = 6371;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapHref(facility: Facility) {
	if (facility.latitude && facility.longitude) {
		return `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`;
	}

	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`;
}
