import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireUserSession } from "@/lib/authz";

export async function GET(req: Request) {
    try {
        const patient = await requireUserSession(req);
        if (patient instanceof NextResponse) return patient;

        const profileId = patient.profileId;

        const [conditions, allergies, procedures, encounters] = await Promise.all([
            supabase
                .from("cura_conditions")
                .select("*")
                .eq("profile_id", profileId)
                .order("onset_date", { ascending: false, nullsFirst: false }),
            supabase
                .from("cura_allergies")
                .select("*")
                .eq("profile_id", profileId)
                .order("created_at", { ascending: false }),
            supabase
                .from("cura_procedures")
                .select("*")
                .eq("profile_id", profileId)
                .order("procedure_date", { ascending: false, nullsFirst: false }),
            supabase
                .from("cura_encounters")
                .select("*")
                .eq("profile_id", profileId)
                .order("encounter_date", { ascending: false }),
        ]);

        return NextResponse.json({
            conditions: conditions.data ?? [],
            allergies: allergies.data ?? [],
            procedures: procedures.data ?? [],
            encounters: encounters.data ?? [],
        });
    } catch (error) {
        console.error("GET /api/user/records error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
