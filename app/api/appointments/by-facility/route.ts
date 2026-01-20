import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

type Appointment = {
    id: string;
    profile_id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    reason_for_visit: string | null;
};

type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
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

    /* ==============================
     1️⃣ Fetch appointments
     ============================== */
    const { data: appointments, error: apptError } = await supabase
        .from("cura_appointments")
        .select(
            `
      id,
      profile_id,
      appointment_date,
      start_time,
      end_time,
      status,
      reason_for_visit
    `
        )
        .eq("facility_id", facilityId)
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: true });

    if (apptError) {
        return NextResponse.json({ error: apptError.message }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
        return NextResponse.json([]);
    }

    /* ==============================
     2️⃣ Collect profile IDs
     ============================== */
    const profileIds = Array.from(
        new Set(appointments.map((a) => a.profile_id))
    );

    /* ==============================
     3️⃣ Fetch profiles separately
     ============================== */
    const { data: profiles, error: profileError } = await supabase
        .from("cura_profiles")
        .select("id, full_name, avatar_url")
        .in("id", profileIds);

    if (profileError) {
        return NextResponse.json(
            { error: profileError.message },
            { status: 500 }
        );
    }

    /* ==============================
     4️⃣ Create lookup map
     ============================== */
    const profileMap = new Map<string, Profile>();

    (profiles ?? []).forEach((p) => {
        profileMap.set(p.id, p);
    });

    /* ==============================
     5️⃣ Merge result
     ============================== */
    const result = appointments.map((appt: Appointment) => {
        const profile = profileMap.get(appt.profile_id);

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
