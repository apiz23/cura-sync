"use client";

import {
	AlertCircle,
	AlertTriangle,
	Brain,
	Check,
	Clock,
	FileText,
	MapPin,
	HeartPulse,
	Hospital,
	Loader2,
	Shield,
	Sparkles,
	Stethoscope,
	User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AnimatedTags from "@/components/smoothui/animated-tags";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type AnalysisResult = {
	possible_disease: string;
	confidence_level: string;
	urgency: "emergency" | "high" | "medium" | "low" | "unknown";
	suggested_action: string;
	disclaimer?: string;
	normalized_symptoms?: string[];
};

type UserProfile = {
	full_name?: string | null;
	patient_profile?: {
		date_of_birth?: string | null;
		gender?: string | null;
		blood_type?: string | null;
		height_cm?: number | null;
		weight_kg?: number | null;
		allergies?: string | null;
		chronic_conditions?: string | null;
	} | null;
};

type PatientContext = {
	age?: number;
	date_of_birth?: string;
	gender?: string;
	blood_type?: string;
	height_cm?: number;
	weight_kg?: number;
	allergies?: string;
	chronic_conditions?: string;
};

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
	"Sneezing",
];

function urgencyLabel(urgency: AnalysisResult["urgency"]) {
	switch (urgency) {
		case "emergency":
			return "Immediate care";
		case "high":
			return "Prompt medical review";
		case "medium":
			return "Review soon";
		case "low":
			return "Monitor and follow up";
		default:
			return "Clinical judgment";
	}
}

function urgencyBadgeClass(urgency: AnalysisResult["urgency"]) {
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

export default function SymptomsCheckPage() {
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
	const [textInput, setTextInput] = useState("");
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

	useEffect(() => {
		let cancelled = false;

		const loadProfile = async () => {
			try {
				const res = await fetch("/api/user/profile");
				if (!res.ok) return;
				const data = (await res.json()) as UserProfile;
				if (!cancelled) {
					setProfile(data);
				}
			} catch (profileError) {
				console.error("Profile context fetch error:", profileError);
			}
		};

		void loadProfile();

		return () => {
			cancelled = true;
		};
	}, []);

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
		if (textInput.trim()) list.push(textInput.trim());
		return list;
	}, [selectedSymptoms, textInput]);

	const actions = useMemo(() => {
		if (!result?.suggested_action) return [];
		return result.suggested_action
			.split("\n")
			.map((line) => line.replace(/^[-*]\s*/, "").trim())
			.filter(Boolean);
	}, [result]);

	const patientContext = useMemo(() => {
		const patientProfile = profile?.patient_profile;
		if (!patientProfile) return null;

		const age = calculateAge(patientProfile.date_of_birth);
		const context: PatientContext = {};

		if (age !== null) context.age = age;
		if (patientProfile.date_of_birth) {
			context.date_of_birth = patientProfile.date_of_birth;
		}
		if (patientProfile.gender) context.gender = patientProfile.gender;
		if (patientProfile.blood_type) context.blood_type = patientProfile.blood_type;
		if (patientProfile.height_cm != null) context.height_cm = patientProfile.height_cm;
		if (patientProfile.weight_kg != null) context.weight_kg = patientProfile.weight_kg;
		if (patientProfile.allergies) context.allergies = patientProfile.allergies;
		if (patientProfile.chronic_conditions) {
			context.chronic_conditions = patientProfile.chronic_conditions;
		}

		return Object.keys(context).length > 0 ? context : null;
	}, [profile]);

	const patientContextItems = useMemo(() => {
		if (!patientContext) return [];

		return [
			patientContext.age ? `${patientContext.age} years old` : null,
			patientContext.gender ?? null,
			patientContext.blood_type ? `Blood type ${patientContext.blood_type}` : null,
			patientContext.height_cm ? `${patientContext.height_cm} cm` : null,
			patientContext.weight_kg ? `${patientContext.weight_kg} kg` : null,
			patientContext.allergies ? `Allergies: ${patientContext.allergies}` : null,
			patientContext.chronic_conditions
				? `Conditions: ${patientContext.chronic_conditions}`
				: null,
		].filter(Boolean) as string[];
	}, [patientContext]);

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
			setError("Please select or describe at least one symptom.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					symptoms: allSymptoms.join(", "),
					patient_context: patientContext,
				}),
			});

			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error || "Analysis failed");
			}

			const data = await res.json();
			setResult(data);
		} catch (err) {
			console.error(err);
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<UserPageShell>
			<UserPageHeader
				icon={Brain}
				title="AI Symptom Analyzer"
				description="Organize symptom details and review the summary with a qualified healthcare professional."
				align="center"
			/>

			<div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
				<Card className="border-2 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Stethoscope className="h-5 w-5 text-primary" />
							Symptom input
						</CardTitle>
						<CardDescription>
							Detailed descriptions may improve the analysis summary.
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
								placeholder="Describe duration, severity, or anything else that feels relevant..."
								rows={4}
								className="min-h-[120px] resize-none"
							/>
						</div>

						{patientContextItems.length ? (
							<div className="space-y-3 rounded-xl border bg-muted/30 p-4">
								<div className="flex items-center gap-2">
									<HeartPulse className="h-4 w-4 text-primary" />
									<h3 className="text-sm font-semibold">
										Profile context included
									</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{patientContextItems.map((item) => (
										<Badge key={item} variant="outline">
											{item}
										</Badge>
									))}
								</div>
								<p className="text-xs text-muted-foreground">
									The analyzer will include your saved health profile details
									when generating the summary.
								</p>
							</div>
						) : null}

						{allSymptoms.length > 0 ? (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="text-sm font-semibold">Ready to analyze</h4>
									<Button variant="ghost" size="sm" onClick={clearAll}>
										Clear all
									</Button>
								</div>
								<div className="flex flex-wrap gap-2 rounded-lg bg-muted/40 p-3">
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

				<Card className="border-2 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Safety information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
							If you have chest pain, severe breathing difficulty, severe bleeding,
							or loss of consciousness, seek urgent medical care now.
						</div>
						<p>This tool is informational and does not provide a diagnosis.</p>
						<p>Use the summary to help explain symptoms during a clinical visit.</p>
					</CardContent>
				</Card>
			</div>

			{result ? (
				<Card className="mt-6 border-2 shadow-sm">
					<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle className="text-2xl">Analysis summary</CardTitle>
							<CardDescription>
								Review this information with a healthcare professional if you need
								medical advice.
							</CardDescription>
						</div>
						<Badge className={urgencyBadgeClass(result.urgency)}>
							{result.urgency.toUpperCase()}
						</Badge>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-xl border bg-muted/40 p-4">
								<p className="text-sm font-semibold text-muted-foreground">
									Possible condition
								</p>
								<p className="mt-2 text-2xl font-semibold text-primary">
									{result.possible_disease}
								</p>
							</div>
							<div className="rounded-xl border bg-muted/40 p-4">
								<p className="text-sm font-semibold text-muted-foreground">
									Suggested timeline
								</p>
								<div className="mt-2 flex items-center gap-2">
									<Clock className="h-4 w-4 text-primary" />
									<p className="font-medium">{urgencyLabel(result.urgency)}</p>
								</div>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-xl border bg-muted/40 p-4">
								<p className="text-sm font-semibold text-muted-foreground">
									Assessment confidence
								</p>
								<p className="mt-2 text-lg font-medium capitalize">
									{result.confidence_level}
								</p>
							</div>
							<div className="rounded-xl border bg-muted/40 p-4">
								<p className="text-sm font-semibold text-muted-foreground">
									Recommended follow-up
								</p>
								<div className="mt-2 flex items-center gap-2">
									<User className="h-4 w-4 text-primary" />
									<p className="text-sm text-muted-foreground">
										Consult a qualified healthcare professional.
									</p>
								</div>
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

						<div className="space-y-3">
							<h3 className="flex items-center gap-2 text-lg font-semibold">
								<AlertTriangle className="h-5 w-5 text-primary" />
								Recommended actions
							</h3>
							<div className="space-y-3">
								{actions.map((line, index) => (
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
									Recommended registered care nearby
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
														<p className="font-semibold">{facility.name}</p>
														{facility.type ? (
															<Badge variant="secondary">{facility.type}</Badge>
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
														<Link href={`/user/appointments/${facility.id}`}>
															Book now
														</Link>
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						) : null}
					</CardContent>
				</Card>
			) : null}
		</UserPageShell>
	);
}

function calculateAge(dateOfBirth?: string | null) {
	if (!dateOfBirth) return null;

	const birthDate = new Date(dateOfBirth);
	if (Number.isNaN(birthDate.getTime())) return null;

	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const hasHadBirthdayThisYear =
		today.getMonth() > birthDate.getMonth() ||
		(today.getMonth() === birthDate.getMonth() &&
			today.getDate() >= birthDate.getDate());

	if (!hasHadBirthdayThisYear) {
		age -= 1;
	}

	return age >= 0 ? age : null;
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
