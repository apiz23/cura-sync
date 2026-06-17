"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrollText, X, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type AuditLog = {
	id: string;
	actor_id: string;
	actor_name: string | null;
	actor_type: "staff" | "patient";
	action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
	resource_type: string;
	resource_id: string | null;
	metadata: Record<string, unknown> | null;
	created_at: string;
};

type AuditResponse = {
	data: AuditLog[];
	total: number;
	page: number;
	limit: number;
	pages: number;
};

const ACTION_COLORS: Record<string, string> = {
	CREATE: "bg-chart-3/10 text-chart-3 border-chart-3/30",
	READ: "bg-chart-2/10 text-chart-2 border-chart-2/30",
	UPDATE: "bg-chart-5/10 text-chart-5 border-chart-5/30",
	DELETE: "bg-destructive/10 text-destructive border-destructive/30",
	LOGIN: "bg-primary/10 text-primary border-primary/30",
	LOGOUT: "bg-muted text-muted-foreground border-border",
};

const ACTOR_COLORS: Record<string, string> = {
	staff: "bg-chart-4/10 text-chart-4 border-chart-4/30",
	patient: "bg-muted text-muted-foreground border-border",
};

const ALL = "all";

export default function AuditTrailPage() {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [total, setTotal] = useState(0);
	const [pages, setPages] = useState(1);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [exporting, setExporting] = useState(false);

	const [actorType, setActorType] = useState(ALL);
	const [action, setAction] = useState(ALL);
	const [resourceType, setResourceType] = useState(ALL);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");

	const fetchLogs = useCallback(
		async (p: number) => {
			setLoading(true);
			try {
				const params = new URLSearchParams({ page: String(p), limit: "25" });
				if (actorType !== ALL) params.set("actor_type", actorType);
				if (action !== ALL) params.set("action", action);
				if (resourceType !== ALL) params.set("resource_type", resourceType);
				if (from) params.set("from", from);
				if (to) params.set("to", to);

				const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
					cache: "no-store",
				});
				if (!res.ok) throw new Error("Failed to load");
				const json: AuditResponse = await res.json();
				setLogs(json.data);
				setTotal(json.total);
				setPages(json.pages);
				setPage(json.page);
			} catch {
				setLogs([]);
			} finally {
				setLoading(false);
			}
		},
		[actorType, action, resourceType, from, to],
	);

	useEffect(() => {
		void fetchLogs(1);
	}, [fetchLogs]);

	function clearFilters() {
		setActorType(ALL);
		setAction(ALL);
		setResourceType(ALL);
		setFrom("");
		setTo("");
	}

	async function handleExport() {
		setExporting(true);
		try {
			const params = new URLSearchParams({ export: "true" });
			if (actorType !== ALL) params.set("actor_type", actorType);
			if (action !== ALL) params.set("action", action);
			if (resourceType !== ALL) params.set("resource_type", resourceType);
			if (from) params.set("from", from);
			if (to) params.set("to", to);

			const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
				cache: "no-store",
			});
			if (!res.ok) throw new Error("Export failed");
			const json: AuditResponse = await res.json();
			if (json.total > json.data.length) {
				toast.warning(
					`Export capped at ${json.data.length.toLocaleString()} rows. ${(json.total - json.data.length).toLocaleString()} entries were omitted. Narrow your date range to export all.`
				);
			}
			exportAuditLogsToCSV(json.data);
		} catch {
			toast.error("Export failed. Please try again.");
		} finally {
			setExporting(false);
		}
	}

	const hasFilters =
		actorType !== ALL || action !== ALL || resourceType !== ALL || from || to;

	return (
		<div className="p-6 space-y-6">
			<div>
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<ScrollText className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
						<p className="text-muted-foreground mt-0.5">
							Append-only access log Â· Admin only Â· {total.toLocaleString()} entries
						</p>
					</div>
				</div>
				<div className="flex justify-end gap-2 mt-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => void handleExport()}
						disabled={exporting}
						className="gap-1.5"
					>
						<Download className={`h-4 w-4 ${exporting ? "animate-pulse" : ""}`} />
						{exporting ? "Exporting…" : "Export CSV"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchLogs(page)}
						disabled={loading}
						className="gap-1.5"
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
			</div>

			{/* Filters */}
			<Card className="border-border/50">
				<CardContent className="pt-5">
					<div className="flex flex-wrap gap-3 items-end">
						<div className="flex flex-col gap-1.5">
							<span className="text-base font-medium text-muted-foreground">
								Actor type
							</span>
							<Select value={actorType} onValueChange={setActorType}>
								<SelectTrigger className="w-36">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All actors</SelectItem>
									<SelectItem value="staff">Staff</SelectItem>
									<SelectItem value="patient">Patient</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<span className="text-base font-medium text-muted-foreground">
								Action
							</span>
							<Select value={action} onValueChange={setAction}>
								<SelectTrigger className="w-36">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All actions</SelectItem>
									<SelectItem value="LOGIN">LOGIN</SelectItem>
									<SelectItem value="LOGOUT">LOGOUT</SelectItem>
									<SelectItem value="CREATE">CREATE</SelectItem>
									<SelectItem value="READ">READ</SelectItem>
									<SelectItem value="UPDATE">UPDATE</SelectItem>
									<SelectItem value="DELETE">DELETE</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<span className="text-base font-medium text-muted-foreground">
								Resource
							</span>
							<Select value={resourceType} onValueChange={setResourceType}>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All resources</SelectItem>
									<SelectItem value="session">session</SelectItem>
									<SelectItem value="appointment">appointment</SelectItem>
									<SelectItem value="medication">medication</SelectItem>
									<SelectItem value="medication_log">medication_log</SelectItem>
									<SelectItem value="patient">patient</SelectItem>
									<SelectItem value="staff">staff</SelectItem>
									<SelectItem value="health_sync">health_sync</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<span className="text-base font-medium text-muted-foreground">From</span>
							<Input
								type="date"
								value={from}
								onChange={(e) => setFrom(e.target.value)}
								className="w-40"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<span className="text-base font-medium text-muted-foreground">To</span>
							<Input
								type="date"
								value={to}
								onChange={(e) => setTo(e.target.value)}
								className="w-40"
							/>
						</div>

						{hasFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="gap-1.5 mb-0.5"
							>
								<X className="h-3.5 w-3.5" />
								Clear
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<Card className="border-border/50 py-0">
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-base">
							<thead>
								<tr className="border-b bg-muted/30 text-base uppercase tracking-wide text-muted-foreground">
									<th className="px-4 py-3 text-left font-medium">Time</th>
									<th className="px-4 py-3 text-left font-medium">Actor</th>
									<th className="px-4 py-3 text-left font-medium">Action</th>
									<th className="px-4 py-3 text-left font-medium">Resource</th>
									<th className="px-4 py-3 text-left font-medium">Detail</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									Array.from({ length: 8 }).map((_, i) => (
										<tr key={i} className="border-b">
											{Array.from({ length: 5 }).map((_, j) => (
												<td key={j} className="px-4 py-3">
													<Skeleton className="h-4 w-full" />
												</td>
											))}
										</tr>
									))
								) : logs.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="px-4 py-12 text-center text-muted-foreground"
										>
											No audit entries found
										</td>
									</tr>
								) : (
									logs.map((log) => (
										<tr
											key={log.id}
											className="border-b last:border-0 hover:bg-muted/20 transition-colors"
										>
											<td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-base">
												{formatRelative(log.created_at)}
												<div className="text-base opacity-60">
													{formatDateTime(log.created_at)}
												</div>
											</td>
											<td className="px-4 py-3">
												<div className="font-medium text-foreground">
													{log.actor_name ?? truncateId(log.actor_id)}
												</div>
												<Badge
													variant="outline"
													className={`mt-1 text-base px-1.5 py-0 ${ACTOR_COLORS[log.actor_type]}`}
												>
													{log.actor_type}
												</Badge>
											</td>
											<td className="px-4 py-3">
												<Badge
													variant="outline"
													className={`font-mono font-semibold ${ACTION_COLORS[log.action]}`}
												>
													{log.action}
												</Badge>
											</td>
											<td className="px-4 py-3 font-mono text-base text-foreground">
												{log.resource_type}
											</td>
											<td className="px-4 py-3 text-base text-muted-foreground max-w-[200px]">
												{log.resource_id && (
													<div className="font-mono truncate">
														id: {truncateId(log.resource_id)}
													</div>
												)}
												{log.metadata && (
													<div className="truncate opacity-70">
														{formatMetadata(log.metadata)}
													</div>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{pages > 1 && (
						<div className="border-t px-4 py-3">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={
												page > 1 && !loading ? () => fetchLogs(page - 1) : undefined
											}
											aria-disabled={page <= 1 || loading}
											className={
												page <= 1 || loading
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>

									{Array.from({ length: pages }, (_, i) => i + 1)
										.filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
										.reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
											if (idx > 0 && p - (arr[idx - 1] as number) > 1)
												acc.push("ellipsis");
											acc.push(p);
											return acc;
										}, [])
										.map((p, idx) =>
											p === "ellipsis" ? (
												<PaginationItem key={`ellipsis-${idx}`}>
													<PaginationEllipsis />
												</PaginationItem>
											) : (
												<PaginationItem key={p}>
													<PaginationLink
														isActive={p === page}
														onClick={!loading ? () => fetchLogs(p) : undefined}
														className="cursor-pointer"
													>
														{p}
													</PaginationLink>
												</PaginationItem>
											),
										)}

									<PaginationItem>
										<PaginationNext
											onClick={
												page < pages && !loading ? () => fetchLogs(page + 1) : undefined
											}
											aria-disabled={page >= pages || loading}
											className={
												page >= pages || loading
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function exportAuditLogsToCSV(logs: AuditLog[]) {
	function escapeField(value: string): string {
		if (value.includes(",") || value.includes('"') || value.includes("\n")) {
			return `"${value.replace(/"/g, '""')}"`;
		}
		return value;
	}

	const headers = ["No", "Time", "Actor Name", "Actor Type", "Action", "Resource Type", "Resource ID", "Metadata"];

	const rows = logs.map((log, index) =>
		[
			String(index + 1),
			new Date(log.created_at).toLocaleString("en-US", {
				month: "short", day: "numeric", year: "numeric",
				hour: "numeric", minute: "2-digit",
			}),
			log.actor_name ?? "",
			log.actor_type,
			log.action,
			log.resource_type,
			log.resource_id ?? "",
			log.metadata ? Object.entries(log.metadata).slice(0, 3).map(([k, v]) => `${k}:${String(v)}`).join("; ") : "",
		]
			.map(escapeField)
			.join(",")
	);

	const csv = [headers.join(","), ...rows].join("\r\n");
	const BOM = "﻿";
	const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function formatRelative(iso: string) {
	const diffMs = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diffMs / 60000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function truncateId(id: string) {
	return id.length > 12 ? `${id.slice(0, 8)}â€¦` : id;
}

function formatMetadata(metadata: Record<string, unknown>) {
	const entries = Object.entries(metadata).slice(0, 2);
	return entries.map(([k, v]) => `${k}: ${String(v)}`).join(" Â· ");
}
