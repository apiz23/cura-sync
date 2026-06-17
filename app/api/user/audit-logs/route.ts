import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase-admin";
import { requireUserSession } from "@/lib/authz";

const AUDIT_COLUMNS =
	"id, actor_id, actor_type, action, resource_type, resource_id, created_at, tx_hash, block_number, content_hash, ipfs_cid";

type AuditRow = {
	id: string;
	actor_id: string;
	actor_type: string;
	action: string;
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

function summarizeCondition(r: Record<string, unknown>): string {
	const parts = [r.severity, r.status].filter(Boolean) as string[];
	return parts.join(" · ");
}
function summarizeAllergy(r: Record<string, unknown>): string {
	const parts = [r.reaction, r.severity].filter(Boolean) as string[];
	return parts.join(" · ");
}
function summarizeProcedure(r: Record<string, unknown>): string {
	return [r.procedure_date, r.facility_name].filter(Boolean).join(" · ");
}
function summarizeEncounter(r: Record<string, unknown>): string {
	return [r.encounter_type, r.provider_name].filter(Boolean).join(" · ");
}

export async function GET(req: Request) {
	try {
		const patient = await requireUserSession(req);
		if (patient instanceof NextResponse) return patient;

		const profileId = patient.profileId;

		const ownActions = supabaseAdmin
			.from("cura_audit_logs")
			.select(AUDIT_COLUMNS)
			.eq("actor_id", profileId)
			.eq("actor_type", "patient")
			.order("created_at", { ascending: false })
			.limit(100);

		// Fetch all patient-owned records (id + name/label fields) so we can
		// label audit rows on the patient's blockchain page.
		const [conditions, allergies, procedures, encounters] = await Promise.all([
			supabaseAdmin
				.from("cura_conditions")
				.select("id, name, severity, status")
				.eq("profile_id", profileId),
			supabaseAdmin
				.from("cura_allergies")
				.select("id, allergen, reaction, severity")
				.eq("profile_id", profileId),
			supabaseAdmin
				.from("cura_procedures")
				.select("id, name, procedure_date, facility_name")
				.eq("profile_id", profileId),
			supabaseAdmin
				.from("cura_encounters")
				.select("id, encounter_type, provider_name, reason")
				.eq("profile_id", profileId),
		]);

		// Build a (id → {label, summary, type}) lookup for enrichment.
		const labelMap = new Map<
			string,
			{ label: string; summary: string; type: string }
		>();
		for (const c of (conditions.data ?? []) as Array<Record<string, unknown>>) {
			labelMap.set(String(c.id), {
				label: String(c.name ?? "Condition"),
				summary: summarizeCondition(c),
				type: "condition",
			});
		}
		for (const a of (allergies.data ?? []) as Array<Record<string, unknown>>) {
			labelMap.set(String(a.id), {
				label: String(a.allergen ?? "Allergy"),
				summary: summarizeAllergy(a),
				type: "allergy",
			});
		}
		for (const p of (procedures.data ?? []) as Array<Record<string, unknown>>) {
			labelMap.set(String(p.id), {
				label: String(p.name ?? "Procedure"),
				summary: summarizeProcedure(p),
				type: "procedure",
			});
		}
		for (const e of (encounters.data ?? []) as Array<Record<string, unknown>>) {
			labelMap.set(String(e.id), {
				label: String(e.reason ?? e.encounter_type ?? "Encounter"),
				summary: summarizeEncounter(e),
				type: "encounter",
			});
		}

		const recordIds = Array.from(labelMap.keys());

		const ownActionsResult = await ownActions;
		if (ownActionsResult.error) {
			return NextResponse.json(
				{ error: ownActionsResult.error.message },
				{ status: 500 },
			);
		}

		let staffAnchored: AuditRow[] = [];
		if (recordIds.length > 0) {
			const staffRows = await supabaseAdmin
				.from("cura_audit_logs")
				.select(AUDIT_COLUMNS)
				.eq("actor_type", "staff")
				.in("resource_id", recordIds)
				.order("created_at", { ascending: false })
				.limit(200);
			if (!staffRows.error) {
				staffAnchored = (staffRows.data ?? []) as AuditRow[];
			}
		}

		const byId = new Map<string, AuditRow>();
		for (const row of (ownActionsResult.data ?? []) as AuditRow[]) {
			byId.set(row.id, row);
		}
		for (const row of staffAnchored) {
			byId.set(row.id, row);
		}

		const merged = Array.from(byId.values())
			.map((row) => {
				if (row.resource_id && labelMap.has(row.resource_id)) {
					const entry = labelMap.get(row.resource_id)!;
					return {
						...row,
						record_label: entry.label,
						record_summary: entry.summary,
					};
				}
				return row;
			})
			.sort((a, b) => b.created_at.localeCompare(a.created_at));

		return NextResponse.json({ data: merged.slice(0, 200) });
	} catch (error) {
		console.error("GET /api/user/audit-logs error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
