import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requirePatientSession } from "@/lib/authz";

/* =========================
   GET /api/user/medications
   (patient-only)
   ========================= */
export async function GET(_req: NextRequest) {
    const patient = await requirePatientSession();
    if (patient instanceof NextResponse) return patient;

    const { data, error } = await supabase
        .from("cura_medications")
        .select("*")
        .eq("profile_id", patient.profileId)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
}

