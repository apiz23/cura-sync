import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";
import { normalizeStaffRole } from "@/lib/staff-role";

export async function GET(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { data, error } = await supabase
        .from("cura_staff_profiles")
        .select(
            `
            id,
            full_name,
            email,
            role,
            specialization,
            license_number,
            facility_id,
            years_of_experience,
            availability,
            created_at
        `
        )
        .eq("id", session.staffId)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: "Staff profile not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        ...data,
        role: normalizeStaffRole(data.role),
        isAdmin: session.isAdmin,
    });
}
