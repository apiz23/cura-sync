"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
	Activity,
	ArrowRight,
	Calendar,
	ClipboardList,
	Pill,
} from "lucide-react";

import type { Appointment, Medication } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { EASE } from "@/hooks/use-motion-config";

type UserProfile = {
	full_name: string | null;
	patient_profile?: {
		date_of_birth?: string | null;
		gender?: string | null;
		blood_type?: string | null;
		allergies?: string | null;
		emergency_contact?: string | null;
	} | null;
};

type HealthSyncSnapshot = {
	id: string;
	syncedAt: string;
	rangeStart: string;
	rangeEnd: string;
	source: {
		platform: string;
		vendor: string;
		attribution: string;
	};
	summary: {
		sleepSessionsCount: number;
		totalSleepMinutes: number;
		averageHeartRateBpm: number | null;
		stepsCount: number;
	};
};

type DashboardState = {
	profile: UserProfile | null;
	appointments: Appointment[];
	medications: Medication[];
	healthSync: {
		latest: HealthSyncSnapshot | null;
		recent: HealthSyncSnapshot[];
		count: number;
	} | null;
};

type DashboardRequestResult<T> = {
	data: T;
	ok: boolean;
	label: string;
};

const emptyState: DashboardState = {
	profile: null,
	appointments: [],
	medications: [],
	healthSync: null,
};

export default function UserDashboardPage() {
	const router = useRouter();
	const { user, isLoaded } = useUser();
	const userId = user?.id ?? null;
	const [state, setState] = useState<DashboardState>(emptyState);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const userInitials = useMemo(() => {
		const first = user?.firstName?.trim() ?? "";
		const last = user?.lastName?.trim() ?? "";
		const fromClerk =
			((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "";
		if (fromClerk) return fromClerk;

		const fromProfile = (state.profile?.full_name ?? "")
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join("");

		return fromProfile || "GU";
	}, [state.profile?.full_name, user?.firstName, user?.lastName]);

	const userDisplayName =
		state.profile?.full_name ?? user?.fullName ?? user?.username ?? "User";

	useEffect(() => {
		if (!isLoaded || !userId) return;

		let cancelled = false;

		async function loadDashboard() {
			setLoading(true);
			setError(null);

			try {
				const syncRes = await fetch("/api/auth/sync", {
					method: "POST",
					cache: "no-store",
				});

				if (!syncRes.ok) {
					await syncRes.json().catch(() => null);
				}

				const [
					profileResult,
					appointmentsResult,
					medicationsResult,
					healthSyncResult,
				] = await Promise.all([
					loadDashboardResource<UserProfile | null>(
						"/api/user/profile",
						"profile"
					),
					loadDashboardResource<{ data?: Appointment[] }>(
						"/api/appointments",
						"appointments"
					),
					loadDashboardResource<Medication[]>(
						"/api/user/medications",
						"medications"
					),
					loadDashboardResource<{
						data?: DashboardState["healthSync"];
					}>("/api/user/health-sync?days=7", "health sync"),
				]);

				const failedSources = [
					profileResult,
					appointmentsResult,
					medicationsResult,
					healthSyncResult,
				]
					.filter((result) => !result.ok)
					.map((result) => result.label);

				if (!cancelled) {
					setState({
						profile: profileResult.data,
						appointments: Array.isArray(appointmentsResult.data?.data)
							? appointmentsResult.data.data
							: [],
						medications: Array.isArray(medicationsResult.data)
							? medicationsResult.data
							: [],
						healthSync: healthSyncResult.data?.data ?? null,
					});

					setError(
						failedSources.length
							? `Some dashboard sections could not be loaded: ${failedSources.join(", ")}.`
							: null
					);
				}
			} catch (err) {
				console.error("Failed to load user dashboard", err);
				if (!cancelled) {
					setError("Unable to load your dashboard right now.");
					setState(emptyState);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadDashboard();

		return () => {
			cancelled = true;
		};
	}, [isLoaded, userId]);

	const todayIso = new Date().toISOString().slice(0, 10);

	const upcomingAppointments = useMemo(
		() =>
			state.appointments
				.filter(
					(appointment) =>
						appointment.appointment_date >= todayIso &&
						appointment.status !== "CANCELLED"
				)
				.sort((a, b) =>
					`${a.appointment_date}T${a.start_time}`.localeCompare(
						`${b.appointment_date}T${b.start_time}`
					)
				),
		[state.appointments, todayIso]
	);

	const nextAppointment = upcomingAppointments[0] ?? null;
	const activeMedications = state.medications.filter(
		(medication) => medication.status === "ACTIVE"
	);
	const completedMedications = state.medications.filter(
		(medication) => medication.status === "COMPLETED"
	);
	const latestHealthSync = state.healthSync?.latest ?? null;
	const recentHealthSync = state.healthSync?.recent ?? [];
	const syncedSleepHours = latestHealthSync
		? (latestHealthSync.summary.totalSleepMinutes / 60).toFixed(1)
		: null;

	const profileFields = [
		state.profile?.full_name?.trim(),
		state.profile?.patient_profile?.date_of_birth,
		state.profile?.patient_profile?.gender,
		state.profile?.patient_profile?.blood_type,
		state.profile?.patient_profile?.emergency_contact?.trim(),
	];
	const completedProfileFields = profileFields.filter(Boolean).length;
	const profileCompletion = Math.round(
		(completedProfileFields / profileFields.length) * 100
	);

	const activityItems = [
		...upcomingAppointments.slice(0, 2).map((appointment) => ({
			title: `Appointment with ${appointment.facility_name}`,
			detail: `${formatDate(appointment.appointment_date)} at ${formatTime(appointment.start_time)}`,
			date: formatDate(appointment.appointment_date),
			badge: appointment.status,
			href: "/user/appointments",
			icon: Calendar,
		})),
		...activeMedications.slice(0, 2).map((medication) => ({
			title: medication.name,
			detail: [medication.dosage, medication.frequency].join(" | "),
			date: "",
			badge: medication.status,
			href: "/user/medications",
			icon: Pill,
		})),
	].slice(0, 4);

	if (!loading && isLoaded && userId && state.profile === null) {
		router.replace("/user/profile?setup=true");
		return null;
	}

	const metricCards = [
		{
			title: "Upcoming Appointments",
			value: String(upcomingAppointments.length),
			description: nextAppointment
				? `Next: ${formatDate(nextAppointment.appointment_date)}`
				: "None scheduled",
			icon: Calendar,
		},
		{
			title: "Active Medications",
			value: String(activeMedications.length),
			description: activeMedications.length
				? `${completedMedications.length} completed`
				: "No active medications",
			icon: Pill,
		},
		{
			title: "Profile Completion",
			value: `${profileCompletion}%`,
			description: "Keep profile complete for safer care",
			icon: ClipboardList,
		},
		{
			title: "Health Connect",
			value: latestHealthSync
				? latestHealthSync.summary.stepsCount.toLocaleString()
				: "Off",
			description: latestHealthSync
				? `Last sync ${formatRelativeDateTime(latestHealthSync.syncedAt)}`
				: "Sync from mobile app",
			icon: Activity,
		},
	];

	return (
		<UserPageShell>
			{/* Header */}
			{loading ? (
				<div className="space-y-3 pb-5 border-b border-border/50">
					<Skeleton className="h-3 w-32" />
					<Skeleton className="h-7 w-64" />
					<Skeleton className="h-4 w-96 max-w-full" />
				</div>
			) : (
				<UserPageHeader
					sectionLabel="Overview"
					title="Dashboard"
					description={`Welcome back, ${userDisplayName}. Your appointments, medications, and health data.`}
					meta={
						<>
							<span className="font-mono text-xs text-muted-foreground">
								{upcomingAppointments.length} upcoming
							</span>
							<span className="text-muted-foreground/40">·</span>
							<span className="font-mono text-xs text-muted-foreground">
								{activeMedications.length} active medications
							</span>
						</>
					}
				/>
			)}

			{error && (
				<div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
					<p className="text-sm text-destructive">{error}</p>
					<Link href="/user/profile">
						<Button variant="outline" size="sm">
							Open profile
						</Button>
					</Link>
				</div>
			)}

			{/* Onboarding tip for first-time users */}
			{!loading && activityItems.length === 0 && state.appointments.length === 0 && (
				<div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-5">
					<p className="text-sm font-medium text-foreground">Welcome to CuraSync</p>
					<p className="mt-1 text-sm text-muted-foreground">
						To get started, book an appointment or add your medications from the sidebar.
					</p>
				</div>
			)}

			{/* Metric strip */}
			<div className="grid grid-cols-2 divide-x divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-card/60 lg:grid-cols-4 lg:divide-y-0">
				{metricCards.map((card, i) => (
					<motion.div
						key={card.title}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, delay: 0.08 + i * 0.06, ease: EASE }}
					>
						<SummaryCard
							title={card.title}
							value={card.value}
							description={card.description}
							icon={card.icon}
						/>
					</motion.div>
				))}
			</div>

			{/* Recent Activity */}
				<div>
					<p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
						Recent Activity
					</p>
					<div className="h-px bg-border/50 mb-4" />
					<div>
						{activityItems.length ? (
							activityItems.map((item, i) => (
								<motion.div
									key={`${item.title}-${item.detail}`}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.35,
										delay: 0.2 + i * 0.05,
										ease: EASE,
									}}
								>
									<Link
										href={item.href}
										className="flex items-center gap-4 border-b border-border/70 py-3.5 transition-colors hover:bg-muted/20 last:border-0"
									>
										{item.date && (
											<span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0 truncate">
												{item.date}
											</span>
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground truncate">
												{item.title}
											</p>
											<p className="text-xs text-muted-foreground truncate">
												{item.detail}
											</p>
										</div>
										<Badge variant="outline" className="shrink-0 text-xs">
											{item.badge}
										</Badge>
									</Link>
								</motion.div>
							))
						) : (
							<EmptyState
								title="Nothing to show yet"
								description="Book your first appointment or add medications to populate this dashboard."
								href="/user/appointments"
								action="Browse facilities"
							/>
						)}
					</div>
					<div className="mt-4">
						<Link href="/user/appointments">
							<Button
								variant="ghost"
								size="sm"
								className="gap-2 text-xs text-muted-foreground hover:text-foreground"
							>
								View all appointments{" "}
								<ArrowRight className="h-3.5 w-3.5" />
							</Button>
						</Link>
					</div>
				</div>

			{/* Wearable + Care Summary */}
			<div className="rounded-xl border border-border/60 bg-card/60">
				<div className="flex border-b border-border/50">
					<p className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
						Health Overview
					</p>
				</div>
				<div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-border/70">
					{/* Wearable snapshot */}
					<div className="px-6 py-5">
						<p className="mb-4 text-sm font-semibold text-foreground">
							Wearable snapshot
						</p>
						{[
							{
								label: "Last sync",
								value: latestHealthSync
									? formatRelativeDateTime(latestHealthSync.syncedAt)
									: "Not synced",
							},
							{
								label: "Steps",
								value: latestHealthSync
									? latestHealthSync.summary.stepsCount.toLocaleString()
									: "0",
							},
							{
								label: "Sleep",
								value: latestHealthSync
									? `${syncedSleepHours ?? "0.0"} hours`
									: "0 hours",
							},
							{
								label: "Avg heart rate",
								value:
									latestHealthSync?.summary.averageHeartRateBpm != null
										? `${latestHealthSync.summary.averageHeartRateBpm} bpm`
										: "No samples",
							},
							{
								label: "Total uploads",
								value: String(state.healthSync?.count ?? 0),
							},
						].map((row) => (
							<SummaryRow key={row.label} label={row.label} value={row.value} />
						))}

						{recentHealthSync.length > 0 && (
							<div className="mt-4">
								<p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
									Recent uploads
								</p>
								{recentHealthSync.slice(0, 3).map((snapshot) => (
									<div
										key={snapshot.id}
										className="flex items-center justify-between gap-4 border-b border-border/70 py-2.5 last:border-0"
									>
										<div className="min-w-0">
											<p className="truncate text-xs font-medium text-foreground">
												{formatRelativeDateTime(snapshot.syncedAt)}
											</p>
											<p className="truncate text-xs text-muted-foreground">
												{snapshot.source?.attribution ?? "Health Connect"}
											</p>
										</div>
										<div className="shrink-0 text-right">
											<p className="font-mono text-xs text-foreground">
												{formatInteger(snapshot.summary.stepsCount)} steps
											</p>
											<p className="font-mono text-xs text-muted-foreground">
												{formatSleepHours(snapshot.summary.totalSleepMinutes)}h sleep
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Care summary */}
					<div className="px-6 py-5">
						<p className="mb-4 text-sm font-semibold text-foreground">
							Care summary
						</p>
						{[
							{
								label: "Next appointment",
								value: nextAppointment
									? `${formatDate(nextAppointment.appointment_date)}, ${formatTime(nextAppointment.start_time)}`
									: "Not scheduled",
							},
							{
								label: "Medication records",
								value: String(state.medications.length),
							},
							{
								label: "Allergies recorded",
								value: state.profile?.patient_profile?.allergies
									? "Yes"
									: "Not added",
							},
							{
								label: "Emergency contact",
								value:
									state.profile?.patient_profile?.emergency_contact ??
									"Missing",
							},
							{
								label: "Wearable sync",
								value: latestHealthSync
									? formatDateTime(latestHealthSync.syncedAt)
									: "Not connected",
							},
						].map((row) => (
							<SummaryRow key={row.label} label={row.label} value={row.value} />
						))}
					</div>
				</div>
			</div>
		</UserPageShell>
	);
}

async function loadDashboardResource<T>(
	url: string,
	label: string
): Promise<DashboardRequestResult<T>> {
	try {
		const response = await fetch(url, { cache: "no-store" });
		const data = (await response.json().catch(() => null)) as T;

		if (!response.ok) {
			console.error(`Dashboard ${label} request failed`, {
				status: response.status,
				data,
			});
		}

		return { data, ok: response.ok, label };
	} catch (error) {
		console.error(`Dashboard ${label} request threw`, error);
		return { data: null as T, ok: false, label };
	}
}

function SummaryCard({
	title,
	value,
	description,
	icon: Icon,
}: {
	title: string;
	value: string;
	description: string;
	icon: typeof Activity;
}) {
	return (
		<div className="flex flex-col gap-1 px-6 py-5">
			<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
				{title}
			</p>
			<p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
				{value}
			</p>
			<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
			<Icon className="mt-2 h-3.5 w-3.5 text-muted-foreground/50" />
		</div>
	);
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 last:border-0">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span className="text-right text-sm font-medium text-foreground">
				{value}
			</span>
		</div>
	);
}

function EmptyState({
	title,
	description,
	href,
	action,
}: {
	title: string;
	description: string;
	href: string;
	action: string;
}) {
	return (
		<div className="py-8 text-center">
			<p className="font-medium text-foreground">{title}</p>
			<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
				{description}
			</p>
			<Link href={href} className="mt-4 inline-flex">
				<Button variant="outline" size="sm">
					{action}
				</Button>
			</Link>
		</div>
	);
}

function formatInteger(value: unknown) {
	const asNumber = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(asNumber)) return "0";
	return Math.round(asNumber).toLocaleString();
}

function formatSleepHours(totalSleepMinutes: unknown) {
	const minutes =
		typeof totalSleepMinutes === "number"
			? totalSleepMinutes
			: Number(totalSleepMinutes);
	if (!Number.isFinite(minutes) || minutes <= 0) return "0.0";
	return (minutes / 60).toFixed(1);
}

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatTime(time: string) {
	const [hours = "00", minutes = "00"] = time.split(":");
	const date = new Date();
	date.setHours(Number(hours), Number(minutes), 0, 0);

	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

function formatDateTime(value: string) {
	return new Date(value).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function formatRelativeDateTime(value: string) {
	const target = new Date(value);
	const diffMs = Date.now() - target.getTime();
	const diffHours = Math.round(diffMs / (1000 * 60 * 60));

	if (diffHours < 1) return "less than 1 hour ago";
	if (diffHours < 24)
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

	const diffDays = Math.round(diffHours / 24);
	if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

	return formatDateTime(value);
}
