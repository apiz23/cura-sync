import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { ensureFacilityAccess, requireStaffSession } from "@/lib/authz";

export async function GET(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get("facilityId") ?? session.facilityId;

    const facilityAccess = ensureFacilityAccess(session, facilityId);
    if (facilityAccess instanceof NextResponse) return facilityAccess;

    // 1️⃣ get active patient IDs
    const { data: patientFacilities, error: pfError } = await supabase
        .from("cura_patient_facilities")
        .select("profile_id")
        .eq("facility_id", facilityId)
        .eq("status", "active");

    if (pfError) {
        return NextResponse.json({ error: pfError.message }, { status: 500 });
    }

    const patientIds = patientFacilities.map((p) => p.profile_id);
    if (patientIds.length === 0) {
        return NextResponse.json([]);
    }

    // 2️⃣ get patient profiles + medical info
    const { data: profiles, error: profileError } = await supabase
        .from("cura_profiles")
        .select(
            `
            id,
            email,
            full_name,
            phone_number,
            avatar_url,
            created_at,
            cura_patient_profiles (
                date_of_birth,
                gender,
                blood_type,
                height_cm,
                weight_kg,
                allergies,
                chronic_conditions,
                emergency_contact
            )
        `
        )
        .in("id", patientIds)
        .eq("role", "patient");

    if (profileError) {
        return NextResponse.json(
            { error: profileError.message },
            { status: 500 }
        );
    }

    // 3️⃣ format + calculate age
    const result = profiles.map((profile) => {
        const patientProfile = profile.cura_patient_profiles;
        const medical = Array.isArray(patientProfile)
            ? (patientProfile[0] ?? {})
            : patientProfile ?? {};

        let age: number | undefined;
        if (medical.date_of_birth) {
            const dob = new Date(medical.date_of_birth);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            if (
                today.getMonth() < dob.getMonth() ||
                (today.getMonth() === dob.getMonth() &&
                    today.getDate() < dob.getDate())
            ) {
                age--;
            }
        }

        return {
            id: profile.id,
            profile_id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            phone_number: profile.phone_number,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            age,
            ...medical,
        };
    });

    return NextResponse.json(result);
}
