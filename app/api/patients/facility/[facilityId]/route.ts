import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { ensureFacilityAccess, requireStaffSession } from "@/lib/authz";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ facilityId: string }> }
) {
    const { facilityId } = await params;

    const session = await requireStaffSession(request);
    if (session instanceof NextResponse) return session;

    if (!facilityId) {
        return NextResponse.json(
            { error: "facilityId is required" },
            { status: 400 }
        );
    }

    const facilityAccess = ensureFacilityAccess(session, facilityId);
    if (facilityAccess instanceof NextResponse) return facilityAccess;

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
