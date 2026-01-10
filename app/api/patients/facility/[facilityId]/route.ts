import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ facilityId: string }> }
) {
    const { facilityId } = await params;

    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!facilityId) {
        return NextResponse.json(
            { error: "facilityId is required" },
            { status: 400 }
        );
    }

    // 🧠 Fetch patients registered in this facility
    const { data, error } = await supabase
        .from("cura_patient_facilities")
        .select(
            `
            status,
            registered_at,
            cura_profiles (
                id,
                email,
                full_name,
                avatar_url,
                phone_number,
                created_at
            )
        `
        )
        .eq("facility_id", facilityId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🧹 Flatten response
    const patients = data.map((row) => ({
        ...row.cura_profiles,
        status: row.status,
        registered_at: row.registered_at,
    }));

    return NextResponse.json(patients);
}
