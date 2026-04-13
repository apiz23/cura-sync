import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { ensureFacilityAccess, requireAdminStaffSession } from "@/lib/authz";

type FacilityScheduleInput = {
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number | null;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get("facilityId");

    if (!facilityId) {
        return NextResponse.json(
            { error: "facilityId is required" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("cura_facility_schedules")
        .select("*")
        .eq("facility_id", facilityId)
        .order("day_of_week");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schedules: data });
}

export async function PUT(req: Request) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    const body: {
        facility_id: string;
        schedules: FacilityScheduleInput[];
    } = await req.json();

    const { facility_id, schedules } = body;

    if (!facility_id || !Array.isArray(schedules)) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const facilityAccess = ensureFacilityAccess(session, facility_id);
    if (facilityAccess instanceof NextResponse) return facilityAccess;

    // Remove old schedules
    const { error: deleteError } = await supabase
        .from("cura_facility_schedules")
        .delete()
        .eq("facility_id", facility_id);

    if (deleteError) {
        return NextResponse.json(
            { error: deleteError.message },
            { status: 500 }
        );
    }

    // Insert new schedules
    const { error: insertError } = await supabase
        .from("cura_facility_schedules")
        .insert(
            schedules.map((s) => ({
                facility_id,
                day_of_week: s.day_of_week,
                start_time: s.start_time,
                end_time: s.end_time,
                slot_duration_minutes: s.slot_duration_minutes,
            }))
        );

    if (insertError) {
        return NextResponse.json(
            { error: insertError.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
