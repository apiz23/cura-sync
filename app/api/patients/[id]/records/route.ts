import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import supabaseAdmin from "@/lib/supabase-admin";
import { requireStaffSession, type StaffSession } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { anchorRecord } from "@/lib/record-anchor";

// Admin and doctor can access any patient's records.
// Regular staff (receptionist/nurse) must have the patient registered at their facility.
async function ensurePatientAccess(
    session: StaffSession,
    patientId: string
): Promise<NextResponse | void> {
    if (session.isAdmin || session.role === "doctor") return;

    const { data, error } = await supabase
        .from("cura_patient_facilities")
        .select("id")
        .eq("facility_id", session.facilityId)
        .eq("profile_id", patientId)
        .maybeSingle();

    if (error) return NextResponse.json({ error: "Access check failed" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const facilityCheck = await ensurePatientAccess(session, id);
    if (facilityCheck instanceof NextResponse) return facilityCheck;

    const [conditions, allergies, procedures, encounters] = await Promise.all([
        supabase
            .from("cura_conditions")
            .select("*")
            .eq("profile_id", id)
            .order("onset_date", { ascending: false, nullsFirst: false }),
        supabase
            .from("cura_allergies")
            .select("*")
            .eq("profile_id", id)
            .order("created_at", { ascending: false }),
        supabase
            .from("cura_procedures")
            .select("*")
            .eq("profile_id", id)
            .order("procedure_date", { ascending: false, nullsFirst: false }),
        supabase
            .from("cura_encounters")
            .select("*")
            .eq("profile_id", id)
            .order("encounter_date", { ascending: false }),
    ]);

    const { data: patientProfile } = await supabaseAdmin
        .from("cura_profiles")
        .select("blockchain_protection_enabled")
        .eq("id", id)
        .maybeSingle();

    void logAudit({
        actor_id: session.staffId,
        actor_type: "staff",
        action: "READ",
        resource_type: "patient_records",
        resource_id: id,
    });

    return NextResponse.json({
        conditions: conditions.data ?? [],
        allergies: allergies.data ?? [],
        procedures: procedures.data ?? [],
        encounters: encounters.data ?? [],
        blockchainProtectionEnabled: patientProfile?.blockchain_protection_enabled ?? false,
    });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const facilityCheck = await ensurePatientAccess(session, id);
    if (facilityCheck instanceof NextResponse) return facilityCheck;

    const body = (await req.json()) as Record<string, unknown>;
    const { record_type, ...fields } = body;

    type InsertRow = Record<string, unknown>;
    let table: string;
    let row: InsertRow;

    switch (record_type) {
        case "condition":
            if (!fields.name) return NextResponse.json({ error: "name is required" }, { status: 400 });
            table = "cura_conditions";
            row = {
                profile_id: id,
                name: fields.name,
                status: fields.status ?? "ACTIVE",
                severity: fields.severity ?? null,
                onset_date: fields.onset_date ?? null,
                notes: fields.notes ?? null,
            };
            break;
        case "allergy":
            if (!fields.allergen) return NextResponse.json({ error: "allergen is required" }, { status: 400 });
            table = "cura_allergies";
            row = {
                profile_id: id,
                allergen: fields.allergen,
                reaction: fields.reaction ?? null,
                severity: fields.severity ?? null,
                status: fields.status ?? "ACTIVE",
                notes: fields.notes ?? null,
            };
            break;
        case "procedure":
            if (!fields.name) return NextResponse.json({ error: "name is required" }, { status: 400 });
            table = "cura_procedures";
            row = {
                profile_id: id,
                name: fields.name,
                procedure_date: fields.procedure_date ?? null,
                facility_name: fields.facility_name ?? null,
                outcome: fields.outcome ?? null,
                notes: fields.notes ?? null,
            };
            break;
        case "encounter":
            if (!fields.encounter_type) return NextResponse.json({ error: "encounter_type is required" }, { status: 400 });
            table = "cura_encounters";
            row = {
                profile_id: id,
                encounter_type: fields.encounter_type,
                encounter_date: fields.encounter_date ?? new Date().toISOString(),
                facility_name: fields.facility_name ?? null,
                provider_name: fields.provider_name ?? null,
                reason: fields.reason ?? null,
                diagnosis_summary: fields.diagnosis_summary ?? null,
                notes: fields.notes ?? null,
            };
            break;
        default:
            return NextResponse.json({ error: "Invalid record_type" }, { status: 400 });
    }

    const { data: created, error } = await supabase
        .from(table)
        .insert(row)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const createdRow = created as Record<string, unknown> & { id: string };

    // Fetch patient's blockchain opt-in and facility plan eligibility.
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
        recordId: createdRow.id,
        row,
        resourceType: String(record_type),
        actor: { actor_id: session.staffId, actor_type: "staff" },
        patientBlockchainEnabled,
    });

    return NextResponse.json(
        {
            ...createdRow,
            blockchain: {
                content_hash: anchor.contentHash,
                tx_hash: anchor.txHash,
                block_number: anchor.blockNumber,
                explorer_url: null,
                skipped: anchor.skipped,
                error: anchor.error ?? null,
            },
        },
        { status: 201 },
    );
}
