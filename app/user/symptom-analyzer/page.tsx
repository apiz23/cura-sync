"use client";

import {
	AlertCircle,
	AlertTriangle,
	Activity,
	BadgeCheck,
	Brain,
	Check,
	Clock,
	FileText,
	HeartPulse,
	Hospital,
	Loader2,
	MapPin,
	Microscope,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	Stethoscope,
	ThumbsDown,
	ThumbsUp,
	User as UserIcon,
	X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import type { HealthSyncSnapshot } from "@/components/patient-health-view";
import AnimatedTags from "@/components/smoothui/animated-tags";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EASE } from "@/hooks/use-motion-config";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type AnalysisResult = {
	possible_disease: string;
	confidence_level: string;
	urgency: "emergency" | "high" | "medium" | "low" | "unknown";
	suggested_action: string;
	disclaimer?: string;
	normalized_symptoms?: string[];
	source?: string;
	iot_flags?: string[];
};

type SymptomHistoryItem = {
	id: string;
	symptoms_text: string;
	possible_disease: string | null;
	confidence_level: string | null;
	urgency: AnalysisResult["urgency"];
	suggested_action: string | null;
	source: string | null;
	normalized_symptoms: string[];
	iot_flags: string[];
	created_at: string;
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

type IoTData = {
	heart_rate_bpm?: number;
	sleep_hours?: number;
	steps_today?: number;
	spo2_percent?: number;
};

type HealthSyncResponse = {
	success: boolean;
	data?: {
		latest: HealthSyncSnapshot | null;
		recent: HealthSyncSnapshot[];
		count: number;
	};
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

function finiteNumber(value: unknown) {
	const parsed =
		typeof value === "number"
			? value
			: typeof value === "string" && value.trim()
				? Number(value)
				: NaN;

	return Number.isFinite(parsed) ? parsed : undefined;
}

// ── Constants ────────────────────────────────────────────────────────────────

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

function dedupeSymptoms(items: string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const raw of items) {
		const trimmed = raw.trim();
		if (!trimmed) continue;
		const key = trimmed.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(trimmed);
	}
	return result;
}

const ANALYSIS_STEPS = [
	{
		label: "Urgency check",
		description: "Screening for urgent warning signs.",
		icon: ShieldCheck,
	},
	{
		label: "Vitals review",
		description: "Includes recent wearable data when available.",
		icon: HeartPulse,
	},
	{
		label: "Pattern matching",
		description: "Comparing with known medical conditions.",
		icon: FileText,
	},
	{
		label: "Symptom analysis",
		description: "Identifying key symptoms from your description.",
		icon: Microscope,
	},
	{
		label: "Care summary",
		description: "Generating your personalised results.",
		icon: Brain,
	},
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function urgencyConfig(urgency: AnalysisResult["urgency"]) {
	switch (urgency) {
		case "emergency":
			return {
				label: "Emergency",
				timeline: "Seek immediate care",
				filled: 4,
				barColor: "bg-destructive",
				badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
			};
		case "high":
			return {
				label: "High urgency",
				timeline: "As soon as possible",
				filled: 3,
				barColor: "bg-chart-5",
				badgeClass: "bg-chart-5/10 text-chart-5 border-chart-5/30 dark:text-chart-5",
			};
		case "medium":
			return {
				label: "Medium urgency",
				timeline: "Within 2 to 3 days",
				filled: 2,
				barColor: "bg-chart-5",
				badgeClass: "bg-chart-5/10 text-chart-5 border-chart-5/30 dark:text-chart-5",
			};
		case "low":
			return {
				label: "Low urgency",
				timeline: "Monitor and follow up",
				filled: 1,
				barColor: "bg-primary",
				badgeClass: "bg-primary/10 text-primary border-primary/20",
			};
		default:
			return {
				label: "Unknown",
				timeline: "Use clinical judgment",
				filled: 0,
				barColor: "bg-muted-foreground",
				badgeClass: "bg-muted text-muted-foreground border-border",
			};
	}
}

function sourceLabel(
	source: string | undefined,
): { label: string; className: string } | null {
	switch (source) {
		case "jamai_structured":
			return {
				label: "JamAI",
				className: "bg-primary/10 text-primary border-primary/20",
			};
		case "biobert_enhanced_ai":
			return {
				label: "JamAI + BioBERT",
				className: "bg-primary/10 text-primary border-primary/20",
			};
		case "knowledge_base":
			return {
				label: "Knowledge Base",
				className: "bg-chart-4/10 text-chart-4 border-chart-4/30",
			};
		case "iot_safety":
			return {
				label: "IoT Alert",
				className: "bg-destructive/10 text-destructive border-destructive/20",
			};
		case "rule_based_safety":
			return {
				label: "Rule-based",
				className: "bg-chart-5/10 text-chart-5 border-chart-5/30 dark:text-chart-5",
			};
		case "fallback":
			return {
				label: "Fallback",
				className: "bg-muted text-muted-foreground border-border",
			};
		default:
			return null;
	}
}

function calculateAge(dateOfBirth?: string | null) {
	if (!dateOfBirth) return null;
	const birthDate = new Date(dateOfBirth);
	if (Number.isNaN(birthDate.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const hadBirthday =
		today.getMonth() > birthDate.getMonth() ||
		(today.getMonth() === birthDate.getMonth() &&
			today.getDate() >= birthDate.getDate());
	if (!hadBirthday) age -= 1;
	return age >= 0 ? age : null;
}

function distanceFromUser(
	facility: Facility,
	userLocation: Coordinates | null,
) {
	if (!userLocation || !facility.latitude || !facility.longitude) return null;
	const lat = Number(facility.latitude);
	const lon = Number(facility.longitude);
	if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
	return haversineKm(userLocation.latitude, userLocation.longitude, lat, lon);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
	const toRad = (v: number) => (v * Math.PI) / 180;
	const R = 6371;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapHref(facility: Facility) {
	if (facility.latitude && facility.longitude) {
		return `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`;
	}
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function UrgencySeverityBar({
	urgency,
}: {
	urgency: AnalysisResult["urgency"];
}) {
	const { filled, barColor, label } = urgencyConfig(urgency);
	return (
		<div
			className="flex gap-1.5"
			role="progressbar"
			aria-label={`Urgency severity: ${label}`}
			aria-valuemin={0}
			aria-valuemax={4}
			aria-valuenow={filled}
			aria-valuetext={`${label} (${filled} of 4)`}
		>
			{Array.from({ length: 4 }, (_, i) => (
				<motion.div
					key={i}
					aria-hidden="true"
					className={cn(
						"h-1.5 flex-1 rounded-sm",
						i < filled ? barColor : "bg-muted",
					)}
					initial={{ scaleX: 0, opacity: 0 }}
					animate={{ scaleX: 1, opacity: 1 }}
					transition={{
						duration: 0.35,
						delay: 0.15 + i * 0.06,
						ease: EASE,
					}}
					style={{ originX: 0 }}
				/>
			))}
		</div>
	);
}

function DataPill({
	icon: Icon,
	label,
	value,
	tone = "neutral",
}: {
	icon: typeof Activity;
	label: string;
	value: string;
	tone?: "neutral" | "primary" | "danger";
}) {
	return (
		<div
			className={cn(
				"min-w-0 rounded-lg border px-3 py-2",
				tone === "primary" && "border-primary/20 bg-primary/5 text-primary",
				tone === "danger" && "border-destructive/20 bg-destructive/5 text-destructive",
				tone === "neutral" && "border-border/70 bg-card",
			)}
		>
			<div className="flex items-center gap-2 text-muted-foreground">
				<Icon className="h-3.5 w-3.5 shrink-0" />
				<span className="truncate text-xs font-medium">{label}</span>
			</div>
			<p className="mt-1 truncate font-mono text-sm font-semibold text-foreground">
				{value}
			</p>
		</div>
	);
}

function AnalysisProgressPanel() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.35, ease: EASE }}
			className="rounded-xl border border-primary/15 bg-primary/5 p-4"
		>
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<p className="text-sm font-semibold text-foreground">
						Analyzing health data
					</p>
					<p className="text-xs text-muted-foreground">
						Checking your symptoms against medical data.
					</p>
				</div>
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
			</div>
			<div className="grid gap-0 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border/70">
				{ANALYSIS_STEPS.map((step, index) => (
					<motion.div
						key={step.label}
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, delay: index * 0.08, ease: EASE }}
						className="py-2 sm:px-3 first:pl-0 last:pr-0"
					>
						<div className="mb-1 flex items-center gap-2">
							<step.icon className="h-3 w-3 shrink-0 text-primary" />
							<span className="font-mono text-[10px] text-muted-foreground">
								0{index + 1}
							</span>
						</div>
						<p className="text-xs font-semibold leading-tight text-foreground">
							{step.label}
						</p>
						<p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
							{step.description}
						</p>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

// ── Animation helpers ────────────────────────────────────────────────────────

function stagger(index: number) {
	return { duration: 0.35, delay: 0.08 + index * 0.06, ease: EASE };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SymptomsCheckPage() {
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
	const [textInput, setTextInput] = useState("");
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
	const [iotData, setIotData] = useState<IoTData | null>(null);
	const [feedbackGiven, setFeedbackGiven] = useState(false);
	const [feedbackSent, setFeedbackSent] = useState(false);
	const [historyItems, setHistoryItems] = useState<SymptomHistoryItem[]>([]);
	const [historyLoading, setHistoryLoading] = useState(true);
	const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
	const analyzeAbortRef = useRef<AbortController | null>(null);
	const resultRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/user/profile");
				if (!res.ok) return;
				const data = (await res.json()) as UserProfile;
				if (!cancelled) setProfile(data);
			} catch (e) {
				console.error("Profile fetch error:", e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/user/symptom-history?limit=20", {
					cache: "no-store",
				});
				if (!res.ok) return;
				const json = (await res.json().catch(() => null)) as
					| { success?: boolean; data?: { items?: SymptomHistoryItem[] } }
					| null;
				if (!cancelled) setHistoryItems(json?.data?.items ?? []);
			} catch (e) {
				console.error("History fetch error:", e);
			} finally {
				if (!cancelled) setHistoryLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/facilities");
				if (!res.ok) return;
				const data = (await res.json()) as Facility[];
				if (!cancelled) setFacilities(Array.isArray(data) ? data : []);
			} catch (e) {
				console.error("Facility fetch error:", e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/user/health-sync?days=7", {
					cache: "no-store",
				});
				if (!res.ok) return;
				const data = (await res.json().catch(() => null)) as
					| HealthSyncResponse
					| null;
				const recent = data?.data?.recent ?? [];
				const latest =
					data?.data?.latest ??
					recent.find((snapshot) => snapshot.summary) ??
					null;
				if (cancelled || !latest?.summary) return;

				const iot: IoTData = {};
				const heartRate = finiteNumber(latest.summary.averageHeartRateBpm);
				const sleepMinutes = finiteNumber(latest.summary.totalSleepMinutes);
				const steps = finiteNumber(latest.summary.stepsCount);
				const spo2 = finiteNumber(latest.summary.averageSpo2Percent);

				if (heartRate !== undefined) {
					iot.heart_rate_bpm = heartRate;
				}
				if (sleepMinutes !== undefined && sleepMinutes > 0) {
					iot.sleep_hours = parseFloat((sleepMinutes / 60).toFixed(1));
				}
				if (steps !== undefined && steps > 0) {
					iot.steps_today = Math.trunc(steps);
				}
				if (spo2 !== undefined && spo2 > 0) {
					iot.spo2_percent = spo2;
				}
				if (Object.keys(iot).length > 0) setIotData(iot);
			} catch {
				// optional — silent fail
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !("geolocation" in navigator)) return;
		navigator.geolocation.getCurrentPosition(
			(pos) =>
				setUserLocation({
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
				}),
			() => setUserLocation(null),
			{ enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
		);
	}, []);

	const allSymptoms = useMemo(() => {
		const list = [...selectedSymptoms];
		if (textInput.trim()) list.push(textInput.trim());
		return dedupeSymptoms(list);
	}, [selectedSymptoms, textInput]);

	const actionLines = useMemo(() => {
		if (!result?.suggested_action) return [];
		return result.suggested_action
			.split("\n")
			.map((line) => line.replace(/^[-*]\s*/, "").trim())
			.filter(Boolean);
	}, [result]);

	const patientContext = useMemo(() => {
		const p = profile?.patient_profile;
		if (!p) return null;
		const age = calculateAge(p.date_of_birth);
		const ctx: PatientContext = {};
		if (age !== null) ctx.age = age;
		if (p.date_of_birth) ctx.date_of_birth = p.date_of_birth;
		if (p.gender) ctx.gender = p.gender;
		if (p.blood_type) ctx.blood_type = p.blood_type;
		if (p.height_cm != null) ctx.height_cm = p.height_cm;
		if (p.weight_kg != null) ctx.weight_kg = p.weight_kg;
		if (p.allergies) ctx.allergies = p.allergies;
		if (p.chronic_conditions) ctx.chronic_conditions = p.chronic_conditions;
		return Object.keys(ctx).length > 0 ? ctx : null;
	}, [profile]);

	const patientContextItems = useMemo(() => {
		if (!patientContext) return [];
		return [
			patientContext.age ? `${patientContext.age} yrs` : null,
			patientContext.gender ?? null,
			patientContext.blood_type ? `Blood ${patientContext.blood_type}` : null,
			patientContext.allergies ? `Allergy: ${patientContext.allergies}` : null,
			patientContext.chronic_conditions
				? `Cond: ${patientContext.chronic_conditions}`
				: null,
		].filter(Boolean) as string[];
	}, [patientContext]);

	const iotSummaryItems = useMemo(() => {
		if (!iotData) return [];
		return [
			iotData.heart_rate_bpm != null
				? `HR ${Math.round(iotData.heart_rate_bpm)} bpm`
				: null,
			iotData.spo2_percent != null
				? `SpO₂ ${Math.round(iotData.spo2_percent)}%`
				: null,
			iotData.sleep_hours != null
				? `Sleep ${iotData.sleep_hours.toFixed(1)} h`
				: null,
			iotData.steps_today != null
				? `${iotData.steps_today.toLocaleString()} steps`
				: null,
		].filter(Boolean) as string[];
	}, [iotData]);

	const recommendedFacilities = useMemo(() => {
		const sorted = [...facilities].sort((a, b) => {
			const da = distanceFromUser(a, userLocation);
			const db = distanceFromUser(b, userLocation);
			if (da !== null && db !== null) return da - db;
			if (da !== null) return -1;
			if (db !== null) return 1;
			return a.name.localeCompare(b.name);
		});
		return sorted.slice(0, 3).map((f) => ({
			...f,
			distanceKm: distanceFromUser(f, userLocation),
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
		setFeedbackGiven(false);
		setFeedbackSent(false);
	}, []);

	const handleFeedback = useCallback(
		async (wasAccurate: boolean) => {
			if (!result || feedbackGiven) return;
			try {
				const res = await fetch("/api/feedback", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						symptoms: allSymptoms.join(", "),
						was_accurate: wasAccurate,
						possible_disease: result.possible_disease,
						source: result.source,
					}),
				});
				if (!res.ok) throw new Error("Feedback failed");
				setFeedbackGiven(true);
				setFeedbackSent(true);
			} catch {
				toast.error("Could not send feedback", {
					description: "Try again in a moment.",
				});
			}
		},
		[result, feedbackGiven, allSymptoms],
	);

	const scrollToResult = useCallback(() => {
		resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	const handleAnalyze = async () => {
		if (allSymptoms.length === 0) {
			toast.warning("No symptoms selected", {
				description: "Pick or describe at least one symptom first.",
			});
			return;
		}

		analyzeAbortRef.current?.abort();
		const controller = new AbortController();
		analyzeAbortRef.current = controller;

		setLoading(true);
		setError(null);

		const analyzePromise = fetch("/api/analyze", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				symptoms: allSymptoms.join(", "),
				patient_context: patientContext,
				...(iotData ? { iot_data: iotData } : {}),
			}),
			signal: controller.signal,
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
				setTimeout(scrollToResult, 120);
				return data;
			});

		toast.promise(analyzePromise, {
			loading: "Analyzing your symptoms...",
			success: "Analysis complete",
			error: (err: Error) => err.message,
		});

		try {
			await analyzePromise;
		} catch (err) {
			if (err instanceof Error && err.name === "AbortError") return;
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.",
			);
		} finally {
			if (analyzeAbortRef.current === controller) {
				analyzeAbortRef.current = null;
			}
			setLoading(false);
		}
	};

	const cancelAnalyze = useCallback(() => {
		analyzeAbortRef.current?.abort();
		analyzeAbortRef.current = null;
		setLoading(false);
	}, []);

	const urgencyCfg = result ? urgencyConfig(result.urgency) : null;
	const sourceBadge = result ? sourceLabel(result.source) : null;

	return (
		<UserPageShell>
			<UserPageHeader
				sectionLabel="AI Health Assistant"
				title="Symptom Analyzer"
				description="Capture symptoms, saved profile context, and wearable readings in one review before you talk to a healthcare professional."
				meta={
					<span className="font-mono text-xs text-muted-foreground">
						{allSymptoms.length > 0
							? `${allSymptoms.length} symptom${allSymptoms.length > 1 ? "s" : ""} selected`
						: "Five-layer review pipeline"}
					</span>
				}
				actions={
					(selectedSymptoms.length > 0 || textInput || result) && (
						<Button
							variant="outline"
							size="sm"
							onClick={clearAll}
							className="gap-1.5"
						>
							<RefreshCw className="h-3.5 w-3.5" />
							Reset
						</Button>
					)
				}
			/>

			{/* Emergency banner */}
			<div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
				<div className="flex items-center gap-3">
					<AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
					<p className="text-sm text-foreground">
						<span className="font-semibold text-destructive">Emergency care first: </span>
						Chest pain, severe breathing difficulty, or loss of consciousness — seek urgent care now.
					</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
				{/* ── Input card ──────────────────────────────────────── */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={stagger(0)}
				>
					<Card className="overflow-hidden border-border/60 bg-card shadow-none">
						<CardHeader className="py-4">
							<CardTitle className="flex items-center gap-2 text-foreground">
								<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
									<Stethoscope className="h-4 w-4" />
								</span>
								Symptom input
							</CardTitle>
							<p className="max-w-2xl text-sm text-muted-foreground">
								Detailed descriptions improve the analysis. Saved profile and IoT data
								are used automatically when available.
							</p>
						</CardHeader>
						<CardContent className="space-y-6 p-5 sm:p-6">
							<div className="space-y-3">
								<div className="flex items-center justify-between gap-3">
									<label className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
										Common symptoms
									</label>
									<span className="font-mono text-[10px] text-muted-foreground">
										{selectedSymptoms.length}/12 selected
									</span>
								</div>
								<AnimatedTags
									initialTags={COMMON_SYMPTOMS}
									onChange={handleTagChange}
									selectedTags={selectedSymptoms}
									className="w-full"
								/>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between gap-3">
									<label className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
										Additional details
									</label>
									<span className="font-mono text-[10px] text-muted-foreground">
										{textInput.trim().length}/1000
									</span>
								</div>
								<Textarea
									value={textInput}
									onChange={(e) => setTextInput(e.target.value)}
									placeholder="Describe duration, severity, or anything else relevant..."
									rows={4}
									className="min-h-[132px] resize-none rounded-xl border-border/70 bg-background text-base shadow-none focus-visible:ring-ring/30"
								/>
							</div>

							<div className="grid gap-3 md:grid-cols-2">
								<motion.div
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={stagger(1)}
									className={cn(
										"space-y-3 rounded-xl border p-4",
										patientContextItems.length
											? "border-primary/15 bg-primary/5"
											: "border-dashed border-border bg-muted/20",
									)}
								>
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-2">
											<UserIcon className="h-4 w-4 text-muted-foreground" />
											<h3 className="text-sm font-semibold text-foreground">
												Profile context
											</h3>
										</div>
										<Badge
											variant="outline"
											className="rounded-md border-border bg-card font-mono text-xs text-muted-foreground"
										>
											{patientContextItems.length ? "included" : "not set"}
										</Badge>
									</div>
									{patientContextItems.length ? (
										<div className="grid gap-2 sm:grid-cols-2">
											{patientContextItems.map((item) => (
												<DataPill
													key={item}
													icon={BadgeCheck}
													label="Patient"
													value={item}
													tone="primary"
												/>
											))}
										</div>
									) : (
										<p className="text-sm leading-relaxed text-muted-foreground">
											Add profile details in settings for more personalized analysis.
										</p>
									)}
								</motion.div>

								<motion.div
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={stagger(2)}
									className={cn(
										"space-y-3 rounded-xl border p-4",
										iotSummaryItems.length
											? "border-secondary/20 bg-secondary/5"
											: "border-dashed border-border bg-muted/20",
									)}
								>
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-2">
											<HeartPulse className="h-4 w-4 text-muted-foreground" />
											<h3 className="text-sm font-semibold text-foreground">
												Wearable readings
											</h3>
										</div>
										<Badge
											variant="outline"
											className="rounded-md border-border bg-card font-mono text-xs text-muted-foreground"
										>
											last 7 d
										</Badge>
									</div>
									{iotSummaryItems.length ? (
										<div className="grid gap-2 sm:grid-cols-2">
											{iotSummaryItems.map((item) => (
												<DataPill
													key={item}
													icon={Activity}
													label="Reading"
													value={item}
												/>
											))}
										</div>
									) : (
										<p className="text-sm leading-relaxed text-muted-foreground">
											No health-sync data found in the last 7 days. Symptom text can still be analyzed.
										</p>
									)}
								</motion.div>
							</div>

							{/* Selected preview */}
							<AnimatePresence>
								{allSymptoms.length > 0 && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{
										duration: 0.35,
										ease: EASE,
									}}
									className="overflow-hidden"
								>
										<div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
											<div className="mb-2 flex items-center justify-between">
												<p className="font-mono text-sm font-medium text-primary">
													{allSymptoms.length} symptom
													{allSymptoms.length > 1 ? "s" : ""} queued
												</p>
												<button
													onClick={clearAll}
													className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
												>
													<X className="h-3 w-3" />
													Clear
												</button>
											</div>
											<div className="flex flex-wrap gap-1.5">
												{allSymptoms.map((s, i) => (
													<span
														key={`${s}-${i}`}
														className="rounded-md border border-primary/15 bg-card px-2.5 py-1 font-mono text-sm text-primary"
													>
														{s}
													</span>
												))}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							{/* Error */}
							<AnimatePresence>
								{error && (
									<motion.div
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 6 }}
										className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
									>
										<AlertCircle className="h-4 w-4 shrink-0" />
										{error}
									</motion.div>
								)}
							</AnimatePresence>

							{/* CTA + cancel */}
							<div className="flex flex-col gap-2 sm:flex-row">
								<Button
									onClick={handleAnalyze}
									disabled={loading || allSymptoms.length === 0}
									className="h-12 flex-1 rounded-[6px] bg-foreground font-semibold text-background shadow-none transition-all hover:bg-foreground/80 active:scale-[0.98]"
									aria-label={
										loading ? "Analyzing symptoms" : "Analyze symptoms with AI"
									}
								>
									{loading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Analyzing...
										</>
									) : (
										<>
											<Sparkles className="mr-2 h-4 w-4" />
											Analyze with AI
										</>
									)}
								</Button>
								{loading && (
									<motion.button
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										whileTap={{ scale: 0.96 }}
										onClick={cancelAnalyze}
										aria-label="Cancel analysis"
										className="flex h-12 items-center justify-center gap-1.5 rounded-[6px] border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
									>
										<X className="h-4 w-4" />
										Cancel
									</motion.button>
								)}
							</div>
							<AnimatePresence>
								{loading ? <AnalysisProgressPanel /> : null}
							</AnimatePresence>
						</CardContent>
					</Card>
				</motion.div>

				{/* ── Sidebar ─────────────────────────────────────────── */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={stagger(3)}
					className="space-y-4 lg:sticky lg:top-6 lg:self-start"
				>
					<Card className="border-border/60 bg-card shadow-none">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-foreground">
								<FileText className="h-5 w-5 text-muted-foreground" />
								Review pipeline
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
							<p>
								This tool cross-references your symptoms with medical knowledge and
								your personal health data to help identify possible conditions and
								recommended next steps.
							</p>
							<p>
								When available, your saved profile, allergies, and recent wearable
								data are used to personalise the analysis.
							</p>
							<p className="font-medium text-foreground">
								Informational only — not a medical diagnosis.
							</p>
						</CardContent>
					</Card>

					<Card className="border-border/60 bg-card shadow-none">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-foreground">
								<Clock className="h-5 w-5 text-muted-foreground" />
								History
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{historyLoading ? (
								<p className="text-sm text-muted-foreground">Loading…</p>
							) : historyItems.length === 0 ? (
								<p className="text-sm text-muted-foreground">No past analyses yet.</p>
							) : (
								historyItems.map((item) => {
									const itemUrgency = urgencyConfig(item.urgency);
									const itemSource = sourceLabel(item.source ?? undefined);
									const isExpanded = expandedHistoryId === item.id;
									return (
										<button
											key={item.id}
											type="button"
											onClick={() =>
												setExpandedHistoryId(isExpanded ? null : item.id)
											}
											className="w-full rounded-lg border border-border/60 bg-muted/10 p-3 text-left transition-colors hover:bg-muted/20"
										>
											<div className="flex items-center justify-between gap-2">
												<p className="min-w-0 truncate text-sm font-medium text-foreground">
													{item.possible_disease || "Analysis"}
												</p>
												<span
													className={cn(
														"shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
														itemUrgency.badgeClass,
													)}
												>
													{itemUrgency.label}
												</span>
											</div>
											<p className="mt-1 text-xs text-muted-foreground">
												{new Date(item.created_at).toLocaleDateString("en-MY", {
													day: "numeric",
													month: "short",
													hour: "2-digit",
													minute: "2-digit",
												})}
												{itemSource ? ` · ${itemSource.label}` : ""}
											</p>
											{isExpanded ? (
												<div className="mt-2 space-y-1 border-t border-border/50 pt-2">
													<p className="text-xs text-muted-foreground">
														{item.symptoms_text}
													</p>
													{item.suggested_action ? (
														<p className="text-xs leading-relaxed text-foreground">
															{item.suggested_action}
														</p>
													) : null}
												</div>
											) : null}
										</button>
									);
								})
							)}
						</CardContent>
					</Card>

					<Card className="border-destructive/20 bg-destructive/8 shadow-none">
						<CardContent className="pt-6">
							<div className="flex items-start gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-destructive">
									<AlertTriangle className="h-4 w-4" />
								</div>
								<div className="space-y-1">
									<p className="text-sm font-semibold text-destructive">
										When to skip this tool
									</p>
									<p className="text-sm leading-relaxed text-muted-foreground">
										Severe chest pain, breathing difficulty, severe bleeding, or loss of
										consciousness — seek urgent care directly.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* ── Results ─────────────────────────────────────────────── */}
			<AnimatePresence mode="wait">
				{result && urgencyCfg ? (
					<motion.div
						ref={resultRef}
						key="results"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, ease: EASE }}
						exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
						className="mt-2 space-y-4"
					>
						{/* Hero result card */}
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={stagger(0)}
						>
							<Card className="overflow-hidden border-border/60 bg-card shadow-none">
								<div className={cn("h-1.5 w-full", urgencyCfg.barColor)} />
								<CardContent className="p-5 sm:p-8 lg:p-10">
									<div className="flex flex-wrap items-start justify-between gap-5">
										<div className="max-w-3xl">
										<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
											Possible condition
										</p>
											<h2
												className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl"
												style={{ letterSpacing: "-0.025em" }}
											>
												{result.possible_disease}
											</h2>
										</div>
										<div className="flex flex-wrap gap-2">
											<span
												className={cn(
													"rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em]",
													urgencyCfg.badgeClass,
												)}
											>
												{urgencyCfg.label}
											</span>
											{sourceBadge && (
												<span
													className={cn(
														"rounded-full border px-3 py-1 text-xs font-medium tracking-[0.03em]",
														sourceBadge.className,
													)}
												>
													{sourceBadge.label}
												</span>
											)}
										</div>
									</div>

									{/* Severity */}
									<div className="mt-7">
									<div className="mb-2 flex items-center justify-between">
										<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
											Severity level
										</p>
										<p className="font-mono text-[10px] text-muted-foreground">
											{urgencyCfg.filled}/4
										</p>
									</div>
										<UrgencySeverityBar urgency={result.urgency} />
									</div>

									{/* Stats strip */}
									<div className="mt-6 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border border-border/60 bg-muted/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
										<div className="px-5 py-4">
											<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
												Confidence
											</p>
											<p className="mt-1.5 text-lg font-semibold capitalize text-foreground">
												{result.confidence_level}
											</p>
										</div>
										<div className="px-5 py-4">
											<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
												Suggested timeline
											</p>
											<div className="mt-1.5 flex items-center gap-1.5">
												<Clock className="h-3.5 w-3.5 text-muted-foreground" />
												<p className="text-lg font-semibold text-foreground">
													{urgencyCfg.timeline}
												</p>
											</div>
										</div>
										<div className="px-5 py-4">
											<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
												Next step
											</p>
											<p className="mt-1.5 text-sm text-muted-foreground">
												Consult a healthcare professional.
											</p>
										</div>
									</div>

									{/* IoT alert flags */}
									{result.iot_flags && result.iot_flags.length > 0 ? (
										<div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/8 p-4">
											<div className="flex items-center gap-2">
												<HeartPulse className="h-4 w-4 text-destructive" />
												<p className="text-sm font-semibold text-foreground">
													Wearable alerts
												</p>
											</div>
											<ul className="mt-2 space-y-1">
												{result.iot_flags.map((flag, i) => (
													<li
														key={`${flag}-${i}`}
														className="text-sm text-muted-foreground"
													>
														— {flag}
													</li>
												))}
											</ul>
										</div>
									) : null}
								</CardContent>
							</Card>
						</motion.div>

						{/* Actions + sidebar */}
						<div className="grid gap-4 lg:grid-cols-[1fr_400px]">
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={stagger(1)}
								className="space-y-4"
							>
								{result.normalized_symptoms?.length ? (
									<Card className="border-border/60 bg-card shadow-none">
										<CardHeader>
											<CardTitle className="text-base text-foreground">Recognized symptoms</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="flex flex-wrap gap-2">
												{result.normalized_symptoms.map((s) => (
													<Badge
														key={s}
														variant="outline"
														className="rounded-full border-border bg-muted/40 font-mono text-muted-foreground"
													>
														{s}
													</Badge>
												))}
											</div>
										</CardContent>
									</Card>
								) : null}

								{actionLines.length ? (
									<Card className="border-border/60 bg-card shadow-none">
										<CardHeader>
											<CardTitle className="flex items-center gap-2 text-base text-foreground">
												<Brain className="h-4 w-4 text-muted-foreground" />
												Recommended actions
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2">
											{actionLines.map((line, i) => (
												<motion.div
													key={`${line}-${i}`}
													initial={{ opacity: 0, x: -8 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{
														duration: 0.35,
														delay: 0.1 + i * 0.05,
														ease: EASE,
													}}
													className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3"
												>
													<div className="mt-0.5 rounded-sm bg-muted p-1">
														<Check className="h-3 w-3 text-muted-foreground" />
													</div>
													<span className="text-sm leading-relaxed text-foreground">
														{line}
													</span>
												</motion.div>
											))}
										</CardContent>
									</Card>
								) : null}
							</motion.div>

							{/* Right column — disclaimer + feedback */}
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={stagger(2)}
								className="space-y-4"
							>
								<Card className="border-border/60 bg-card shadow-none">
									<CardContent className="pt-6">
										<div className="flex items-start gap-3">
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
												<ShieldCheck className="h-4 w-4 text-muted-foreground" />
											</div>
											<div>
												<p className="text-sm font-semibold text-foreground">
													Medical disclaimer
												</p>
												<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
													{result.disclaimer ||
														"This analysis is for informational purposes only and does not replace professional medical advice."}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="border-border/60 bg-card shadow-none">
									<CardContent className="pt-6">
										<AnimatePresence mode="wait">
											{feedbackSent ? (
												<motion.div
													key="sent"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.3, ease: EASE }}
													className="flex items-center gap-2"
												>
													<Check className="h-4 w-4 text-primary" />
													<p className="text-sm font-medium text-foreground">
														Thanks for your feedback.
													</p>
												</motion.div>
											) : (
												<motion.div
													key="form"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.3, ease: EASE }}
												>
													<p className="mb-3 text-sm font-medium text-foreground">
														Was this analysis accurate?
													</p>
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															className="flex-1 border-border text-muted-foreground hover:border-foreground hover:text-foreground"
															disabled={feedbackGiven}
															onClick={() => void handleFeedback(true)}
														>
															<ThumbsUp className="mr-1.5 h-4 w-4" />
															Yes
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="flex-1 border-border text-muted-foreground hover:border-foreground hover:text-foreground"
															disabled={feedbackGiven}
															onClick={() => void handleFeedback(false)}
														>
															<ThumbsDown className="mr-1.5 h-4 w-4" />
															No
														</Button>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</CardContent>
								</Card>
							</motion.div>
						</div>

						{/* Facilities */}
						{recommendedFacilities.length ? (
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={stagger(3)}
							>
								<Card className="border-border/60 bg-card shadow-none">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-base text-foreground">
											<Hospital className="h-4 w-4 text-muted-foreground" />
											Registered care nearby
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
											{recommendedFacilities.map((facility, i) => (
												<motion.div
													key={facility.id}
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														duration: 0.35,
														delay: i * 0.06,
														ease: EASE,
													}}
													className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 p-4 transition-shadow hover:shadow-md"
												>
													<div>
														<div className="flex flex-wrap items-center gap-1.5">
															<p className="text-sm font-semibold text-foreground">
																{facility.name}
															</p>
															{facility.distanceKm !== null ? (
																<span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
																	{facility.distanceKm.toFixed(1)} km
																</span>
															) : null}
														</div>
														<p className="mt-0.5 text-sm text-muted-foreground">
															{facility.specialty || "General care"}
														</p>
														{facility.type ? (
															<span className="mt-1 inline-block rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
																{facility.type}
															</span>
														) : null}
														<div className="mt-2 flex items-start gap-1.5">
															<MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
															<p className="text-sm text-muted-foreground">
																{facility.address}
															</p>
														</div>
													</div>
													<div className="flex gap-2 pt-1">
														<Button asChild variant="outline" size="sm" className="flex-1 border-border text-muted-foreground hover:border-foreground hover:text-foreground">
															<a href={mapHref(facility)} target="_blank" rel="noreferrer">
																Map
															</a>
														</Button>
														<Button asChild size="sm" className="flex-1 rounded-[6px] bg-foreground text-background shadow-none hover:bg-foreground/80">
															<Link href={`/user/appointments/${facility.id}`}>Book</Link>
														</Button>
													</div>
												</motion.div>
											))}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						) : null}

						{/* Reset */}
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={stagger(4)}
							className="flex justify-center"
						>
							<Button
								variant="outline"
								onClick={clearAll}
								className="gap-2 rounded-[6px] border-border px-8 text-muted-foreground hover:border-foreground hover:text-foreground"
							>
								<RefreshCw className="h-4 w-4" />
								Start a new analysis
							</Button>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</UserPageShell>
	);
}
