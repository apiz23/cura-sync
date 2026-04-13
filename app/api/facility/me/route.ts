import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";

export async function GET(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { data: facility, error: facilityError } = await supabase
        .from("cura_facilities")
        .select("*")
        .eq("id", session.facilityId)
        .single();

    if (facilityError || !facility) {
        return NextResponse.json(
            { error: "Facility not found" },
            { status: 404 }
        );
    }

    const { data: schedules, error: scheduleError } = await supabase
        .from("cura_facility_schedules")
        .select("*")
        .eq("facility_id", session.facilityId)
        .order("day_of_week", { ascending: true });

    if (scheduleError) {
        return NextResponse.json(
            { error: "Failed to load schedules" },
            { status: 500 }
        );
    }

    return NextResponse.json({ facility, schedules: schedules ?? [] });
}

