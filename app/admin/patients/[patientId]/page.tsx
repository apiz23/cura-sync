"use client";

import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import {
	User,
	Mail,
	Phone,
	Calendar,
	Activity,
	UserCircle,
	Hash,
	Copy,
	Check,
	CalendarDays,
	UserCheck,
	MoreVertical,
	FileText,
	Stethoscope,
	Pill,
	History,
	Heart,
	AlertCircle,
	Clipboard,
	Clock,
	MapPin,
	Edit,
	Printer,
	ArrowLeft,
	Scissors,
	AlertTriangle,
	Plus,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import MedicationCard from "./medication-card";
import { Medication } from "@/app/types";
import AddMedicationSheet from "./add-medication-sheet";
import { useAuth } from "@/components/authprovideradmin";
import {
	calculatePatientAge,
	calculatePatientBmi,
	formatPatientDate,
} from "@/lib/patient-profile";
import {
	PatientHealthView,
	type HealthSyncSnapshot,
} from "@/components/patient-health-view";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Patient {
	id: string;
	email: string;
	full_name: string | null;
	role: string;
	avatar_url: string | null;
	phone_number: string | null;
	created_at: string;
	status?: string;
	last_login?: string;
	date_of_birth?: string;
	gender?: string;
	address?: string;
	blood_type?: string;
	height_cm?: number;
	weight_kg?: number;
	allergies?: string;
	chronic_conditions?: string;
}

type MedCondition = {
	id: string;
	name: string;
	status: "ACTIVE" | "RESOLVED" | "CHRONIC";
	severity: "MILD" | "MODERATE" | "SEVERE" | null;
	onset_date: string | null;
	resolved_date: string | null;
	notes: string | null;
};

type MedAllergy = {
	id: string;
	allergen: string;
	reaction: string | null;
	severity: "MILD" | "MODERATE" | "SEVERE" | null;
	status: "ACTIVE" | "RESOLVED";
	notes: string | null;
};

type MedProcedure = {
	id: string;
	name: string;
	procedure_date: string | null;
	facility_name: string | null;
	outcome: string | null;
	notes: string | null;
};

type MedEncounter = {
	id: string;
	encounter_type: "CLINIC" | "ER" | "HOSPITAL" | "TELEHEALTH";
	encounter_date: string;
	facility_name: string | null;
	provider_name: string | null;
	reason: string | null;
	diagnosis_summary: string | null;
	notes: string | null;
};

type MedicalRecordsData = {
	conditions: MedCondition[];
	allergies: MedAllergy[];
	procedures: MedProcedure[];
	encounters: MedEncounter[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(value: string | null) {
	if (!value) return "—";
	return new Date(value).toLocaleDateString("en-MY", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function severityClass(severity: string | null) {
	if (severity === "SEVERE") return "text-destructive";
	if (severity === "MODERATE") return "text-warning-foreground";
	return "text-muted-foreground";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatientDetailPage() {
	const params = useParams<{ patientId: string }>();
	const patientId = params.patientId;
	const [patient, setPatient] = useState<Patient | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [medications, setMedications] = useState<Medication[]>([]);
	const [medLoading, setMedLoading] = useState(false);
	const [medicalRecords, setMedicalRecords] = useState<MedicalRecordsData | null>(null);
	const [medicalLoading, setMedicalLoading] = useState(false);
	const [healthSnapshots, setHealthSnapshots] = useState<HealthSyncSnapshot[]>([]);
	const [healthLatest, setHealthLatest] = useState<HealthSyncSnapshot | null>(null);
	const [healthLoading, setHealthLoading] = useState(false);
	const { user } = useAuth();
	const router = useRouter();

	const staffId = user?.id ?? null;
	const staffName = user?.full_name || user?.email || "Unknown User";
	const canManage = user?.role === "doctor" || user?.role === "admin";

	const medsControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function fetchPatient() {
			setLoading(true);
			setPatient(null);
			setMedications([]);

			try {
				const res = await fetch(`/api/patients/${patientId}`, {
					cache: "no-store",
					signal: controller.signal,
				});

				if (!res.ok) {
					setPatient(null);
					return;
				}

				const data = await res.json().catch(() => null);
				if (!controller.signal.aborted) {
					setPatient(data);
				}
			} catch (err) {
				if (!controller.signal.aborted) {
					console.error("Failed to fetch patient", err);
					setPatient(null);
				}
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		}

		fetchPatient();
		return () => controller.abort();
	}, [patientId]);

	const fetchMedications = useCallback(async () => {
		medsControllerRef.current?.abort();
		const controller = new AbortController();
		medsControllerRef.current = controller;

		setMedLoading(true);
		setMedications([]);

		try {
			const res = await fetch(
				`/api/medications?profile_id=${encodeURIComponent(patientId)}`,
				{ cache: "no-store", signal: controller.signal },
			);

			const data = await res.json().catch(() => null);

			if (!res.ok) {
				setMedications([]);
				return;
			}

			const rows = Array.isArray(data) ? (data as Medication[]) : [];
			setMedications(rows.filter((m) => m?.profile_id === patientId));
		} catch (err) {
			if ((err as { name?: string })?.name !== "AbortError") {
				console.error("Failed to fetch medications", err);
				setMedications([]);
			}
		} finally {
			setMedLoading(false);
		}
	}, [patientId]);

	const fetchMedicalRecords = useCallback(async () => {
		setMedicalLoading(true);
		setMedicalRecords(null);
		try {
			const res = await fetch(`/api/patients/${patientId}/records`, { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to load records");
			const data = (await res.json()) as MedicalRecordsData;
			setMedicalRecords(data);
		} catch (err) {
			console.error("Failed to fetch medical records", err);
			setMedicalRecords({ conditions: [], allergies: [], procedures: [], encounters: [] });
		} finally {
			setMedicalLoading(false);
		}
	}, [patientId]);

	useEffect(() => {
		if (activeTab === "medication") fetchMedications();
	}, [activeTab, fetchMedications]);

	useEffect(() => {
		if (activeTab === "medical") void fetchMedicalRecords();
	}, [activeTab, fetchMedicalRecords]);

	useEffect(() => {
		if (activeTab !== "health") return;

		let cancelled = false;
		setHealthLoading(true);

		fetch(`/api/patients/${patientId}/health-sync?days=7`, { cache: "no-store" })
			.then((res) => res.json())
			.then((json) => {
				if (!cancelled) {
					setHealthSnapshots(json?.data?.recent ?? []);
					setHealthLatest(json?.data?.latest ?? null);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setHealthSnapshots([]);
					setHealthLatest(null);
				}
			})
			.finally(() => {
				if (!cancelled) setHealthLoading(false);
			});

		return () => { cancelled = true; };
	}, [activeTab, patientId]);

	useEffect(() => {
		return () => {
			medsControllerRef.current?.abort();
			medsControllerRef.current = null;
		};
	}, [patientId]);

	if (loading) return <PatientDetailSkeleton />;
	if (!patient) return notFound();

	const age = calculatePatientAge(patient.date_of_birth);
	const bmi = calculatePatientBmi(patient.height_cm, patient.weight_kg);

	return (
		<div className="min-h-screen bg-linear-to-b from-background to-muted/20 p-0">
			{/* Header Banner */}
			<div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b">
				<div className="px-4 md:px-6 py-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => router.push("/admin/patients")}
								className="rounded-full hover:bg-primary/10"
							>
								<ArrowLeft className="w-5 h-5" />
							</Button>

							<div className="relative">
								{patient.avatar_url ? (
									<div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg">
										<Image
											src={patient.avatar_url}
											alt={patient.full_name || "Patient"}
											width={80}
											height={80}
											className="object-cover"
										/>
									</div>
								) : (
									<div className="w-20 h-20 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 border-2 border-white flex items-center justify-center">
										<UserCircle className="w-10 h-10 text-primary" />
									</div>
								)}
							</div>
							<div>
								<h1 className="text-3xl font-bold text-foreground">
									{patient.full_name || "Unnamed Patient"}
								</h1>
								<div className="flex items-center gap-3 mt-2">
									<Badge variant="secondary" className="rounded-full">
										<Stethoscope className="w-3 h-3 mr-1.5" />
										Patient
									</Badge>
									{patient.status && (
										<Badge variant="outline" className="rounded-full">
											{patient.status}
										</Badge>
									)}
									<span className="text-sm text-muted-foreground flex items-center gap-1">
										<Clock className="w-3.5 h-3.5" />
										ID: {patient.id.slice(0, 8)}
									</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon">
										<MoreVertical className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										className="gap-2"
										onClick={() => setActiveTab("overview")}
									>
										<Edit className="w-4 h-4" />
										View Profile
									</DropdownMenuItem>
									<DropdownMenuItem
										className="gap-2"
										onClick={() => window.print()}
									>
										<Printer className="w-4 h-4" />
										Print Summary
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 md:px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column */}
					<div className="lg:col-span-1 space-y-6">
						<Card className="border-border/40">
							<CardContent className="p-6">
								<h3 className="font-semibold text-lg mb-4">Quick Info</h3>
								<div className="space-y-4">
									<InfoItem
										icon={Calendar}
										label="Age"
										value={age !== null ? `${age} years` : "N/A"}
									/>
									<InfoItem
										icon={UserCheck}
										label="Gender"
										value={patient.gender || "N/A"}
									/>
									{patient.date_of_birth && (
										<InfoItem
											icon={CalendarDays}
											label="Date of Birth"
											value={formatPatientDate(patient.date_of_birth)}
										/>
									)}
									<InfoItem
										icon={Clock}
										label="Member Since"
										value={new Date(patient.created_at).toLocaleDateString()}
									/>
									{patient.last_login && (
										<InfoItem
											icon={Activity}
											label="Last Login"
											value={new Date(patient.last_login).toLocaleDateString()}
										/>
									)}
								</div>
							</CardContent>
						</Card>

						<Card className="border-border/40">
							<CardContent className="p-6">
								<h3 className="font-semibold text-lg mb-4">Contact Info</h3>
								<div className="space-y-4">
									<ContactItem icon={Mail} label="Email" value={patient.email} />
									<ContactItem
										icon={Phone}
										label="Phone"
										value={patient.phone_number || "Not provided"}
									/>
									{patient.address && (
										<ContactItem icon={MapPin} label="Address" value={patient.address} />
									)}
								</div>
							</CardContent>
						</Card>

						{(patient.blood_type || patient.height_cm || patient.weight_kg) && (
							<Card className="border-border/40">
								<CardContent className="p-6">
									<h3 className="font-semibold text-lg mb-4">Health Stats</h3>
									<div className="space-y-4">
										{patient.blood_type && (
											<div className="flex items-center gap-3">
												<div className="p-2 bg-red-50 rounded-lg">
													<Heart className="w-4 h-4 text-red-600" />
												</div>
												<div>
													<p className="text-sm text-muted-foreground">Blood Type</p>
													<p className="font-medium">{patient.blood_type}</p>
												</div>
											</div>
										)}
										{patient.height_cm && (
											<div className="flex items-center gap-3">
												<div className="p-2 bg-blue-50 rounded-lg">
													<User className="w-4 h-4 text-blue-600" />
												</div>
												<div>
													<p className="text-sm text-muted-foreground">Height</p>
													<p className="font-medium">{patient.height_cm} cm</p>
												</div>
											</div>
										)}
										{patient.weight_kg && (
											<div className="flex items-center gap-3">
												<div className="p-2 bg-green-50 rounded-lg">
													<Activity className="w-4 h-4 text-green-600" />
												</div>
												<div>
													<p className="text-sm text-muted-foreground">Weight</p>
													<p className="font-medium">{patient.weight_kg} kg</p>
												</div>
											</div>
										)}
										{bmi && (
											<div className="flex items-center gap-3">
												<div className="p-2 bg-amber-50 rounded-lg">
													<Clipboard className="w-4 h-4 text-amber-600" />
												</div>
												<div>
													<p className="text-sm text-muted-foreground">BMI</p>
													<p className="font-medium">{bmi}</p>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Column */}
					<div className="lg:col-span-2 space-y-6">
						<div className="border-border/40 pt-0">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<div className="border-b overflow-x-auto">
									<TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0 h-14">
										<TabsTrigger
											value="overview"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-14 px-6"
										>
											<User className="w-4 h-4 mr-2" />
											Overview
										</TabsTrigger>
										<TabsTrigger
											value="medical"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-14 px-6"
										>
											<History className="w-4 h-4 mr-2" />
											Medical History
										</TabsTrigger>
										<TabsTrigger
											value="medication"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-14 px-6"
										>
											<Pill className="w-4 h-4 mr-2" />
											Medication
										</TabsTrigger>
										<TabsTrigger
											value="health"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-14 px-6"
										>
											<Activity className="w-4 h-4 mr-2" />
											Health
										</TabsTrigger>
									</TabsList>
								</div>

								<div className="p-6">
									{/* Overview */}
									<TabsContent value="overview" className="space-y-6">
										<div>
											<h3 className="font-semibold text-lg mb-4">Personal Information</h3>
											<h2 className="font-semibold text-md mb-4">Patient ID</h2>
											<CopyableId value={patient.id} />
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<InfoCard label="Full Name" value={patient.full_name} />
												<InfoCard label="Email" value={patient.email} />
												<InfoCard label="Phone" value={patient.phone_number} />
												<InfoCard
													label="Date of Birth"
													value={formatPatientDate(
														patient.date_of_birth,
														{ year: "numeric", month: "long", day: "numeric" },
														""
													)}
												/>
												<InfoCard label="Age" value={age !== null ? `${age} years` : null} />
												<InfoCard label="Gender" value={patient.gender} />
												<InfoCard label="Status" value={patient.status?.toUpperCase()} />
											</div>
										</div>

										<Separator />

										{(patient.allergies || patient.chronic_conditions) && (
											<div>
												<h3 className="font-semibold text-lg mb-4">Medical Conditions</h3>
												<div className="space-y-4">
													{patient.allergies && (
														<AlertBox
															icon={AlertCircle}
															title="Allergies"
															content={patient.allergies}
															type="warning"
														/>
													)}
													{patient.chronic_conditions && (
														<AlertBox
															icon={Activity}
															title="Chronic Conditions"
															content={patient.chronic_conditions}
															type="info"
														/>
													)}
												</div>
											</div>
										)}

										<Separator />

										<div>
											<h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
											<div className="space-y-4">
												<TimelineItem
													date={new Date(patient.created_at)}
													title="Account Created"
													description="Patient account was registered in the system"
													icon={<User className="w-4 h-4" />}
												/>
												{patient.last_login && (
													<TimelineItem
														date={new Date(patient.last_login)}
														title="Last Login"
														description="Patient last accessed their account"
														icon={<Activity className="w-4 h-4" />}
													/>
												)}
											</div>
										</div>
									</TabsContent>

									{/* Medical History */}
									<TabsContent value="medical">
										<div className="space-y-5">
											<div className="flex items-center justify-between gap-4">
												<h3 className="font-semibold text-lg">Medical History</h3>
												{canManage && (
													<AddMedicalRecordSheet
														patientId={patientId}
														onSuccess={() => void fetchMedicalRecords()}
													>
														<Button size="sm" className="gap-2">
															<Plus className="h-4 w-4" />
															Add Record
														</Button>
													</AddMedicalRecordSheet>
												)}
											</div>

											{medicalLoading ? (
												<div className="space-y-3">
													{[1, 2, 3].map((i) => (
														<Skeleton key={i} className="h-20 w-full rounded-xl" />
													))}
												</div>
											) : medicalRecords ? (
												<MedicalRecordsTabs records={medicalRecords} />
											) : null}
										</div>
									</TabsContent>

									{/* Medication */}
									<TabsContent value="medication" className="space-y-6">
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-semibold text-lg">Medications</h3>
												<p className="text-sm text-muted-foreground">
													{medications.length} medications recorded
												</p>
											</div>
											{staffId && canManage && (
												<AddMedicationSheet
													profileId={patientId}
													doctorName={staffName}
													onSuccess={fetchMedications}
												>
													<Button className="gap-2">
														<Pill className="h-4 w-4" />
														Add Medication
													</Button>
												</AddMedicationSheet>
											)}
										</div>

										{medLoading ? (
											<div className="space-y-4">
												{[1, 2, 3].map((i) => (
													<Skeleton key={i} className="h-24 w-full rounded-lg" />
												))}
											</div>
										) : medications.length > 0 ? (
											<div className="space-y-4">
												{medications.map((medication) => (
													<MedicationCard
														key={medication.id}
														medication={medication}
														canEdit={canManage}
														onUpdate={fetchMedications}
													/>
												))}
											</div>
										) : (
											<div className="text-center py-12">
												<Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
												<h3 className="text-lg font-medium mb-2">No Medications</h3>
												<p className="text-muted-foreground max-w-md mx-auto mb-6">
													No medications have been prescribed to this patient yet
												</p>
												{staffId && canManage && (
													<AddMedicationSheet
														profileId={patientId}
														doctorName={staffName}
														onSuccess={fetchMedications}
													>
														<Button className="gap-2">
															<Pill className="h-4 w-4" />
															Add First Medication
														</Button>
													</AddMedicationSheet>
												)}
											</div>
										)}
									</TabsContent>

									{/* Health */}
									<TabsContent value="health" className="space-y-4">
										<h3 className="font-semibold text-lg">Health Tracking</h3>
										{healthLoading ? (
											<div className="space-y-4">
												<div className="grid gap-4 sm:grid-cols-3">
													{[1, 2, 3].map((i) => (
														<Skeleton key={i} className="h-28 rounded-xl" />
													))}
												</div>
												<div className="grid gap-4 md:grid-cols-2">
													<Skeleton className="h-56 rounded-xl" />
													<Skeleton className="h-56 rounded-xl" />
												</div>
												<Skeleton className="h-56 rounded-xl" />
											</div>
										) : (
											<PatientHealthView
												snapshots={healthSnapshots}
												isAdminView={true}
												latestSyncedAt={healthLatest?.syncedAt ?? null}
												latestVendor={healthLatest?.source.vendor ?? null}
											/>
										)}
									</TabsContent>
								</div>
							</Tabs>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// ── Medical Records Tabs ───────────────────────────────────────────────────────

function MedicalRecordsTabs({ records }: { records: MedicalRecordsData }) {
	const total =
		records.conditions.length +
		records.allergies.length +
		records.procedures.length +
		records.encounters.length;

	if (total === 0) {
		return (
			<div className="rounded-xl border border-dashed p-8 text-center">
				<History className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
				<p className="font-medium text-foreground">No records yet</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Use &ldquo;Add Record&rdquo; to document conditions, allergies, procedures, or encounters.
				</p>
			</div>
		);
	}

	return (
		<Tabs defaultValue="conditions">
			<TabsList className="h-auto flex-wrap gap-1">
				<TabsTrigger value="conditions">
					Conditions
					{records.conditions.length > 0 && (
						<span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
							{records.conditions.length}
						</span>
					)}
				</TabsTrigger>
				<TabsTrigger value="allergies">
					Allergies
					{records.allergies.length > 0 && (
						<span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
							{records.allergies.length}
						</span>
					)}
				</TabsTrigger>
				<TabsTrigger value="procedures">
					Procedures
					{records.procedures.length > 0 && (
						<span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
							{records.procedures.length}
						</span>
					)}
				</TabsTrigger>
				<TabsTrigger value="encounters">
					Encounters
					{records.encounters.length > 0 && (
						<span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
							{records.encounters.length}
						</span>
					)}
				</TabsTrigger>
			</TabsList>

			<TabsContent value="conditions" className="mt-4 space-y-3">
				{records.conditions.length === 0 ? (
					<MedEmptyState label="conditions" />
				) : (
					records.conditions.map((c) => (
						<div key={c.id} className="rounded-xl border border-border bg-card p-4">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<Stethoscope className="h-4 w-4" />
									</div>
									<div>
										<p className="font-semibold text-foreground">{c.name}</p>
										{c.onset_date && (
											<p className="text-xs text-muted-foreground">
												Since {formatDate(c.onset_date)}
												{c.resolved_date ? ` · Resolved ${formatDate(c.resolved_date)}` : null}
											</p>
										)}
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge variant={c.status === "ACTIVE" ? "destructive" : c.status === "CHRONIC" ? "secondary" : "outline"}>
										{c.status}
									</Badge>
									{c.severity && (
										<Badge variant="outline" className={severityClass(c.severity)}>
											{c.severity}
										</Badge>
									)}
								</div>
							</div>
							{c.notes && <p className="mt-3 text-sm text-muted-foreground">{c.notes}</p>}
						</div>
					))
				)}
			</TabsContent>

			<TabsContent value="allergies" className="mt-4 space-y-3">
				{records.allergies.length === 0 ? (
					<MedEmptyState label="allergies" />
				) : (
					records.allergies.map((a) => (
						<div key={a.id} className="rounded-xl border border-border bg-card p-4">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
										<AlertTriangle className="h-4 w-4" />
									</div>
									<div>
										<p className="font-semibold text-foreground">{a.allergen}</p>
										{a.reaction && (
											<p className="text-xs text-muted-foreground">Reaction: {a.reaction}</p>
										)}
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge variant={a.status === "ACTIVE" ? "destructive" : "outline"}>
										{a.status}
									</Badge>
									{a.severity && (
										<Badge variant="outline" className={severityClass(a.severity)}>
											{a.severity}
										</Badge>
									)}
								</div>
							</div>
							{a.notes && <p className="mt-3 text-sm text-muted-foreground">{a.notes}</p>}
						</div>
					))
				)}
			</TabsContent>

			<TabsContent value="procedures" className="mt-4 space-y-3">
				{records.procedures.length === 0 ? (
					<MedEmptyState label="procedures" />
				) : (
					records.procedures.map((p) => (
						<div key={p.id} className="rounded-xl border border-border bg-card p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Scissors className="h-4 w-4" />
								</div>
								<div>
									<p className="font-semibold text-foreground">{p.name}</p>
									<p className="text-xs text-muted-foreground">
										{p.procedure_date ? formatDate(p.procedure_date) : "Date unknown"}
										{p.facility_name ? ` · ${p.facility_name}` : null}
									</p>
								</div>
							</div>
							{p.outcome && (
								<p className="mt-3 text-sm text-muted-foreground">
									<span className="font-medium text-foreground">Outcome: </span>
									{p.outcome}
								</p>
							)}
							{p.notes && <p className="mt-1 text-sm text-muted-foreground">{p.notes}</p>}
						</div>
					))
				)}
			</TabsContent>

			<TabsContent value="encounters" className="mt-4 space-y-3">
				{records.encounters.length === 0 ? (
					<MedEmptyState label="encounters" />
				) : (
					records.encounters.map((e) => (
						<div key={e.id} className="rounded-xl border border-border bg-card p-4">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<CalendarDays className="h-4 w-4" />
									</div>
									<div>
										<p className="font-semibold text-foreground">{e.reason ?? "Visit"}</p>
										<p className="text-xs text-muted-foreground">
											{formatDate(e.encounter_date)}
											{e.facility_name ? ` · ${e.facility_name}` : null}
											{e.provider_name ? ` · ${e.provider_name}` : null}
										</p>
									</div>
								</div>
								<Badge variant="outline">{e.encounter_type}</Badge>
							</div>
							{e.diagnosis_summary && (
								<p className="mt-3 text-sm text-muted-foreground">
									<span className="font-medium text-foreground">Diagnosis: </span>
									{e.diagnosis_summary}
								</p>
							)}
							{e.notes && <p className="mt-1 text-sm text-muted-foreground">{e.notes}</p>}
						</div>
					))
				)}
			</TabsContent>
		</Tabs>
	);
}

function MedEmptyState({ label }: { label: string }) {
	return (
		<div className="rounded-xl border border-dashed p-6 text-center">
			<p className="text-sm font-medium text-muted-foreground">No {label} on record</p>
		</div>
	);
}

// ── Add Medical Record Sheet ──────────────────────────────────────────────────

type RecordType = "condition" | "allergy" | "procedure" | "encounter";

function AddMedicalRecordSheet({
	patientId,
	onSuccess,
	children,
}: {
	patientId: string;
	onSuccess: () => void;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [recordType, setRecordType] = useState<RecordType>("condition");
	const [fields, setFields] = useState<Record<string, string>>({});

	function field(name: string, value: string) {
		setFields((prev) => ({ ...prev, [name]: value }));
	}

	function reset() {
		setRecordType("condition");
		setFields({});
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch(`/api/patients/${patientId}/records`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ record_type: recordType, ...fields }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null) as { error?: string } | null;
				throw new Error(err?.error ?? "Failed to add record");
			}
			toast.success("Record added successfully");
			setOpen(false);
			reset();
			onSuccess();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent className="w-full sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Add Medical Record</SheetTitle>
				</SheetHeader>

				<form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-5">
					<div className="space-y-2">
						<Label>Record type</Label>
						<Select
							value={recordType}
							onValueChange={(v) => { setRecordType(v as RecordType); setFields({}); }}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="condition">Condition</SelectItem>
								<SelectItem value="allergy">Allergy</SelectItem>
								<SelectItem value="procedure">Procedure</SelectItem>
								<SelectItem value="encounter">Encounter</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{recordType === "condition" && (
						<>
							<div className="space-y-2">
								<Label>Condition name *</Label>
								<Input
									required
									placeholder="e.g. Type 2 Diabetes"
									value={fields.name ?? ""}
									onChange={(e) => field("name", e.target.value)}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label>Status</Label>
									<Select value={fields.status ?? "ACTIVE"} onValueChange={(v) => field("status", v)}>
										<SelectTrigger><SelectValue /></SelectTrigger>
										<SelectContent>
											<SelectItem value="ACTIVE">Active</SelectItem>
											<SelectItem value="CHRONIC">Chronic</SelectItem>
											<SelectItem value="RESOLVED">Resolved</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Severity</Label>
									<Select value={fields.severity ?? ""} onValueChange={(v) => field("severity", v)}>
										<SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
										<SelectContent>
											<SelectItem value="MILD">Mild</SelectItem>
											<SelectItem value="MODERATE">Moderate</SelectItem>
											<SelectItem value="SEVERE">Severe</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Onset date</Label>
								<Input
									type="date"
									value={fields.onset_date ?? ""}
									onChange={(e) => field("onset_date", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Notes</Label>
								<Textarea
									rows={3}
									placeholder="Additional notes..."
									value={fields.notes ?? ""}
									onChange={(e) => field("notes", e.target.value)}
								/>
							</div>
						</>
					)}

					{recordType === "allergy" && (
						<>
							<div className="space-y-2">
								<Label>Allergen *</Label>
								<Input
									required
									placeholder="e.g. Penicillin"
									value={fields.allergen ?? ""}
									onChange={(e) => field("allergen", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Reaction</Label>
								<Input
									placeholder="e.g. Rash, anaphylaxis"
									value={fields.reaction ?? ""}
									onChange={(e) => field("reaction", e.target.value)}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label>Severity</Label>
									<Select value={fields.severity ?? ""} onValueChange={(v) => field("severity", v)}>
										<SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
										<SelectContent>
											<SelectItem value="MILD">Mild</SelectItem>
											<SelectItem value="MODERATE">Moderate</SelectItem>
											<SelectItem value="SEVERE">Severe</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Status</Label>
									<Select value={fields.status ?? "ACTIVE"} onValueChange={(v) => field("status", v)}>
										<SelectTrigger><SelectValue /></SelectTrigger>
										<SelectContent>
											<SelectItem value="ACTIVE">Active</SelectItem>
											<SelectItem value="RESOLVED">Resolved</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Notes</Label>
								<Textarea
									rows={3}
									placeholder="Additional notes..."
									value={fields.notes ?? ""}
									onChange={(e) => field("notes", e.target.value)}
								/>
							</div>
						</>
					)}

					{recordType === "procedure" && (
						<>
							<div className="space-y-2">
								<Label>Procedure name *</Label>
								<Input
									required
									placeholder="e.g. Appendectomy"
									value={fields.name ?? ""}
									onChange={(e) => field("name", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Date</Label>
								<Input
									type="date"
									value={fields.procedure_date ?? ""}
									onChange={(e) => field("procedure_date", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Facility</Label>
								<Input
									placeholder="e.g. Klinik Al-Fattah"
									value={fields.facility_name ?? ""}
									onChange={(e) => field("facility_name", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Outcome</Label>
								<Input
									placeholder="e.g. Successful, no complications"
									value={fields.outcome ?? ""}
									onChange={(e) => field("outcome", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Notes</Label>
								<Textarea
									rows={3}
									placeholder="Additional notes..."
									value={fields.notes ?? ""}
									onChange={(e) => field("notes", e.target.value)}
								/>
							</div>
						</>
					)}

					{recordType === "encounter" && (
						<>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label>Type *</Label>
									<Select value={fields.encounter_type ?? "CLINIC"} onValueChange={(v) => field("encounter_type", v)}>
										<SelectTrigger><SelectValue /></SelectTrigger>
										<SelectContent>
											<SelectItem value="CLINIC">Clinic</SelectItem>
											<SelectItem value="ER">ER</SelectItem>
											<SelectItem value="HOSPITAL">Hospital</SelectItem>
											<SelectItem value="TELEHEALTH">Telehealth</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Date</Label>
									<Input
										type="date"
										value={fields.encounter_date ?? ""}
										onChange={(e) => field("encounter_date", e.target.value)}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Facility</Label>
								<Input
									placeholder="e.g. Klinik Al-Fattah"
									value={fields.facility_name ?? ""}
									onChange={(e) => field("facility_name", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Provider</Label>
								<Input
									placeholder="e.g. Dr. Ahmad"
									value={fields.provider_name ?? ""}
									onChange={(e) => field("provider_name", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Reason</Label>
								<Input
									placeholder="Chief complaint or reason for visit"
									value={fields.reason ?? ""}
									onChange={(e) => field("reason", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Diagnosis summary</Label>
								<Textarea
									rows={3}
									placeholder="Summary of findings or diagnosis..."
									value={fields.diagnosis_summary ?? ""}
									onChange={(e) => field("diagnosis_summary", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Notes</Label>
								<Textarea
									rows={2}
									placeholder="Additional notes..."
									value={fields.notes ?? ""}
									onChange={(e) => field("notes", e.target.value)}
								/>
							</div>
						</>
					)}

					<Button type="submit" className="w-full" disabled={submitting}>
						{submitting ? "Saving..." : "Save Record"}
					</Button>
				</form>
			</SheetContent>
		</Sheet>
	);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PatientDetailSkeleton() {
	return (
		<div className="min-h-screen p-0">
			<div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b py-8">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="flex items-center gap-4">
						<Skeleton className="w-20 h-20 rounded-xl" />
						<div className="space-y-3">
							<Skeleton className="h-8 w-64" />
							<div className="flex gap-2">
								<Skeleton className="h-6 w-24 rounded-full" />
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="space-y-6">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-64 rounded-lg" />
						))}
					</div>
					<div className="lg:col-span-2 space-y-6">
						<Skeleton className="h-12 w-full rounded-lg" />
						<Skeleton className="h-96 w-full rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
}

function InfoItem({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center justify-between py-2">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-muted rounded-lg">
					<Icon className="w-4 h-4 text-muted-foreground" />
				</div>
				<span className="text-sm text-muted-foreground">{label}</span>
			</div>
			<span className="font-medium">{value}</span>
		</div>
	);
}

function ContactItem({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="p-2 bg-muted rounded-lg">
				<Icon className="w-4 h-4 text-muted-foreground" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm text-muted-foreground mb-1">{label}</p>
				<p className="font-medium truncate">{value}</p>
			</div>
		</div>
	);
}

function CopyableId({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	return (
		<div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border mb-4">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-primary/10 rounded-lg">
					<Hash className="w-4 h-4 text-primary" />
				</div>
				<div className="min-w-0">
					<p className="text-sm text-muted-foreground mb-1 truncate">Patient ID</p>
					<code className="text-sm font-mono truncate block">{value}</code>
				</div>
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					navigator.clipboard.writeText(value);
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				}}
				className="gap-2"
			>
				{copied ? (
					<><Check className="w-3.5 h-3.5" />Copied</>
				) : (
					<><Copy className="w-3.5 h-3.5" />Copy</>
				)}
			</Button>
		</div>
	);
}

function InfoCard({ label, value }: { label: string; value?: string | null }) {
	if (!value) return null;
	return (
		<div className="p-4 bg-muted/20 rounded-lg">
			<p className="text-sm text-muted-foreground mb-1">{label}</p>
			<p className="font-medium">{value}</p>
		</div>
	);
}

function AlertBox({
	icon: Icon,
	title,
	content,
	type = "info",
}: {
	icon: React.ElementType;
	title: string;
	content: string;
	type?: "info" | "warning" | "danger";
}) {
	const colors = {
		info: "bg-blue-50 text-blue-700 border-blue-200",
		warning: "bg-amber-50 text-amber-700 border-amber-200",
		danger: "bg-red-50 text-red-700 border-red-200",
	};

	return (
		<div className={`p-4 rounded-lg border ${colors[type]}`}>
			<div className="flex items-start gap-3">
				<Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
				<div>
					<h4 className="font-medium mb-1">{title}</h4>
					<p className="text-sm opacity-90">{content}</p>
				</div>
			</div>
		</div>
	);
}

function TimelineItem({
	date,
	title,
	description,
	icon,
}: {
	date: Date;
	title: string;
	description: string;
	icon: React.ReactNode;
}) {
	return (
		<div className="flex items-start gap-4">
			<div className="p-2 bg-primary/10 rounded-lg">
				<div className="text-primary">{icon}</div>
			</div>
			<div className="flex-1">
				<div className="flex items-center justify-between mb-1">
					<h4 className="font-medium">{title}</h4>
					<span className="text-xs text-muted-foreground">
						{date.toLocaleDateString()} at{" "}
						{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</span>
				</div>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</div>
	);
}
