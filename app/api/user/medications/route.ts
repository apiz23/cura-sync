import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireUserSession } from "@/lib/authz";
import { presentMedications } from "@/lib/medication-presenter";

/* =========================
   GET /api/user/medications
   (patient-only)
   ========================= */
export async function GET(_req: NextRequest) {
    const patient = await requireUserSession(_req);
    if (patient instanceof NextResponse) return patient;

    const { data, error } = await supabase
        .from("cura_medications")
        .select("*")
        .eq("profile_id", patient.profileId)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(await presentMedications(data ?? []));
}
