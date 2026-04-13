import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";

export async function GET(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { data: registrations, error: regError } = await supabase
        .from("cura_patient_facilities")
        .select("profile_id")
        .eq("facility_id", session.facilityId)
        .eq("status", "active");

    if (regError) {
        return NextResponse.json({ error: regError.message }, { status: 500 });
    }

    const registeredIds = new Set((registrations ?? []).map((r) => r.profile_id));

    const { data, error } = await supabase
        .from("cura_profiles")
        .select("id, email, full_name, role, phone_number")
        .eq("role", "patient")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        (data ?? []).map((u) => ({
            ...u,
            is_registered: registeredIds.has(u.id),
        }))
    );
}
