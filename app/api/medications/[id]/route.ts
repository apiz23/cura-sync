import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireAnySession } from "@/lib/authz";

function canManagePrescriptions(session: Awaited<ReturnType<typeof requireAnySession>>) {
    return (
        !(session instanceof NextResponse) &&
        session.kind === "staff" &&
        (session.role === "doctor" || session.role === "admin")
    );
}

/* =========================
   PATCH /api/medications/[id]
   ========================= */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;

    if (!canManagePrescriptions(session)) {
        return NextResponse.json(
            { error: "Only doctors or admins can update prescriptions" },
            { status: 403 }
        );
    }

    const { id } = await params;

    const { data: existing, error: existingError } = await supabase
        .from("cura_medications")
        .select("id, profile_id")
        .eq("id", id)
        .single();

    if (existingError || !existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: reg } = await supabase
        .from("cura_patient_facilities")
        .select("id")
        .eq("profile_id", existing.profile_id)
        .eq("facility_id", session.facilityId)
        .eq("status", "active")
        .maybeSingle();

    if (!reg) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const allowedUpdates = {
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        schedule: body.schedule,
        start_date: body.start_date,
        end_date: body.end_date,
        notes: body.notes,
        prescribed_by: body.prescribed_by,
        status: body.status,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("cura_medications")
        .update(allowedUpdates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

/* =========================
   DELETE /api/medications/[id]
   ========================= */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;

    if (!canManagePrescriptions(session)) {
        return NextResponse.json(
            { error: "Only doctors or admins can delete prescriptions" },
            { status: 403 }
        );
    }

    const { id } = await params;

    const { data: existing, error: existingError } = await supabase
        .from("cura_medications")
        .select("id, profile_id")
        .eq("id", id)
        .single();

    if (existingError || !existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: reg } = await supabase
        .from("cura_patient_facilities")
        .select("id")
        .eq("profile_id", existing.profile_id)
        .eq("facility_id", session.facilityId)
        .eq("status", "active")
        .maybeSingle();

    if (!reg) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
        .from("cura_medications")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
