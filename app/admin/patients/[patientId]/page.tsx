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
	Share2,
	Printer,
	Download,
	Bell,
	MessageSquare,
	ArrowLeft,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import MedicationCard from "./medication-card";
import { Medication } from "@/app/types";
import AddMedicationSheet from "./add-medication-sheet";
import { useAuth } from "@/components/authprovideradmin";
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

export default function PatientDetailPage() {
	const params = useParams<{ patientId: string }>();
	const patientId = params.patientId;
	const [patient, setPatient] = useState<Patient | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [medications, setMedications] = useState<Medication[]>([]);
	const [medLoading, setMedLoading] = useState(false);
	const [healthSnapshots, setHealthSnapshots] = useState<HealthSyncSnapshot[]>([]);
	const [healthLatest, setHealthLatest] = useState<HealthSyncSnapshot | null>(null);
	const [healthLoading, setHealthLoading] = useState(false);
	const { user } = useAuth();
	const router = useRouter();

	const staffId = user?.id ?? null;
	const staffName = user?.full_name || user?.email || "Unknown User";
	const canManagePrescriptions =
		user?.role === "doctor" || user?.role === "admin";

	const medsControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function fetchPatient() {
			setLoading(true);
			setPatient(null);
			// Prevent "previous patient's meds" flashing when navigating quickly.
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
		// Keep this callable for "Add Medication -> refresh" but make it deterministic by id.
		// Abort any previous request so older responses can't overwrite the latest patient.
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
			// Extra safety: never render meds that don't belong to this patient.
			setMedications(rows.filter((m) => m?.profile_id === patientId));
		} catch (err) {
			if ((err as any)?.name !== "AbortError") {
				console.error("Failed to fetch medications", err);
				setMedications([]);
			}
		} finally {
			setMedLoading(false);
		}
	}, [patientId]);

	useEffect(() => {
		if (activeTab === "medication") {
			fetchMedications();
		}
	}, [activeTab, fetchMedications]);

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

		return () => {
			cancelled = true;
		};
	}, [activeTab, patientId]);

	useEffect(() => {
		// If user navigates to another patient while on the meds tab, cancel the old request.
		return () => {
			medsControllerRef.current?.abort();
			medsControllerRef.current = null;
		};
	}, [patientId]);

	const calculateAge = (dateOfBirth?: string) => {
		if (!dateOfBirth) return null;
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}
		return age;
	};

	const calculateBMI = () => {
		if (!patient?.height_cm || !patient?.weight_kg) return null;
		const heightM = patient.height_cm / 100;
		return (patient.weight_kg / (heightM * heightM)).toFixed(1);
	};

	if (loading) {
		return <PatientDetailSkeleton />;
	}

	if (!patient) {
		return notFound();
	}

	const age = calculateAge(patient.date_of_birth);
	const bmi = calculateBMI();

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
							<Button variant="outline" size="sm" className="gap-2">
								<MessageSquare className="w-4 h-4" />
								Message
							</Button>
							<Button variant="outline" size="sm" className="gap-2">
								<Bell className="w-4 h-4" />
								Notify
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon">
										<MoreVertical className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem className="gap-2">
										<Edit className="w-4 h-4" />
										Edit Profile
									</DropdownMenuItem>
									<DropdownMenuItem className="gap-2">
										<Printer className="w-4 h-4" />
										Print Summary
									</DropdownMenuItem>
									<DropdownMenuItem className="gap-2">
										<Download className="w-4 h-4" />
										Export Records
									</DropdownMenuItem>
									<DropdownMenuItem className="gap-2">
										<Share2 className="w-4 h-4" />
										Share Access
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 md:px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Patient Info */}
					<div className="lg:col-span-1 space-y-6">
						{/* Quick Info Card */}
						<Card className="border-border/40">
							<CardContent className="p-6">
								<h3 className="font-semibold text-lg mb-4">Quick Info</h3>
								<div className="space-y-4">
									<InfoItem
										icon={Calendar}
										label="Age"
										value={age ? `${age} years` : "N/A"}
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
											value={patient.date_of_birth}
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

						{/* Contact Card */}
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

						{/* Health Stats Card */}
						{(patient.blood_type || patient.height_cm || patient.weight_kg) && (
							<Card className="border-border/40">
								<CardContent className="p-6">
									<h3 className="font-semibold text-lg mb-4">Health Stats</h3>
									<div className="space-y-4">
										{patient.blood_type && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="p-2 bg-red-50 rounded-lg">
														<Heart className="w-4 h-4 text-red-600" />
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Blood Type</p>
														<p className="font-medium">{patient.blood_type}</p>
													</div>
												</div>
											</div>
										)}
										{patient.height_cm && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="p-2 bg-blue-50 rounded-lg">
														<User className="w-4 h-4 text-blue-600" />
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Height</p>
														<p className="font-medium">{patient.height_cm} cm</p>
													</div>
												</div>
											</div>
										)}
										{patient.weight_kg && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="p-2 bg-green-50 rounded-lg">
														<Activity className="w-4 h-4 text-green-600" />
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Weight</p>
														<p className="font-medium">{patient.weight_kg} kg</p>
													</div>
												</div>
											</div>
										)}
										{bmi && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="p-2 bg-amber-50 rounded-lg">
														<Clipboard className="w-4 h-4 text-amber-600" />
													</div>
													<div>
														<p className="text-sm text-muted-foreground">BMI</p>
														<p className="font-medium">{bmi}</p>
													</div>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Column - Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Tabs Section */}
						<div className="border-border/40 pt-0">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<div className="border-b">
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
											value="documents"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-14 px-6"
										>
											<FileText className="w-4 h-4 mr-2" />
											Documents
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
									<TabsContent value="overview" className="space-y-6">
										{/* Personal Information */}
										<div>
											<h3 className="font-semibold text-lg mb-4">Personal Information</h3>

											<h2 className="font-semibold text-md mb-4">Patient ID</h2>
											<CopyableId value={patient.id} />
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<InfoCard label="Full Name" value={patient.full_name} />
												<InfoCard label="Email" value={patient.email} />
												<InfoCard label="Phone" value={patient.phone_number} />
												<InfoCard label="Date of Birth" value={patient.date_of_birth} />
												<InfoCard label="Gender" value={patient.gender} />
												<InfoCard label="Status" value={patient.status?.toUpperCase()} />
											</div>
										</div>

										<Separator />

										{/* Medical Conditions */}
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

										{/* Recent Activity */}
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

									<TabsContent value="medical">
										<div className="space-y-6">
											<h3 className="font-semibold text-lg">Medical History</h3>
											<div className="text-center py-16">
												<History className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
												<h3 className="text-lg font-medium mb-2">No Medical History</h3>
												<p className="text-muted-foreground max-w-md mx-auto mb-6">
													Medical records and history will appear here once documented
												</p>
												<Button className="gap-2">
													<Clipboard className="h-4 w-4" />
													Add Medical Record
												</Button>
											</div>
										</div>
									</TabsContent>

									<TabsContent value="medication" className="space-y-6">
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-semibold text-lg">Medications</h3>
												<p className="text-sm text-muted-foreground">
													{medications.length} medications recorded
												</p>
											</div>
											{staffId && canManagePrescriptions && (
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
														canEdit={canManagePrescriptions}
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
												{staffId && canManagePrescriptions && (
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

									<TabsContent value="documents">
										<div className="space-y-6">
											<h3 className="font-semibold text-lg">Documents</h3>
											<div className="text-center py-16">
												<FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
												<h3 className="text-lg font-medium mb-2">No Documents</h3>
												<p className="text-muted-foreground max-w-md mx-auto">
													Patient documents and files will appear here once uploaded
												</p>
											</div>
										</div>
									</TabsContent>

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

/* ---------------- Components ---------------- */

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
		<div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
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
					<>
						<Check className="w-3.5 h-3.5" />
						Copied
					</>
				) : (
					<>
						<Copy className="w-3.5 h-3.5" />
						Copy
					</>
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
						{date.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</div>
	);
}
