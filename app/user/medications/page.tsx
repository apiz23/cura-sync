"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Pill,
	Clock,
	Calendar,
	AlertCircle,
	Eye,
	CheckCircle,
	ChevronRightIcon,
	ShieldCheck,
} from "lucide-react";
import { Medication } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { isMedicationActiveOnDate, isMedicationExpired } from "@/lib/medication-dates";
import type { ColumnDef } from "@/components/kibo-ui/table";
import {
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHead,
	TableHeader,
	TableHeaderGroup,
	TableProvider,
	TableRow,
} from "@/components/kibo-ui/table";
import MedicationDetailsSheet from "./medication-details-sheet";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { EASE } from "@/hooks/use-motion-config";

export default function MedicationPage() {
	const [medications, setMedications] = useState<Medication[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [selectedMedication, setSelectedMedication] =
		useState<Medication | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const { user, isLoaded } = useUser();

	async function fetchMedications() {
		try {
			const res = await fetch(`/api/medications`, { cache: "no-store" });
			const data = await res.json();

			if (!res.ok) {
				toast.error(data?.error || "Failed to load medications");
				setMedications([]);
				return;
			}

			if (!Array.isArray(data)) {
				console.error("Expected array, got:", data);
				setMedications([]);
				return;
			}

			setMedications(data);
		} catch (error) {
			console.error("Failed to fetch medications:", error);
			setMedications([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!isLoaded || !user) return;
		fetchMedications();
	}, [isLoaded, user]);

	const meds = Array.isArray(medications) ? medications : [];

	const filteredMeds = meds.filter((med) => {
		if (filterStatus === "all") return true;
		if (filterStatus === "active") return med.status === "ACTIVE";
		if (filterStatus === "completed") return med.status === "COMPLETED";
		if (filterStatus === "stopped") return med.status === "STOPPED";
		if (filterStatus === "expired") {
			return isMedicationExpired(med.end_date);
		}
		return true;
	});

	const today = new Date();
	const todayMeds = meds.filter((med) =>
		isMedicationActiveOnDate(med.start_date, med.end_date ?? null, today)
	);

	const activeMeds = meds.filter((med) => med.status === "ACTIVE");

	const expiredMeds = meds.filter((med) => isMedicationExpired(med.end_date, today));

	const getStatusConfig = (status: string) => {
		const configs = {
			COMPLETED: {
				color: "bg-primary/10 text-primary border-primary/20",
				icon: <CheckCircle className="h-3.5 w-3.5" />,
				label: "Completed",
				dotColor: "bg-primary",
			},
			ACTIVE: {
				color: "bg-chart-2/10 text-chart-2 border-chart-2/30",
				icon: <Clock className="h-3.5 w-3.5" />,
				label: "Active",
				dotColor: "bg-chart-2",
			},
			STOPPED: {
				color: "bg-chart-5/10 text-chart-5 border-chart-5/30",
				icon: <AlertCircle className="h-3.5 w-3.5" />,
				label: "Stopped",
				dotColor: "bg-chart-5",
			},
			default: {
				color: "bg-muted text-muted-foreground border-border",
				icon: <Pill className="h-3.5 w-3.5" />,
				label: "Unknown",
				dotColor: "bg-muted-foreground",
			},
		};

		return configs[status as keyof typeof configs] || configs.default;
	};

	const formatShortDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	async function markAsTaken(medicationId: string) {
		const intakePromise = fetch(`/api/medications/${medicationId}/logs`, {
			method: "POST",
		}).then(async (res) => {
			if (!res.ok) {
				const json = await res.json().catch(() => null);
				throw new Error(json?.error || "Failed to log intake");
			}

			return res.json().catch(() => null);
		});

		toast.promise(intakePromise, {
			loading: "Logging intake...",
			success: "Marked as taken",
			error: (error) =>
				error instanceof Error ? error.message : "Failed to log intake",
		});

		try {
			await intakePromise;
			fetchMedications();
		} catch (error) {
			console.error("Failed to mark as taken:", error);
		}
	}

	// Define columns for the table
	const columns: ColumnDef<Medication>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Medication" />
			),
			cell: ({ row }) => {
				const statusConfig = getStatusConfig(row.original.status);
				return (
					<div className="flex items-center gap-3">
						<div className="relative">
							<Avatar className="size-8">
								<AvatarFallback className={statusConfig.color}>
									<Pill className="h-4 w-4" />
								</AvatarFallback>
							</Avatar>
							<div
								className={`absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background ${statusConfig.dotColor}`}
							/>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<div className="font-semibold text-base">{row.original.name}</div>
								{row.original.patient_name ? (
									<Badge variant="outline" className="text-[10px] font-normal">
										For {row.original.patient_name}
									</Badge>
								) : null}
							</div>
							<div className="flex items-center gap-1 text-muted-foreground text-base">
								<span>{row.original.dosage}</span>
								<ChevronRightIcon size={12} />
								<span>{row.original.frequency}</span>
							</div>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "schedule",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Schedule" />
			),
			cell: ({ row }) => (
				<div className="space-y-1">
					<div className="font-medium text-base">{row.original.frequency}</div>
					{row.original.schedule && (
						<div className="text-base text-muted-foreground">
							{row.original.schedule}
						</div>
					)}
				</div>
			),
		},
		{
			id: "dates",
			header: ({ column }) => <TableColumnHeader column={column} title="Dates" />,
			cell: ({ row }) => {
				const isExpired = isMedicationExpired(row.original.end_date);

				return (
					<div className="space-y-1">
						<div className="text-base">
							<span className="text-muted-foreground">Start: </span>
							{formatShortDate(row.original.start_date)}
						</div>
						{row.original.end_date && (
							<div
								className={`text-base ${
									isExpired ? "text-chart-5 font-medium" : "text-muted-foreground"
								}`}
							>
								<span className="text-muted-foreground">End: </span>
								{formatShortDate(row.original.end_date)}
								{isExpired && " (Expired)"}
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
			cell: ({ row }) => {
				const statusConfig = getStatusConfig(row.original.status);
				const isActive = row.original.status === "ACTIVE";
				const canLogIntake = isActive && row.original.is_own !== false;

				return (
					<div className="flex items-center gap-2">
						<Badge
							className={`flex items-center gap-1.5 px-2.5 py-1 border ${statusConfig.color} text-base font-normal`}
							variant="outline"
						>
							<div className={`h-2 w-2 rounded-full ${statusConfig.dotColor}`} />
							{statusConfig.label}
						</Badge>
						{canLogIntake && (
							<Button
								variant="outline"
								size="sm"
								className="h-8 px-3 gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"
								onClick={() => markAsTaken(row.original.id)}
							>
								<CheckCircle className="h-3.5 w-3.5" />
								<span className="text-base">Take</span>
							</Button>
						)}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Actions" />
			),
			cell: ({ row }) => {
				return (
					<div className="flex items-center justify-start gap-2">
						<Button
							variant="outline"
							size="sm"
							className="gap-2 cursor-pointer"
							onClick={() => {
								setSelectedMedication(row.original);
								setDetailsOpen(true);
							}}
						>
							<Eye className="h-3.5 w-3.5" />
							Details
						</Button>
					</div>
				);
			},
		},
	];

	if (loading) {
		return (
			<UserPageShell>
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-2">
							<Skeleton className="h-10 w-64" />
							<Skeleton className="h-4 w-48" />
						</div>
						<Skeleton className="h-10 w-40" />
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-32 rounded-xl" />
						))}
					</div>

					<div className="space-y-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-16 rounded-lg" />
						))}
					</div>
				</div>
		</UserPageShell>
		);
	}

	return (
		<UserPageShell>
			<motion.div
				className="space-y-8"
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: EASE }}
			>
				<UserPageHeader
					sectionLabel="Your Medications"
					title="Medications"
					description="Review clinician-managed prescriptions and log your adherence."
				/>

				{/* Clinician notice */}
				<div className="flex items-start gap-3 border-b border-border/70 pb-4">
					<ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
					<div>
						<p className="text-sm font-medium text-foreground">
							Prescriptions are clinician-managed
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							You can review prescriptions and mark doses as taken. Medication
							creation, edits, and stop actions are restricted to doctors or admins.
						</p>
					</div>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/70">
					<div className="py-4 pr-5">
						<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Total</p>
						<p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">{meds.length}</p>
					</div>
					<div className="py-4 px-5">
						<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active</p>
						<p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">{activeMeds.length}</p>
						<p className="mt-1 text-xs text-muted-foreground">{todayMeds.length} due today</p>
					</div>
					<div className="py-4 px-5">
						<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Completed</p>
						<p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
							{meds.filter((m) => m.status === "COMPLETED").length}
						</p>
					</div>
					<div className="py-4 pl-5">
						<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Review</p>
						<p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">{expiredMeds.length}</p>
						{expiredMeds.length > 0 && (
							<p className="mt-1 text-xs font-medium text-chart-5">{expiredMeds.length} expired</p>
						)}
					</div>
				</div>

				{/* Medications Table */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your Medications</p>
							<p className="text-xs text-muted-foreground mt-1">
								{filteredMeds.length} of {meds.length} medications shown
							</p>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<Select value={filterStatus} onValueChange={setFilterStatus}>
									<SelectTrigger className="w-[180px] bg-transparent text-base">
										<SelectValue placeholder="All Medications" />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="all">All Medications</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="stopped">Stopped</SelectItem>
										<SelectItem value="expired">Expired</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center gap-2">
								<Badge variant="outline" className="px-3 py-1.5">
									{meds.length} total
								</Badge>
								<Badge className="px-3 py-1.5 bg-primary">
									{activeMeds.length} active
								</Badge>
							</div>
						</div>
					</div>

					{meds.length === 0 ? (
						<div className="py-12 text-center">
							<p className="font-medium text-foreground">No medications yet</p>
							<p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
								Your prescriptions will appear here once a doctor or admin adds them to
								your treatment plan.
							</p>
						</div>
					) : (
						<div className="rounded-xl border border-border overflow-hidden">
							<TableProvider columns={columns} data={filteredMeds}>
								<TableHeader>
									{({ headerGroup }) => (
										<TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
											{({ header }) => <TableHead header={header} key={header.id} />}
										</TableHeaderGroup>
									)}
								</TableHeader>
								<TableBody>
									{({ row }) => (
										<TableRow key={row.id} row={row}>
											{({ cell }) => <TableCell cell={cell} key={cell.id} />}
										</TableRow>
									)}
								</TableBody>
							</TableProvider>
						</div>
					)}
				</div>

				{/* Sheets */}
				{selectedMedication && (
					<MedicationDetailsSheet
						open={detailsOpen}
						onOpenChange={setDetailsOpen}
						medication={selectedMedication}
						onUpdate={() => fetchMedications()}
					/>
				)}

				{/* Footer Note & Today's Reminder */}
				{(todayMeds.length > 0 || expiredMeds.length > 0) && (
					<div className="grid md:grid-cols-2 gap-4">
						{todayMeds.length > 0 && (
							<div className="rounded-xl bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 p-5">
								<div className="flex items-start gap-3">
									<Clock className="h-5 w-5 text-primary mt-0.5" />
									<div>
										<p className="font-semibold text-base mb-2">Today{"'"}s Schedule</p>
										<p className="text-base text-muted-foreground">
											You have {todayMeds.length} medication
											{todayMeds.length > 1 ? "s" : ""} scheduled for today. Don{"'"}t
											forget to take them as prescribed.
										</p>
										<div className="flex flex-wrap gap-1.5 mt-3">
											{todayMeds.slice(0, 3).map((med, index) => (
												<Badge key={index} variant="secondary" className="text-base">
													{med.name}
												</Badge>
											))}
											{todayMeds.length > 3 && (
												<Badge variant="outline" className="text-base">
													+{todayMeds.length - 3} more
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{expiredMeds.length > 0 && (
							<div className="rounded-xl bg-linear-to-r from-chart-5/10 to-chart-5/15 border border-chart-5/30 p-5">
								<div className="flex items-start gap-3">
									<AlertCircle className="h-5 w-5 text-chart-5 mt-0.5" />
									<div>
										<p className="font-semibold text-base mb-2 text-chart-5">
											Review Needed
										</p>
										<p className="text-base text-chart-5/80">
											{expiredMeds.length} medication
											{expiredMeds.length > 1 ? "s have" : " has"} expired. Please review
											and update their status.
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</motion.div>
		</UserPageShell>
	);
}
