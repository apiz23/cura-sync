"use client";

import {
	PiWarningCircle,
	PiWarning,
	PiBrain,
	PiCheck,
	PiFileText,
	PiHospital,
	PiCircleNotch,
	PiMapPin,
	PiShieldCheck,
	PiSparkleFill,
	PiThumbsDown,
	PiThumbsUp,
	PiArrowRight,
	PiArrowCounterClockwise,
	PiSmileyWink,
	PiX,
} from "react-icons/pi";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { AnalysisResult } from "@/app/types";
import AnimatedTags from "@/components/smoothui/animated-tags";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
	"Loss of Taste",
	"Loss of Smell",
	"Abdominal Pain",
];

const MAX_TEXT_LEN = 1000;
const MIN_AGE = 1;
const MAX_AGE = 120;
const ANALYZE_TIMEOUT_MS = 30_000;
const NEXT_PARAM = "/symptom-analyzer";

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

// ── Types ────────────────────────────────────────────────────────────────────

type Facility = {
	id: string;
	name: string;
	type?: string | null;
	specialty?: string | null;
	address: string;
	latitude?: string | null;
	longitude?: string | null;
	distanceKm?: number | null;
};

type Coordinates = {
	latitude: number;
	longitude: number;
};

type PatientContext = {
	age?: number;
	gender?: string;
	allergies?: string;
	chronic_conditions?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function urgencyConfig(urgency: AnalysisResult["urgency"]) {
	switch (urgency) {
		case "emergency":
			return {
				label: "Emergency",
				filled: 4,
				barColor: "bg-destructive",
				badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
			};
		case "high":
			return {
				label: "High urgency",
				filled: 3,
				barColor: "bg-chart-5",
				badgeClass:
					"bg-chart-5/10 text-chart-5 border-chart-5/30 dark:text-chart-5",
			};
		case "medium":
			return {
				label: "Medium urgency",
				filled: 2,
				barColor: "bg-chart-5",
				badgeClass:
					"bg-chart-5/10 text-chart-5 border-chart-5/30 dark:text-chart-5",
			};
		case "low":
			return {
				label: "Low urgency",
				filled: 1,
				barColor: "bg-primary",
				badgeClass: "bg-primary/10 text-primary border-primary/20",
			};
		default:
			return {
				label: "Unknown",
				filled: 0,
				barColor: "bg-muted-foreground",
				badgeClass: "bg-muted text-muted-foreground border-border",
			};
	}
}

function urgencyTimeline(urgency: AnalysisResult["urgency"]) {
	switch (urgency) {
		case "emergency":
			return "Seek immediate care";
		case "high":
			return "As soon as possible";
		case "medium":
			return "Within 2 to 3 days";
		case "low":
			return "Monitor and follow up";
		default:
			return "Use clinical judgment";
	}
}

function sourceLabel(source: string | undefined): { label: string; class: string } | null {
	switch (source) {
		case "jamai_structured":
			return { label: "JamAI", class: "bg-primary/10 text-primary border-primary/20" };
		case "biobert_enhanced_ai":
			return { label: "JamAI + BioBERT", class: "bg-primary/10 text-primary border-primary/20" };
		case "knowledge_base":
			return {
				label: "Knowledge Base",
				class: "bg-info/10 text-info border-info/20",
			};
		case "rule_based_safety":
			return {
				label: "Rule-based Triage",
				class: "bg-warning/10 text-warning-foreground border-warning/20",
			};
		case "iot_safety":
			return {
				label: "IoT Safety Alert",
				class: "bg-destructive/10 text-destructive border-destructive/20",
			};
		case "fallback":
			return {
				label: "General Guidance",
				class: "bg-muted text-muted-foreground border-border",
			};
		default:
			return null;
	}
}

function distanceFromUser(facility: Facility, userLocation: Coordinates | null) {
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
	if (facility.latitude && facility.longitude)
		return `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`;
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function UrgencySeverityBar({ urgency }: { urgency: AnalysisResult["urgency"] }) {
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
					className={cn("h-2 flex-1 rounded-full", i < filled ? barColor : "bg-muted")}
					initial={{ scaleX: 0, opacity: 0 }}
					animate={{ scaleX: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 120,
						damping: 22,
						delay: 0.15 + i * 0.06,
					}}
					style={{ originX: 0 }}
				/>
			))}
		</div>
	);
}

// ── Variants ─────────────────────────────────────────────────────────────────

const stagger: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
	hidden: { opacity: 0, y: 14 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 90, damping: 22 },
	},
};

const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.35 } },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
	const [textInput, setTextInput] = useState("");
	const [ageInput, setAgeInput] = useState("");
	const [genderInput, setGenderInput] = useState("");
	const [conditionsInput, setConditionsInput] = useState("");
	const [allergiesInput, setAllergiesInput] = useState("");
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
	const [feedbackGiven, setFeedbackGiven] = useState(false);
	const [feedbackSent, setFeedbackSent] = useState(false);
	const [ageError, setAgeError] = useState<string | null>(null);
	const analyzeAbortRef = useRef<AbortController | null>(null);
	const facilitiesLoadedRef = useRef(false);
	const geolocationAskedRef = useRef(false);

	const loadFacilities = useCallback(async () => {
		if (facilitiesLoadedRef.current) return;
		facilitiesLoadedRef.current = true;
		try {
			const res = await fetch("/api/facilities");
			if (!res.ok) {
				facilitiesLoadedRef.current = false;
				return;
			}
			const data = (await res.json()) as Facility[];
			setFacilities(Array.isArray(data) ? data : []);
		} catch (e) {
			console.error("Facility fetch error:", e);
			facilitiesLoadedRef.current = false;
		}
	}, []);

	const requestGeolocation = useCallback(() => {
		if (geolocationAskedRef.current) return;
		if (typeof window === "undefined" || !("geolocation" in navigator)) return;
		geolocationAskedRef.current = true;
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
		const ctx: PatientContext = {};
		const ageRaw = ageInput.trim();
		if (ageRaw) {
			const age = Number.parseInt(ageRaw, 10);
			if (Number.isFinite(age) && age >= MIN_AGE && age <= MAX_AGE) {
				ctx.age = age;
			}
		}
		if (genderInput.trim()) ctx.gender = genderInput.trim();
		if (conditionsInput.trim()) ctx.chronic_conditions = conditionsInput.trim();
		if (allergiesInput.trim()) ctx.allergies = allergiesInput.trim();
		return Object.keys(ctx).length > 0 ? ctx : null;
	}, [ageInput, allergiesInput, conditionsInput, genderInput]);

	const handleAgeChange = useCallback((value: string) => {
		setAgeInput(value);
		const trimmed = value.trim();
		if (!trimmed) {
			setAgeError(null);
			return;
		}
		const age = Number.parseInt(trimmed, 10);
		if (!Number.isFinite(age) || age < MIN_AGE || age > MAX_AGE) {
			setAgeError(`Enter age between ${MIN_AGE}–${MAX_AGE}.`);
		} else {
			setAgeError(null);
		}
	}, []);

	const patientContextItems = useMemo(() => {
		if (!patientContext) return [];
		return [
			patientContext.age ? `${patientContext.age} yrs` : null,
			patientContext.gender ?? null,
			patientContext.chronic_conditions ? `Cond: ${patientContext.chronic_conditions}` : null,
			patientContext.allergies ? `Allergy: ${patientContext.allergies}` : null,
		].filter(Boolean) as string[];
	}, [patientContext]);

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
		setAgeInput("");
		setGenderInput("");
		setConditionsInput("");
		setAllergiesInput("");
		setAgeError(null);
		setResult(null);
		setError(null);
		setFeedbackGiven(false);
		setFeedbackSent(false);
	}, []);

	const handleFeedback = useCallback(
		async (wasAccurate: boolean) => {
			if (!result || feedbackGiven) return;
			try {
				const res = await fetch("/api/public/feedback", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						symptoms: allSymptoms.join(", "),
						was_accurate: wasAccurate,
						possible_disease: result.possible_disease,
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

	const handleAnalyze = useCallback(async () => {
		if (allSymptoms.length === 0) {
			toast.warning("No symptoms selected", {
				description: "Select or describe your symptoms first.",
			});
			return;
		}
		if (ageError) {
			toast.warning("Invalid age", { description: ageError });
			return;
		}

		analyzeAbortRef.current?.abort();
		const controller = new AbortController();
		analyzeAbortRef.current = controller;
		let timedOut = false;
		const timeoutId = window.setTimeout(() => {
			timedOut = true;
			controller.abort();
		}, ANALYZE_TIMEOUT_MS);

		setLoading(true);
		setError(null);

		const analyzePromise = fetch("/api/public/analyze", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				symptoms: allSymptoms.join(", "),
				patient_context: patientContext,
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
				void loadFacilities();
				requestGeolocation();
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
			if (err instanceof Error && err.name === "AbortError") {
				if (timedOut) {
					setError("Analysis timed out. Please try again.");
				}
				return;
			}
			setError(
				err instanceof Error ? err.message : "Something went wrong. Please try again.",
			);
		} finally {
			window.clearTimeout(timeoutId);
			if (analyzeAbortRef.current === controller) {
				analyzeAbortRef.current = null;
			}
			setLoading(false);
		}
	}, [allSymptoms, ageError, patientContext, loadFacilities, requestGeolocation]);

	const cancelAnalyze = useCallback(() => {
		analyzeAbortRef.current?.abort();
		analyzeAbortRef.current = null;
		setLoading(false);
	}, []);

	const urgencyCfg = result ? urgencyConfig(result.urgency) : null;
	const sourceBadge = result ? sourceLabel(result.source) : null;

	return (
		<div className="public-grid-page public-line-page">
			<div className="public-page-content mx-auto max-w-[1400px] px-6 pb-20 pt-10 lg:px-10">

				{/* ── Page header — left-aligned, not centered ─────────────── */}
				<motion.div
					variants={stagger}
					initial="hidden"
					animate="visible"
					className="public-text-panel mb-12 flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between"
				>
					<div>
						<motion.div variants={fadeUp} className="mb-4 flex items-center gap-2">
							<span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
								<PiBrain className="h-4 w-4 text-primary" />
							</span>
							<span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
								Symptom Analyzer
							</span>
						</motion.div>
						<motion.h1
							variants={fadeUp}
							className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
						>
							What are you
							<br />
							experiencing?
						</motion.h1>
						<motion.p
							variants={fadeUp}
							className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground"
						>
							AI-powered clinical insights using BioClinicalBERT and JamAIBase RAG.
							Organize what you feel before speaking with a clinician. No account
							required.
						</motion.p>
					</div>

					<motion.div
						variants={fadeUp}
						className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:gap-2"
					>
						{[
							{ label: "BioClinicalBERT", color: "bg-primary/10 text-primary border-primary/20" },
							{ label: "JamAIBase RAG", color: "bg-info/10 text-info border-info/20" },
							{ label: "Informational only", color: "bg-muted text-muted-foreground border-border" },
						].map((b) => (
							<span
								key={b.label}
								className={cn(
									"rounded-full border px-3 py-1 font-mono text-[11px] font-medium",
									b.color,
								)}
							>
								{b.label}
							</span>
						))}
					</motion.div>
				</motion.div>

				{/* ── Emergency banner — always visible ───────────────────── */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
					className="mb-6"
				>
					<Alert
						variant="destructive"
						className="rounded-2xl border-destructive/20 bg-destructive/5"
					>
						<PiWarning />
						<AlertDescription className="text-foreground">
							<span className="font-semibold text-destructive">Emergency: </span>
							If you have chest pain, severe breathing difficulty, severe
							bleeding, or loss of consciousness — seek urgent medical care now.
						</AlertDescription>
					</Alert>
				</motion.div>

				<AnimatePresence mode="wait">
					{result ? (
						/* ── RESULTS VIEW ──────────────────────────────────────── */
						<motion.div
							key="results"
							variants={stagger}
							initial="hidden"
							animate="visible"
							exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
							className="space-y-4"
						>
							{/* Hero result card */}
							<motion.div
								variants={fadeUp}
								className="overflow-hidden rounded-3xl border border-border bg-card"
							>
								<div className={cn("h-1 w-full", urgencyCfg?.barColor ?? "bg-muted")} />
								<div className="p-8">
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div>
											<p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
												Possible condition
											</p>
											<h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
												{result.possible_disease}
											</h2>
										</div>
										<div className="flex flex-wrap gap-2">
											{urgencyCfg && (
												<span
													className={cn(
														"rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide",
														urgencyCfg.badgeClass,
													)}
												>
													{urgencyCfg.label}
												</span>
											)}
											{sourceBadge && (
												<span
													className={cn(
														"rounded-full border px-3 py-1 text-xs font-medium",
														sourceBadge.class,
													)}
												>
													{sourceBadge.label}
												</span>
											)}
										</div>
									</div>

									{/* Severity bar */}
									<div className="mt-6">
										<div className="mb-2 flex items-center justify-between">
											<p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
												Severity level
											</p>
											<p className="font-mono text-[11px] text-muted-foreground">
												{urgencyCfg?.filled}/4
											</p>
										</div>
										<UrgencySeverityBar urgency={result.urgency} />
									</div>

									{/* Stats strip — horizontal, divided, NOT 3-col cards */}
									<div className="mt-6 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
										<div className="px-5 py-4">
											<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
												Confidence
											</p>
											<p className="mt-1.5 text-sm font-semibold capitalize text-foreground">
												{result.confidence_level}
											</p>
										</div>
										<div className="px-5 py-4">
											<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
												Suggested timeline
											</p>
											<p className="mt-1.5 text-sm font-medium text-foreground">
												{urgencyTimeline(result.urgency)}
											</p>
										</div>
										<div className="px-5 py-4">
											<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
												Next step
											</p>
											<p className="mt-1.5 text-sm text-muted-foreground">
												Consult a healthcare professional.
											</p>
										</div>
									</div>
								</div>
							</motion.div>

							{/* Two-column: actions + sidebar info */}
							<div className="grid gap-4 lg:grid-cols-[1fr_360px]">

								{/* Left — recognized symptoms + actions */}
								<div className="space-y-4">
									{Array.isArray(result.normalized_symptoms) &&
									result.normalized_symptoms.length > 0 ? (
										<motion.div
											variants={fadeUp}
											className="rounded-2xl border border-border bg-card p-6"
										>
											<h3 className="mb-4 text-sm font-semibold text-foreground">
												Recognized symptoms
											</h3>
											<div className="flex flex-wrap gap-2">
												{result.normalized_symptoms.map((s) => (
													<span
														key={s}
														className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground"
													>
														{s}
													</span>
												))}
											</div>
										</motion.div>
									) : null}

									{actionLines.length ? (
										<motion.div
											variants={fadeUp}
											className="rounded-2xl border border-border bg-card p-6"
										>
											<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
												<PiBrain className="h-4 w-4 text-primary" />
												Recommended actions
											</h3>
											<div className="space-y-2">
												{actionLines.map((line, i) => (
													<motion.div
														key={`${line}-${i}`}
														initial={{ opacity: 0, x: -8 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{
															type: "spring",
															stiffness: 100,
															damping: 20,
															delay: 0.1 + i * 0.05,
														}}
														className="flex items-start gap-3 rounded-xl bg-muted/40 px-4 py-3"
													>
														<PiCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
														<span className="text-sm leading-relaxed text-foreground">
															{line}
														</span>
													</motion.div>
												))}
											</div>
										</motion.div>
									) : null}
								</div>

								{/* Right sidebar — disclaimer + feedback */}
								<div className="space-y-4">
									{/* Disclaimer */}
									<motion.div
										variants={fadeUp}
										className="rounded-2xl border border-border bg-card p-5"
									>
										<div className="flex items-start gap-3">
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
												<PiShieldCheck className="h-4 w-4 text-muted-foreground" />
											</div>
											<div>
												<p className="text-sm font-semibold text-foreground">
													Medical disclaimer
												</p>
												<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
													{result.disclaimer ||
														"This analysis is for informational purposes only. It does not replace professional medical advice, diagnosis, or treatment."}
												</p>
											</div>
										</div>
									</motion.div>

									{/* Feedback */}
									<motion.div
										variants={fadeUp}
										className="rounded-2xl border border-border bg-card p-5"
									>
										<AnimatePresence mode="wait">
											{feedbackSent ? (
												<motion.div
													key="sent"
													variants={fadeIn}
													initial="hidden"
													animate="visible"
													className="flex items-center gap-2"
												>
													<PiSmileyWink className="h-4 w-4 text-primary" />
													<p className="text-sm font-medium text-foreground">
														Thanks for your feedback.
													</p>
												</motion.div>
											) : (
												<motion.div key="form" variants={fadeIn} initial="hidden" animate="visible">
													<p className="mb-3 text-sm font-medium text-foreground">
														Was this analysis accurate?
													</p>
													<div className="flex gap-2">
														<motion.button
															whileTap={{ scale: 0.96 }}
															disabled={feedbackGiven}
															onClick={() => void handleFeedback(true)}
															className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
														>
															<PiThumbsUp className="h-4 w-4" />
															Yes
														</motion.button>
														<motion.button
															whileTap={{ scale: 0.96 }}
															disabled={feedbackGiven}
															onClick={() => void handleFeedback(false)}
															className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
														>
															<PiThumbsDown className="h-4 w-4" />
															No
														</motion.button>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								</div>
							</div>

							{/* Nearby facilities */}
							{recommendedFacilities.length ? (
								<motion.div
									variants={fadeUp}
									className="rounded-2xl border border-border bg-card p-6"
								>
									<h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
										<PiHospital className="h-4 w-4 text-primary" />
										Registered care options nearby
									</h3>
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{recommendedFacilities.map((facility, i) => (
											<motion.div
												key={facility.id}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													type: "spring",
													stiffness: 100,
													damping: 22,
													delay: i * 0.07,
												}}
												className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4"
											>
												<div>
													<div className="flex flex-wrap items-center gap-1.5">
														<p className="text-sm font-semibold text-foreground">
															{facility.name}
														</p>
														{facility.distanceKm !== null && (
															<span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
																{facility.distanceKm!.toFixed(1)} km
															</span>
														)}
													</div>
													<p className="mt-0.5 text-xs text-muted-foreground">
														{facility.specialty || "General care"}
													</p>
													{facility.type && (
														<span className="mt-1 inline-block rounded-full border border-border font-mono text-[10px] px-2 py-0.5 text-muted-foreground">
															{facility.type}
														</span>
													)}
													<div className="mt-2 flex items-start gap-1.5">
														<PiMapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
														<p className="text-xs text-muted-foreground">{facility.address}</p>
													</div>
												</div>
												<div className="flex gap-2 pt-1">
													<a
														href={mapHref(facility)}
														target="_blank"
														rel="noreferrer"
														className="flex-1 rounded-lg border border-border bg-background py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
													>
														Open map
													</a>
													<Link
														href={`/sign-in?next=${encodeURIComponent(NEXT_PARAM)}`}
														className="flex-1 rounded-lg bg-primary py-1.5 text-center text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
													>
														Book
													</Link>
												</div>
											</motion.div>
										))}
									</div>
								</motion.div>
							) : null}

							{/* Reset */}
							<motion.div variants={fadeUp}>
								<motion.button
									whileTap={{ scale: 0.98 }}
									onClick={clearAll}
									className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								>
									<PiArrowCounterClockwise className="h-4 w-4" />
									Start a new analysis
								</motion.button>
							</motion.div>
						</motion.div>

					) : (

						/* ── INPUT VIEW ────────────────────────────────────────── */
						<motion.div
							key="input"
							variants={stagger}
							initial="hidden"
							animate="visible"
							exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
							className="grid gap-5 lg:grid-cols-[1fr_340px]"
						>
							{/* Left — symptom input */}
							<motion.div
								variants={fadeUp}
								className="space-y-6 rounded-3xl border border-border bg-card p-7"
							>
								{/* Section label */}
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
										<PiBrain className="h-5 w-5 text-primary" />
									</div>
									<div>
										<h2 className="text-sm font-semibold text-foreground">
											Select or describe symptoms
										</h2>
										<p className="text-xs text-muted-foreground">
											Detailed descriptions improve accuracy
										</p>
									</div>
								</div>

								{/* Quick-select tags */}
								<div className="space-y-2">
									<label className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
										Quick select
									</label>
									<AnimatedTags
										initialTags={COMMON_SYMPTOMS}
										onChange={handleTagChange}
										selectedTags={selectedSymptoms}
										className="w-full"
									/>
								</div>

								{/* Free-text */}
								<div className="space-y-2">
									<div className="flex items-center justify-between gap-3">
										<label
											htmlFor="symptom-details"
											className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
										>
											Additional details
										</label>
										<span
											className={cn(
												"font-mono text-[11px]",
												textInput.length >= MAX_TEXT_LEN
													? "text-destructive"
													: "text-muted-foreground",
											)}
											aria-live="polite"
										>
											{textInput.length}/{MAX_TEXT_LEN}
										</span>
									</div>
									<Textarea
										id="symptom-details"
										value={textInput}
										onChange={(e) =>
											setTextInput(e.target.value.slice(0, MAX_TEXT_LEN))
										}
										maxLength={MAX_TEXT_LEN}
										placeholder="Describe duration, severity, or any other context..."
										rows={4}
										className="min-h-[110px] resize-none rounded-xl border-border bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary"
									/>
								</div>

								{/* Optional health context */}
								<div className="rounded-2xl border border-border/50 bg-muted/20 p-5 space-y-4">
									<div>
										<p className="text-sm font-semibold text-foreground">
											Optional health context
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											Anonymous — not stored. Improves analysis accuracy.
										</p>
									</div>
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
										<div className="space-y-1.5">
											<label
												htmlFor="patient-age"
												className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
											>
												Age
											</label>
											<Input
												id="patient-age"
												type="number"
												min={MIN_AGE}
												max={MAX_AGE}
												inputMode="numeric"
												value={ageInput}
												onChange={(e) => handleAgeChange(e.target.value)}
												aria-invalid={ageError ? true : undefined}
												aria-describedby={ageError ? "patient-age-error" : undefined}
												placeholder="34"
												className="rounded-xl border-border bg-background"
											/>
											{ageError && (
												<p
													id="patient-age-error"
													role="alert"
													className="text-[11px] font-medium text-destructive"
												>
													{ageError}
												</p>
											)}
										</div>
										<div className="space-y-1.5">
											<label
												htmlFor="patient-gender"
												className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
											>
												Sex / Gender
											</label>
											<Select
												value={genderInput || "unspecified"}
												onValueChange={(v) =>
													setGenderInput(v === "unspecified" ? "" : v)
												}
											>
												<SelectTrigger
													id="patient-gender"
													className="h-10 w-full rounded-xl border-border bg-background"
												>
													<SelectValue placeholder="Prefer not to say" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="unspecified">
														Prefer not to say
													</SelectItem>
													<SelectItem value="Female">Female</SelectItem>
													<SelectItem value="Male">Male</SelectItem>
													<SelectItem value="Intersex">Intersex</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-1.5">
											<label
												htmlFor="patient-conditions"
												className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
											>
												Known conditions
											</label>
											<Input
												id="patient-conditions"
												value={conditionsInput}
												onChange={(e) => setConditionsInput(e.target.value)}
												placeholder="asthma, diabetes..."
												className="rounded-xl border-border bg-background"
											/>
										</div>
										<div className="space-y-1.5">
											<label
												htmlFor="patient-allergies"
												className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
											>
												Allergies
											</label>
											<Input
												id="patient-allergies"
												value={allergiesInput}
												onChange={(e) => setAllergiesInput(e.target.value)}
												placeholder="penicillin, peanuts..."
												className="rounded-xl border-border bg-background"
											/>
										</div>
									</div>

									{patientContextItems.length > 0 && (
										<div className="flex flex-wrap gap-1.5">
											{patientContextItems.map((item) => (
												<Badge key={item} variant="outline" className="font-mono text-[11px]">
													{item}
												</Badge>
											))}
										</div>
									)}
								</div>

								{/* Selected preview */}
								<AnimatePresence>
									{allSymptoms.length > 0 && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ type: "spring", stiffness: 120, damping: 22 }}
											className="overflow-hidden"
										>
											<div className="rounded-xl bg-primary/5 px-4 py-3">
												<div className="mb-2 flex items-center justify-between">
													<p className="font-mono text-[11px] font-medium text-primary">
														{allSymptoms.length} symptom{allSymptoms.length > 1 ? "s" : ""} queued
													</p>
													<button
														onClick={clearAll}
														className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
													>
														<PiX className="h-3 w-3" />
														Clear
													</button>
												</div>
												<div className="flex flex-wrap gap-1.5">
													{allSymptoms.map((s, i) => (
														<span
															key={`${s}-${i}`}
															className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] text-primary"
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
										>
											<Alert variant="destructive" className="rounded-xl">
												<PiWarningCircle />
												<AlertDescription className="flex flex-wrap items-center justify-between gap-3">
													<span>{error}</span>
													<Button
														type="button"
														size="sm"
														variant="outline"
														onClick={() => void handleAnalyze()}
														disabled={loading}
														className="h-8 gap-1.5 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
													>
														<PiArrowCounterClockwise className="h-3.5 w-3.5" />
														Retry
													</Button>
												</AlertDescription>
											</Alert>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Analyze CTA + cancel */}
								<div className="flex gap-2">
									<motion.button
										whileTap={{ scale: 0.98 }}
										onClick={handleAnalyze}
										disabled={loading || allSymptoms.length === 0}
										aria-label={loading ? "Analyzing symptoms" : "Analyze symptoms with AI"}
										className={cn(
											"flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all",
											"bg-primary text-primary-foreground hover:bg-primary/90",
											"disabled:cursor-not-allowed disabled:opacity-40",
										)}
									>
										{loading ? (
											<>
												<PiCircleNotch className="h-4 w-4 animate-spin" />
												Analyzing symptoms...
											</>
										) : (
											<>
												<PiSparkleFill className="h-4 w-4" />
												Analyze with AI
												<PiArrowRight className="h-4 w-4" />
											</>
										)}
									</motion.button>
									{loading && (
										<motion.button
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											whileTap={{ scale: 0.96 }}
											onClick={cancelAnalyze}
											aria-label="Cancel analysis"
											className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
										>
											<PiX className="h-4 w-4" />
											Cancel
										</motion.button>
									)}
								</div>
							</motion.div>

							{/* Right — info sidebar */}
							<div className="space-y-4">

								{/* About tool */}
								<motion.div
									variants={fadeUp}
									className="rounded-2xl border border-border bg-card p-5 space-y-4"
								>
									<div className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
											<PiFileText className="h-4 w-4 text-muted-foreground" />
										</div>
										<h3 className="text-sm font-semibold text-foreground">
											About this tool
										</h3>
									</div>
									<div className="space-y-3 text-[13px] leading-relaxed text-muted-foreground">
										<p>
											Public demo access. Use without signing in. Optional health
											context can improve results.
										</p>
										<p>
											Powered by BioClinicalBERT (clinical NLP) and JamAIBase RAG —
											grounding responses in a verified medical knowledge base.
										</p>
										<p>
											Designed to help organize symptom information before a clinical
											visit. Does not provide a diagnosis.
										</p>
									</div>
								</motion.div>

								{/* Empty state — shown when no symptoms */}
								<AnimatePresence>
									{allSymptoms.length === 0 && (
										<motion.div
											key="empty"
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -8 }}
											transition={{ type: "spring", stiffness: 100, damping: 22 }}
											className="rounded-2xl border border-dashed border-border bg-card p-6 text-center"
										>
											<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
												<PiBrain className="h-5 w-5 text-muted-foreground" />
											</div>
											<p className="text-sm font-medium text-foreground">
												No symptoms selected
											</p>
											<p className="mt-1 text-xs text-muted-foreground">
												Use the quick-select tags or describe your symptoms in the
												text field.
											</p>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Project attribution */}
								<motion.div
									variants={fadeUp}
									className="rounded-2xl border border-border bg-card p-4"
								>
									<div className="flex items-center gap-3">
										<Image
											src="/icons/android-chrome-192x192.png"
											alt="CuraSync"
											width={32}
											height={32}
											className="rounded-xl"
										/>
										<div>
											<p className="text-xs font-bold text-foreground">CuraSync</p>
											<p className="font-mono text-[10px] text-muted-foreground">
												UTHM Final Year Project · 2025/2026
											</p>
										</div>
									</div>
									<p className="mt-3 font-mono text-[11px] leading-5 text-muted-foreground">
										Pilot: Klinik Al-Fattah, Batu Pahat. AI + Blockchain + IoT
										healthcare platform.
									</p>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
