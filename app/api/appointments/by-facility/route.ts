import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

type AppointmentRow = {
    id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    reason_for_visit: string | null;
    profile_id: string;
    cura_profiles: {
        full_name: string | null;
        avatar_url: string | null;
    }[];
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");

    if (!facilityId) {
        return NextResponse.json(
            { error: "facilityId is required" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("cura_appointments")
        .select(
            `
            id,
            appointment_date,
            start_time,
            end_time,
            status,
            reason_for_visit,
            profile_id,
            cura_profiles (
                full_name,
                avatar_url
            )
        `
        )
        .eq("facility_id", facilityId)
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = (data ?? []).map((appt: AppointmentRow) => {
        const profile = appt.cura_profiles?.[0] ?? null;

        return {
            id: appt.id,
            profile_id: appt.profile_id,
            appointment_date: appt.appointment_date,
            start_time: appt.start_time,
            end_time: appt.end_time,
            status: appt.status,
            reason_for_visit: appt.reason_for_visit,
            patient_name: profile?.full_name ?? "Unknown Patient",
            patient_avatar: profile?.avatar_url ?? null,
            facility_name: "Current Facility",
        };
    });

    return NextResponse.json(result);
}
