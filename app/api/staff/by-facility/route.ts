import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession, ensureFacilityAccess } from "@/lib/authz";
import { normalizeStaffRole } from "@/lib/staff-role";

export async function GET(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get("facilityId") ?? session.facilityId;

    const facilityAccess = ensureFacilityAccess(session, facilityId);
    if (facilityAccess instanceof NextResponse) return facilityAccess;

    const { data, error } = await supabase
        .from("cura_staff_profiles")
        .select(
            `
                id,
                full_name,
                role,
                specialization,
                license_number,
                facility_id,
                years_of_experience,
                availability,
                created_at,
                email
            `
        )
        .eq("facility_id", facilityId)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        staff: (data ?? []).map((member) => ({
            ...member,
            role: normalizeStaffRole(member.role),
        })),
    });
}
