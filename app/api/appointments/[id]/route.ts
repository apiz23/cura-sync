import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { ensureFacilityAccess, requireStaffSession } from "@/lib/authz";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await req.json();

    const { data: existing, error: existingError } = await supabase
        .from("cura_appointments")
        .select("id, facility_id")
        .eq("id", id)
        .single();

    if (existingError || !existing) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const facilityAccess = ensureFacilityAccess(session, existing.facility_id);
    if (facilityAccess instanceof NextResponse) return facilityAccess;

    const payload = {
        status: body.status,
        reason_for_visit: body.reason_for_visit ?? "",
    };

    const { data, error } = await supabase
        .from("cura_appointments")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
