import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireAdminStaffSession } from "@/lib/authz";

export async function GET() {
    const { data, error } = await supabase
        .from("cura_facilities")
        .select(`
            id,
            name,
            type,
            specialty,
            address,
            is_active,
            created_at,
            latitude,
            longitude,
            cura_facility_schedules (
                id,
                facility_id,
                day_of_week,
                start_time,
                end_time,
                slot_duration_minutes
            )
        `)
        .eq("is_active", true);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ facility: data });
}

export async function PUT(req: Request) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();

    const {
        id,
        name,
        type,
        specialty,
        address,
        latitude,
        longitude,
        is_active,
    } = body;

    if (!id || !name || !address) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    if (id !== session.facilityId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
        .from("cura_facilities")
        .update({
            name,
            type,
            specialty,
            address,
            latitude,
            longitude,
            is_active,
        })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
