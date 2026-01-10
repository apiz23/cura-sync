import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
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
            patient_profiles (
                date_of_birth,
                gender,
                blood_type
            )
        `
        )
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
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profile_id, facility_id, patient_profile } = body;

    if (!profile_id || !facility_id) {
        return NextResponse.json(
            { error: "profile_id and facility_id are required" },
            { status: 400 }
        );
    }

    // 1️⃣ Create / update patient medical profile
    const { error: profileError } = await supabase
        .from("cura_patient_profiles")
        .upsert({
            profile_id,
            ...patient_profile,
        });

    if (profileError) {
        console.error(profileError);
        return NextResponse.json(
            { error: "Failed to create patient profile" },
            { status: 500 }
        );
    }

    // 2️⃣ Register patient to facility
    const { error: facilityError } = await supabase
        .from("cura_patient_facilities")
        .insert({
            profile_id,
            facility_id,
            status: "active",
        });

    if (facilityError) {
        console.error(facilityError);
        return NextResponse.json(
            { error: "Patient already registered or invalid facility" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
