import { NextRequest, NextResponse } from "next/server";

import supabaseAdmin from "@/lib/supabase-admin";
import { requireAnySession } from "@/lib/authz";
import {
	addressExplorerUrl,
	explorerUrl,
	getHistory,
	hashRecord,
	isBlockchainConfigured,
	verifyOnChain,
} from "@/lib/blockchain";
import { pickHashableFields } from "@/lib/canonical-hash";

const HASHABLE_FIELDS: Record<string, string[]> = {
	cura_conditions: ["profile_id", "name", "status", "severity", "onset_date", "notes"],
	cura_allergies: [
		"profile_id",
		"allergen",
		"reaction",
		"severity",
		"status",
		"notes",
	],
	cura_procedures: [
		"profile_id",
		"name",
		"procedure_date",
		"facility_name",
		"outcome",
		"notes",
	],
	cura_encounters: [
		"profile_id",
		"encounter_type",
		"encounter_date",
		"facility_name",
		"provider_name",
		"reason",
		"diagnosis_summary",
		"notes",
		"ipfs_cid",
	],
};

const TABLE_BY_RESOURCE: Record<string, string> = {
	condition: "cura_conditions",
	allergy: "cura_allergies",
	procedure: "cura_procedures",
	encounter: "cura_encounters",
};

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ recordId: string }> },
) {
	const session = await requireAnySession(req);
	if (session instanceof NextResponse) return session;

	if (!isBlockchainConfigured()) {
		return NextResponse.json(
			{ error: "Blockchain not configured on server." },
			{ status: 503 },
		);
	}

	const { recordId } = await params;
	const url = new URL(req.url);
	const resourceType = url.searchParams.get("type") || "encounter";
	const table = TABLE_BY_RESOURCE[resourceType];

	if (!table) {
		return NextResponse.json(
			{ error: "Unsupported resource type" },
			{ status: 400 },
		);
	}

	const { data: record, error } = await supabaseAdmin
		.from(table)
		.select("*")
		.eq("id", recordId)
		.maybeSingle();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
	if (!record) {
		return NextResponse.json({ error: "Record not found" }, { status: 404 });
	}

	// Patient sees only their own records; staff handled by authz.
	if (session.kind === "patient" && record.profile_id !== session.profileId) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const fields = HASHABLE_FIELDS[table] ?? Object.keys(record);
	const hashable = pickHashableFields(record, fields);
	const liveHash = hashRecord(hashable);

	const { data: auditRow } = await supabaseAdmin
		.from("cura_audit_logs")
		.select("tx_hash, block_number, content_hash, ipfs_cid, created_at")
		.eq("resource_id", recordId)
		.not("tx_hash", "is", null)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	let verified = false;
	let chainError: string | null = null;
	let history: Array<{
		contentHash: string;
		registeredBy: string;
		timestamp: number;
		ipfsCid: string;
		registeredByExplorer: string;
	}> = [];

	try {
		verified = await verifyOnChain(recordId, liveHash);
		const raw = await getHistory(recordId);
		history = raw.map((h) => ({
			...h,
			registeredByExplorer: addressExplorerUrl(h.registeredBy),
		}));
	} catch (chainErr) {
		chainError =
			chainErr instanceof Error ? chainErr.message : "Blockchain read failed";
	}

	return NextResponse.json({
		verified,
		liveHash,
		storedHash: auditRow?.content_hash ?? null,
		hashesMatch: auditRow?.content_hash === liveHash,
		txHash: auditRow?.tx_hash ?? null,
		blockNumber: auditRow?.block_number ?? null,
		ipfsCid: auditRow?.ipfs_cid ?? null,
		anchoredAt: auditRow?.created_at ?? null,
		explorerUrl: auditRow?.tx_hash ? explorerUrl(auditRow.tx_hash) : null,
		history,
		chainError,
	});
}
