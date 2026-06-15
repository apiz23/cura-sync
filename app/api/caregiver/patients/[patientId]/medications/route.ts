import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireCaregiverSession } from "@/lib/authz";
import { presentMedications } from "@/lib/medication-presenter";

async function verifyCaregiverLink(caregiverId: string, patientId: string): Promise<boolean> {
    const { data } = await supabase
        .from("cura_caregiver_links")
        .select("id")
        .eq("caregiver_profile_id", caregiverId)
        .eq("patient", patientId)
        .eq("status", "ACTIVE")
        .maybeSingle();
    return !!data;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ patientId: string }> }
) {
    const session = await requireCaregiverSession(req);
    if (session instanceof NextResponse) return session;

    const { patientId } = await params;

    const linked = await verifyCaregiverLink(session.profileId, patientId);
    if (!linked) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .select("*")
        .eq("profile_id", patientId)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(await presentMedications(data ?? []));
}
