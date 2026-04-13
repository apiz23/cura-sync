import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { ensureFacilityAccess, requireAdminStaffSession } from "@/lib/authz";
import { normalizeStaffRole } from "@/lib/staff-role";

export async function POST(req: NextRequest) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const body = await req.json();
        const { fullName, email, password, role, specialization, facilityId } = body;

        if (!fullName || !email || !role || !facilityId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        let hashedPassword: string | null = null;
        if (password && password.trim() !== "") {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const effectiveFacilityId = facilityId ?? session.facilityId;
        const facilityAccess = ensureFacilityAccess(session, effectiveFacilityId);
        if (facilityAccess instanceof NextResponse) return facilityAccess;

        const { data, error } = await supabase
            .from("cura_staff_profiles") 
            .insert({
                full_name: fullName,
                email: String(email).trim().toLowerCase(),
                password: hashedPassword,
                role: normalizeStaffRole(role),
                specialization: specialization || null,
                facility_id: effectiveFacilityId,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(
            { message: "Staff account created", data },
            { status: 201 }
        );
    } catch (err) {
        console.error("Register Staff Error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
