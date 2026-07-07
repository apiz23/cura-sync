import { NextRequest, NextResponse } from "next/server";

import { requireStaffSession, type StaffSession } from "@/lib/authz";
import { anchorRecord } from "@/lib/record-anchor";
import supabase from "@/lib/supabase";
import supabaseAdmin from "@/lib/supabase-admin";

const TABLE_BY_RECORD_TYPE = {
	allergy: "cura_allergies",
	condition: "cura_conditions",
	encounter: "cura_encounters",
	procedure: "cura_procedures",
} as const;

type RecordType = keyof typeof TABLE_BY_RECORD_TYPE;

// Admin and doctor can access any patient's records.
// Regular staff (receptionist/nurse) must have the patient registered at their facility.
async function ensurePatientAccess(
	session: StaffSession,
	patientId: string,
): Promise<NextResponse | void> {
	if (session.isAdmin || session.role === "doctor") return;

	const { data, error } = await supabase
		.from("cura_patient_facilities")
		.select("id")
		.eq("facility_id", session.facilityId)
		.eq("profile_id", patientId)
		.maybeSingle();

	if (error) {
		return NextResponse.json({ error: "Access check failed" }, { status: 500 });
	}
	if (!data) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function normalizeRecordType(value: unknown): RecordType | null {
	if (typeof value !== "string") return null;
	const lowered = value.trim().toLowerCase();
	if (lowered in TABLE_BY_RECORD_TYPE) return lowered as RecordType;
	return null;
}

function buildUpdateRow(
	recordType: RecordType,
	fields: Record<string, unknown>,
): Record<string, unknown> {
	switch (recordType) {
		case "condition": {
			const row: Record<string, unknown> = {};
			if ("name" in fields) row.name = fields.name;
			if ("status" in fields) row.status = fields.status;
			if ("severity" in fields) row.severity = fields.severity;
			if ("onset_date" in fields) row.onset_date = fields.onset_date;
			if ("notes" in fields) row.notes = fields.notes;
			return row;
		}
		case "allergy": {
			const row: Record<string, unknown> = {};
			if ("allergen" in fields) row.allergen = fields.allergen;
			if ("reaction" in fields) row.reaction = fields.reaction;
			if ("severity" in fields) row.severity = fields.severity;
			if ("status" in fields) row.status = fields.status;
			if ("notes" in fields) row.notes = fields.notes;
			return row;
		}
		case "procedure": {
			const row: Record<string, unknown> = {};
			if ("name" in fields) row.name = fields.name;
			if ("procedure_date" in fields) row.procedure_date = fields.procedure_date;
			if ("facility_name" in fields) row.facility_name = fields.facility_name;
			if ("outcome" in fields) row.outcome = fields.outcome;
			if ("notes" in fields) row.notes = fields.notes;
			return row;
		}
		case "encounter": {
			const row: Record<string, unknown> = {};
			if ("encounter_type" in fields) row.encounter_type = fields.encounter_type;
			if ("encounter_date" in fields) row.encounter_date = fields.encounter_date;
			if ("facility_name" in fields) row.facility_name = fields.facility_name;
			if ("provider_name" in fields) row.provider_name = fields.provider_name;
			if ("reason" in fields) row.reason = fields.reason;
			if ("diagnosis_summary" in fields) row.diagnosis_summary = fields.diagnosis_summary;
			if ("notes" in fields) row.notes = fields.notes;
			return row;
		}
	}
}

function validateRequiredFields(
	recordType: RecordType,
	row: Record<string, unknown>,
): string | null {
	switch (recordType) {
		case "condition":
		case "procedure":
			return "name" in row && row.name ? null : "name is required";
		case "allergy":
			return "allergen" in row && row.allergen ? null : "allergen is required";
		case "encounter":
			return "encounter_type" in row && row.encounter_type
				? null
				: "encounter_type is required";
	}
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; recordId: string }> },
) {
	const session = await requireStaffSession(req);
	if (session instanceof NextResponse) return session;

	const { id, recordId } = await params;
	const facilityCheck = await ensurePatientAccess(session, id);
	if (facilityCheck instanceof NextResponse) return facilityCheck;

	const body = (await req.json()) as Record<string, unknown>;
	const recordType = normalizeRecordType(body.record_type);
	if (!recordType) {
		return NextResponse.json({ error: "Invalid record_type" }, { status: 400 });
	}

	const table = TABLE_BY_RECORD_TYPE[recordType];

	const { data: existing, error: existingError } = await supabase
		.from(table)
		.select("*")
		.eq("id", recordId)
		.eq("profile_id", id)
		.maybeSingle();

	if (existingError) {
		return NextResponse.json({ error: existingError.message }, { status: 500 });
	}
	if (!existing) {
		return NextResponse.json({ error: "Record not found" }, { status: 404 });
	}

	const { record_type, ...fields } = body;
	void record_type;

	const updateRow = buildUpdateRow(recordType, fields);
	if (Object.keys(updateRow).length === 0) {
		return NextResponse.json(
			{ error: "No editable fields provided" },
			{ status: 400 },
		);
	}

	const mergedRow = {
		...(existing as Record<string, unknown>),
		...updateRow,
	};

	const validationError = validateRequiredFields(recordType, mergedRow);
	if (validationError) {
		return NextResponse.json({ error: validationError }, { status: 400 });
	}

	const { data: updated, error: updateError } = await supabase
		.from(table)
		.update(updateRow)
		.eq("id", recordId)
		.eq("profile_id", id)
		.select()
		.single();

	if (updateError) {
		return NextResponse.json({ error: updateError.message }, { status: 400 });
	}

	const updatedRow = updated as Record<string, unknown> & { id: string };

	const [profileResult, facilityPlanAllowed] = await Promise.all([
		supabaseAdmin
			.from("cura_profiles")
			.select("blockchain_protection_enabled")
			.eq("id", id)
			.maybeSingle(),
		import("@/lib/plan-guard").then((m) => m.facilityBlockchainAllowed(session.facilityId)),
	]);
	const patientBlockchainEnabled =
		(profileResult.data?.blockchain_protection_enabled ?? false) && facilityPlanAllowed;

	const anchor = await anchorRecord({
		table,
		recordId: updatedRow.id,
		row: updatedRow,
		resourceType: recordType,
		actor: { actor_id: session.staffId, actor_type: "staff" },
		action: "UPDATE",
		patientBlockchainEnabled,
	});

	return NextResponse.json({
		...updatedRow,
		blockchain: {
			content_hash: anchor.contentHash,
			tx_hash: anchor.txHash,
			block_number: anchor.blockNumber,
			explorer_url: null,
			skipped: anchor.skipped,
			error: anchor.error ?? null,
		},
	});
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; recordId: string }> },
) {
	const session = await requireStaffSession(req);
	if (session instanceof NextResponse) return session;

	const { id, recordId } = await params;
	const facilityCheck = await ensurePatientAccess(session, id);
	if (facilityCheck instanceof NextResponse) return facilityCheck;

	const url = new URL(req.url);
	const recordType = normalizeRecordType(url.searchParams.get("record_type"));
	if (!recordType) {
		return NextResponse.json(
			{ error: "Invalid or missing record_type query param" },
			{ status: 400 },
		);
	}

	const table = TABLE_BY_RECORD_TYPE[recordType];

	// Fetch before delete so we can hash the final state into the anchor.
	const { data: existing, error: fetchError } = await supabaseAdmin
		.from(table)
		.select("*")
		.eq("id", recordId)
		.eq("profile_id", id)
		.maybeSingle();

	if (fetchError) {
		return NextResponse.json({ error: fetchError.message }, { status: 500 });
	}
	if (!existing) {
		return NextResponse.json({ error: "Record not found" }, { status: 404 });
	}

	const { error: deleteError } = await supabaseAdmin
		.from(table)
		.delete()
		.eq("id", recordId)
		.eq("profile_id", id);

	if (deleteError) {
		return NextResponse.json({ error: deleteError.message }, { status: 400 });
	}

	// Anchor DELETE action so the on-chain history records this deletion event.
	const anchor = await anchorRecord({
		table,
		recordId,
		row: existing as Record<string, unknown>,
		resourceType: recordType,
		actor: { actor_id: session.staffId, actor_type: "staff" },
		action: "DELETE",
	});

	return NextResponse.json({
		deleted: true,
		blockchain: {
			content_hash: anchor.contentHash,
			tx_hash: anchor.txHash,
			block_number: anchor.blockNumber,
			explorer_url: null,
			skipped: anchor.skipped,
			error: anchor.error ?? null,
		},
	});
}
