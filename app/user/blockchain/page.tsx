"use client";

import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	ExternalLink,
	FileSearch,
	Loader2,
	Lock,
	ShieldCheck,
	ShieldX,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPageHeader, UserPageShell } from "@/components/user-page-shell";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type AuditEntry = {
	id: string;
	actor_id: string;
	actor_type: string;
	action: "CREATE" | "READ" | "UPDATE" | "DELETE" | string;
	resource_type: string;
	resource_id: string | null;
	created_at: string;
	tx_hash: string | null;
	block_number: number | null;
	content_hash: string | null;
	ipfs_cid: string | null;
	record_label?: string | null;
	record_summary?: string | null;
};

type VerifyResponse = {
	verified: boolean;
	liveHash: string;
	storedHash: string | null;
	hashesMatch: boolean;
	txHash: string | null;
	blockNumber: number | null;
	ipfsCid: string | null;
	anchoredAt: string | null;
	explorerUrl: string | null;
	chainError: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESOURCE_TO_TYPE: Record<string, string> = {
	condition: "condition",
	allergy: "allergy",
	procedure: "procedure",
	encounter: "encounter",
};

function actionVariant(action: string) {
	if (action === "CREATE") return "bg-primary/10 text-primary border-primary/20";
	if (action === "UPDATE") return "bg-chart-5/10 text-chart-5 border-chart-5/30";
	if (action === "DELETE") return "bg-destructive/10 text-destructive border-destructive/20";
	return "bg-muted text-muted-foreground border-border";
}

function resourceLabel(resourceType: string) {
	const map: Record<string, string> = {
		profile: "Profile",
		appointment: "Appointment",
		medication: "Medication",
		health_sync: "Health Sync",
		patient_profile: "Patient Profile",
		condition: "Condition",
		allergy: "Allergy",
		procedure: "Procedure",
		encounter: "Encounter",
	};
	return map[resourceType] ?? resourceType;
}

function formatTimestamp(value: string) {
	return new Date(value).toLocaleString("en-MY", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function shortHex(hash: string, head = 10, tail = 6) {
	if (!hash) return "—";
	if (hash.length <= head + tail + 3) return hash;
	return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlockchainPage() {
	const [entries, setEntries] = useState<AuditEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [verifying, setVerifying] = useState<Record<string, boolean>>({});
	const [verifyResults, setVerifyResults] = useState<
		Record<string, VerifyResponse>
	>({});

	useEffect(() => {
		let cancelled = false;
		fetch("/api/user/audit-logs")
			.then(async (res) => {
				if (!res.ok) throw new Error("Failed to load audit trail");
				const body = (await res.json()) as { data: AuditEntry[] };
				return body.data ?? [];
			})
			.then((data) => {
				if (!cancelled) setEntries(data);
			})
			.catch((err: unknown) => {
				if (!cancelled)
					setError(err instanceof Error ? err.message : "Unknown error");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const handleVerify = useCallback(
		async (entry: AuditEntry) => {
			if (!entry.resource_id) return;
			const type = RESOURCE_TO_TYPE[entry.resource_type];
			if (!type) {
				toast.error("Cannot verify this record type yet");
				return;
			}
			setVerifying((s) => ({ ...s, [entry.id]: true }));

			const promise = fetch(
				`/api/user/verify-record/${entry.resource_id}?type=${type}`,
			)
				.then(async (res) => {
					const data = (await res.json()) as VerifyResponse & {
						error?: string;
					};
					if (!res.ok)
						throw new Error(data?.error || "Verification failed");
					return data;
				})
				.then((data) => {
					setVerifyResults((s) => ({ ...s, [entry.id]: data }));
					return data;
				});

			toast.promise(promise, {
				loading: "Checking Polygon Amoy...",
				success: (data) =>
					data.verified && data.hashesMatch
						? "Record verified ✓"
						: "Hash mismatch — record may be tampered",
				error: (err: Error) => err.message,
			});

			try {
				await promise;
			} finally {
				setVerifying((s) => ({ ...s, [entry.id]: false }));
			}
		},
		[],
	);

	const anchored = entries.filter((e) => e.tx_hash);

	return (
		<UserPageShell>
			<UserPageHeader
				sectionLabel="Audit Trail"
				title="Blockchain Security"
				description="Records are hashed with keccak256 and anchored on the Polygon Amoy testnet. Click Verify on any entry to re-check the on-chain proof in real time."
				meta={
					!loading ? (
						<>
							<Badge
								variant="outline"
								className="gap-1.5 border-primary/20 bg-primary/5 px-3 py-1.5 text-primary"
							>
								<Lock className="h-3 w-3" />
								{entries.length} audit{" "}
								{entries.length === 1 ? "entry" : "entries"}
							</Badge>
							<Badge
								variant="outline"
								className="gap-1.5 border-chart-3/30 bg-chart-3/5 px-3 py-1.5 text-chart-3 dark:text-chart-3"
							>
								<ShieldCheck className="h-3 w-3" />
								{anchored.length} on-chain
							</Badge>
						</>
					) : null
				}
			/>

			{/* How it works */}
			<div className="grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
				{[
					{
						icon: Lock,
						title: "Hashed",
						body: "keccak256 of canonical record JSON. Same record → same 32-byte hash.",
					},
					{
						icon: ShieldCheck,
						title: "Anchored",
						body: "Hash + IPFS CID written to Polygon Amoy smart contract. Server pays gas — you don't.",
					},
					{
						icon: FileSearch,
						title: "Verifiable",
						body: "Click Verify to re-hash live record and compare against on-chain proof. Tamper → mismatch.",
					},
				].map(({ icon: Icon, title, body }) => (
					<div key={title} className="py-4 sm:px-5 first:pl-0 last:pr-0">
						<div className="flex items-center gap-2 mb-2">
							<Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
							<p className="font-semibold text-sm text-foreground">{title}</p>
						</div>
						<p className="text-sm leading-6 text-muted-foreground">{body}</p>
					</div>
				))}
			</div>

			{/* Audit log */}
			<div>
				<p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Audit trail
				</p>
				<div className="h-px bg-border/50 mb-5" />

				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-20 w-full rounded-xl" />
						))}
					</div>
				) : error ? (
					<div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
						<AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
						<div>
							<p className="font-medium text-foreground">
								Could not load audit trail
							</p>
							<p className="text-base text-muted-foreground">{error}</p>
						</div>
					</div>
				) : entries.length === 0 ? (
					<div className="py-12 text-center">
						<p className="font-medium text-foreground">No audit entries yet</p>
						<p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
							Actions on your health data will appear here as they occur.
						</p>
					</div>
				) : (
					<div>
						{entries.map((entry, idx) => {
							const result = verifyResults[entry.id];
							const isVerifying = verifying[entry.id];
							const canVerify =
								Boolean(entry.resource_id) &&
								Boolean(RESOURCE_TO_TYPE[entry.resource_type]) &&
								Boolean(entry.tx_hash);

							return (
								<motion.div
									key={entry.id}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: Math.min(idx, 7) * 0.03 }}
									className="border-b border-border/40 last:border-0"
								>
									<div className="flex flex-wrap items-center justify-between gap-4 py-3">
										<div className="flex items-center gap-3">
											<span
												className={cn(
													"rounded-md border px-2 py-0.5 text-base font-bold uppercase tracking-wide",
													actionVariant(entry.action),
												)}
											>
												{entry.action}
											</span>
											<div className="min-w-0">
												<div className="flex flex-wrap items-baseline gap-2">
													<p className="text-base font-semibold text-foreground">
														{entry.record_label ||
															resourceLabel(entry.resource_type)}
													</p>
													<span className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-base uppercase tracking-wider text-muted-foreground">
														{resourceLabel(entry.resource_type)}
													</span>
												</div>
												{entry.record_summary ? (
													<p className="mt-0.5 text-base capitalize text-muted-foreground">
														{entry.record_summary}
													</p>
												) : null}
												<p className="mt-0.5 font-mono text-base text-muted-foreground/70">
													ID: {entry.resource_id
														? shortHex(entry.resource_id, 8, 4)
														: "—"}
												</p>
											</div>
										</div>

										<div className="flex flex-wrap items-center gap-3">
											{entry.tx_hash ? (
												<a
													href={`https://amoy.polygonscan.com/tx/${entry.tx_hash}`}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1.5 rounded-full border border-chart-3/30 bg-chart-3/5 px-3 py-1 font-mono text-base font-medium text-chart-3 transition-colors hover:bg-chart-3/10 dark:text-chart-3"
												>
													<ShieldCheck className="h-3 w-3" />
													{shortHex(entry.tx_hash)}
													<ExternalLink className="h-3 w-3" />
												</a>
											) : (
												<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 font-mono text-base text-muted-foreground">
													<Clock className="h-3 w-3" />
													Off-chain only
												</span>
											)}

											<p className="text-base text-muted-foreground">
												{formatTimestamp(entry.created_at)}
											</p>

											{canVerify ? (
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleVerify(entry)}
													disabled={isVerifying}
													aria-label="Verify on-chain proof"
												>
													{isVerifying ? (
														<>
															<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
															Verifying
														</>
													) : (
														<>
															<FileSearch className="mr-1.5 h-3.5 w-3.5" />
															Verify
														</>
													)}
												</Button>
											) : null}
										</div>
									</div>

									{/* Verify result panel */}
									{result ? (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											className={cn(
												"overflow-hidden border-t",
												result.verified && result.hashesMatch
													? "border-chart-3/30 bg-chart-3/5"
													: "border-destructive/20 bg-destructive/5",
											)}
										>
											<div className="space-y-2 px-4 py-3 text-base">
												<div className="flex items-center gap-2 font-semibold">
													{result.verified && result.hashesMatch ? (
														<>
															<CheckCircle2 className="h-4 w-4 text-chart-3 dark:text-chart-3" />
															<span className="text-chart-3 dark:text-chart-3">
																Verified on Polygon Amoy
															</span>
														</>
													) : (
														<>
															<XCircle className="h-4 w-4 text-destructive" />
															<span className="text-destructive">
																Hash mismatch — possible tampering
															</span>
														</>
													)}
												</div>
												<div className="grid gap-1 font-mono text-base text-muted-foreground">
													<p>
														<span className="text-foreground">Live hash:</span>{" "}
														{shortHex(result.liveHash, 14, 8)}
													</p>
													<p>
														<span className="text-foreground">
															Stored hash:
														</span>{" "}
														{result.storedHash
															? shortHex(result.storedHash, 14, 8)
															: "—"}
													</p>
													{result.blockNumber ? (
														<p>
															<span className="text-foreground">Block:</span>{" "}
															#{result.blockNumber}
														</p>
													) : null}
													{result.ipfsCid ? (
														<p>
															<span className="text-foreground">IPFS:</span>{" "}
															<a
																href={`https://gateway.pinata.cloud/ipfs/${result.ipfsCid}`}
																target="_blank"
																rel="noreferrer"
																className="text-primary hover:underline"
															>
																{shortHex(result.ipfsCid, 12, 6)}
															</a>
														</p>
													) : null}
													{result.chainError ? (
														<p className="text-destructive">
															Chain error: {result.chainError}
														</p>
													) : null}
												</div>
											</div>
										</motion.div>
									) : null}
								</motion.div>
							);
						})}
					</div>
				)}
			</div>

			{/* Contract info footer */}
			<div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-base">
						<ShieldX className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">
							Anchored on{" "}
							<span className="font-semibold text-foreground">
								Polygon Amoy testnet
							</span>
						</span>
					</div>
					<a
						href="https://amoy.polygonscan.com/address/0x2f2E7073d6ed77781656c6d6Ea7A07314d69b4f8"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 text-base font-medium text-primary hover:underline"
					>
						View HealthRecordRegistry contract
						<ExternalLink className="h-3 w-3" />
					</a>
				</div>
			</div>
		</UserPageShell>
	);
}
