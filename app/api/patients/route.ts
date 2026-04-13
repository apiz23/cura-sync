import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { ensureFacilityAccess, requireStaffSession } from "@/lib/authz";

export async function GET(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { data: patientFacilities, error: pfError } = await supabase
        .from("cura_patient_facilities")
        .select("profile_id")
        .eq("facility_id", session.facilityId)
        .eq("status", "active");

    if (pfError) {
        return NextResponse.json(
            { error: "Failed to fetch patients" },
            { status: 500 }
        );
    }

    const patientIds = (patientFacilities ?? []).map((p) => p.profile_id);
    if (patientIds.length === 0) return NextResponse.json([]);

    const { data, error } = await supabase
        .from("cura_profiles")
        .select(
            `
            id,
            email,
            full_name,
            role,
            avatar_url,
            phone_number,
            created_at,
            patient_profiles:cura_patient_profiles (
                date_of_birth,
                gender,
                blood_type
            )
        `
        )
        .in("id", patientIds)
        .eq("role", "patient")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch patients" },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const { profile_id, facility_id } = await req.json();

        if (!profile_id || !facility_id) {
            return NextResponse.json(
                { error: "profile_id and facility_id are required" },
                { status: 400 }
            );
        }

        const facilityAccess = ensureFacilityAccess(session, facility_id);
        if (facilityAccess instanceof NextResponse) return facilityAccess;

        // 🔒 Prevent duplicate registration
        const { data: existing } = await supabase
            .from("cura_patient_facilities")
            .select("id")
            .eq("profile_id", profile_id)
            .eq("facility_id", facility_id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { error: "User already registered to this facility" },
                { status: 409 }
            );
        }

        // ✅ Register patient to facility
        const { error } = await supabase
            .from("cura_patient_facilities")
            .insert({
                profile_id,
                facility_id,
                status: "active",
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
