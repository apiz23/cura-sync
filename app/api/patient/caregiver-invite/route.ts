import { NextRequest, NextResponse } from "next/server";
import { requirePatientSession } from "@/lib/authz";
import supabaseAdmin from "@/lib/supabase-admin";

function generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
    const session = await requirePatientSession(req);
    if (session instanceof NextResponse) return session;

    const patientId = session.profileId;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Delete any existing unused codes for this patient so only one is active at a time.
    const { error: deleteError } = await supabaseAdmin
        .from("cura_caregiver_invite_codes")
        .delete()
        .eq("patient_id", patientId)
        .is("used_at", null);

    if (deleteError) {
        return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
    }

    const code = generateCode();

    const { error } = await supabaseAdmin
        .from("cura_caregiver_invite_codes")
        .insert({ patient_id: patientId, code, expires_at: expiresAt });

    if (error) {
        return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
    }

    return NextResponse.json({ data: { code, expiresAt } }, { status: 201 });
}
