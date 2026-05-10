import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { ensureFacilityAccess, requireAdminStaffSession } from "@/lib/authz";
import { normalizeStaffRole } from "@/lib/staff-role";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const { fullName, email, password, role, specialization, facilityId } =
            await req.json();

        if (!fullName || !email || !password || !role || !facilityId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const effectiveFacilityId = facilityId ?? session.facilityId;
        const facilityAccess = ensureFacilityAccess(session, effectiveFacilityId);
        if (facilityAccess instanceof NextResponse) return facilityAccess;

        const { error } = await supabase.from("cura_staff_profiles").insert({
            id: uuidv4(),
            full_name: fullName,
            email: String(email).trim().toLowerCase(),
            password: hashedPassword,
            role: normalizeStaffRole(role),
            specialization: specialization || null,
            facility_id: effectiveFacilityId,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        void logAudit({
            actor_id: session.staffId,
            actor_type: "staff",
            action: "CREATE",
            resource_type: "staff",
            metadata: { email: String(email).trim().toLowerCase(), role: normalizeStaffRole(role), facility_id: effectiveFacilityId },
        });

        return NextResponse.json(
            { success: true, message: "Staff registered" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
