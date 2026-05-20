import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caregiver role.
    const { data: profile, error: profileError } = await supabase
        .from("cura_profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (profileError || !profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.role !== "caregiver") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch active caregiver links with patient profiles.
    const { data: links, error: linksError } = await supabase
        .from("cura_caregiver_links")
        .select(`
            id,
            relationship,
            status,
            created_at,
            patient:cura_profiles!cura_caregiver_links_patient_fkey(
                id,
                full_name,
                email,
                avatar_url,
                patient_profile:cura_patient_profiles(
                    date_of_birth,
                    gender,
                    blood_type,
                    allergies,
                    chronic_conditions
                )
            )
        `)
        .eq("caregiver_profile_id", userId)
        .eq("status", "ACTIVE");

    if (linksError) {
        return NextResponse.json({ error: linksError.message }, { status: 500 });
    }

    const patients = (links ?? []).map((link) => {
        const patient = Array.isArray(link.patient) ? link.patient[0] : link.patient;
        const pp = Array.isArray(patient?.patient_profile)
            ? patient.patient_profile[0]
            : patient?.patient_profile ?? null;

        return {
            link_id: link.id,
            relationship: link.relationship ?? null,
            linked_since: link.created_at,
            patient: {
                id: patient?.id ?? null,
                full_name: patient?.full_name ?? null,
                email: patient?.email ?? null,
                avatar_url: patient?.avatar_url ?? null,
                date_of_birth: pp?.date_of_birth ?? null,
                gender: pp?.gender ?? null,
                blood_type: pp?.blood_type ?? null,
                allergies: pp?.allergies ?? null,
                chronic_conditions: pp?.chronic_conditions ?? null,
            },
        };
    });

    return NextResponse.json({ data: patients });
}
