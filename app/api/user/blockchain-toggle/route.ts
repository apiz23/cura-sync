import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase-admin";
import { requirePatientSession } from "@/lib/authz";

export async function GET(req: Request) {
    try {
        const patient = await requirePatientSession(req);
        if (patient instanceof NextResponse) return patient;

        const { data: profile } = await supabaseAdmin
            .from("cura_profiles")
            .select("blockchain_protection_enabled")
            .eq("id", patient.profileId)
            .maybeSingle();

        // Find the patient's facility plan (use their first registered facility).
        const { data: facilityLink } = await supabaseAdmin
            .from("cura_patient_facilities")
            .select("facility_id, cura_facilities(plan)")
            .eq("profile_id", patient.profileId)
            .limit(1)
            .maybeSingle();

        const facilityPlan =
            (facilityLink?.cura_facilities as { plan?: string } | null)?.plan ?? null;

        return NextResponse.json({
            enabled: profile?.blockchain_protection_enabled ?? false,
            facilityPlan,
        });
    } catch (err) {
        console.error("GET /api/user/blockchain-toggle error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const patient = await requirePatientSession(req);
        if (patient instanceof NextResponse) return patient;

        const body = (await req.json()) as { enabled: boolean };
        if (typeof body.enabled !== "boolean") {
            return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("cura_profiles")
            .update({ blockchain_protection_enabled: body.enabled })
            .eq("id", patient.profileId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ enabled: body.enabled });
    } catch (err) {
        console.error("PATCH /api/user/blockchain-toggle error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
