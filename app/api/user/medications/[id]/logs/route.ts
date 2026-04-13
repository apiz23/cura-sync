import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requirePatientSession } from "@/lib/authz";

const ALLOWED_STATUSES = ["TAKEN", "MISSED", "SKIPPED"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

/* =========================
   POST /api/user/medications/[id]/logs
   (patient-only)
   ========================= */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const patient = await requirePatientSession();
    if (patient instanceof NextResponse) return patient;

    const body = await req.json().catch(() => ({}));
    const statusRaw = String(body?.status ?? "TAKEN").toUpperCase();
    const notes =
        body?.notes === null || body?.notes === undefined
            ? null
            : String(body.notes);

    const status = ALLOWED_STATUSES.includes(statusRaw as AllowedStatus)
        ? (statusRaw as AllowedStatus)
        : null;

    if (!status) {
        return NextResponse.json(
            { error: "Invalid status" },
            { status: 400 }
        );
    }

    const takenAt =
        typeof body?.taken_at === "string" && body.taken_at.length > 0
            ? body.taken_at
            : new Date().toISOString();

    const { data: med, error: medError } = await supabase
        .from("cura_medications")
        .select("id, profile_id")
        .eq("id", id)
        .single();

    if (medError || !med) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (med.profile_id !== patient.profileId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("cura_medication_logs").insert({
        medication_id: id,
        profile_id: patient.profileId,
        status,
        taken_at: takenAt,
        notes,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

