import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

/* =========================
   Types
========================= */
type AppointmentApiRow = {
    id: string;
    profile_id: string | null;
    facility_id: string | null;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    reason_for_visit: string | null;
    created_at: string;
    cura_profiles: {
        name: string | null;
    }[];
    cura_facilities: {
        name: string | null;
    }[];
};

/* =========================
   GET
========================= */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const facility_id = searchParams.get("facility_id");
        const profile_id = searchParams.get("profile_id");
        const date = searchParams.get("date");

        let query = supabase
            .from("cura_appointments")
            .select(
                `
                id,
                profile_id,
                facility_id,
                appointment_date,
                start_time,
                end_time,
                status,
                reason_for_visit,
                created_at,
                cura_profiles:profile_id (
                    name
                ),
                cura_facilities:facility_id (
                    name
                )
            `
            )
            .order("appointment_date", { ascending: true })
            .order("start_time", { ascending: true });

        if (facility_id) query = query.eq("facility_id", facility_id);
        if (profile_id) query = query.eq("profile_id", profile_id);
        if (date) query = query.eq("appointment_date", date);

        const { data, error } = await query;

        if (error) {
            console.error("Fetch appointments error:", error);
            return NextResponse.json(
                { error: "Failed to fetch appointments" },
                { status: 500 }
            );
        }

        const rows = data as AppointmentApiRow[] | null;

        const formatted = (rows ?? []).map((appt) => ({
            ...appt,
            patient_name: appt.cura_profiles[0]?.name ?? "Unknown Patient",
            facility_name: appt.cura_facilities[0]?.name ?? "Unknown Facility",
        }));

        return NextResponse.json({ data: formatted }, { status: 200 });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* =========================
   Helpers
========================= */
function processTimes(startStr: string, endStr?: string) {
    try {
        const startDate = new Date(`2000-01-01 ${startStr}`);
        if (isNaN(startDate.getTime())) return null;

        const formattedStartTime = startDate.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });

        let formattedEndTime: string;

        if (endStr) {
            const endDate = new Date(`2000-01-01 ${endStr}`);
            if (isNaN(endDate.getTime())) return null;

            formattedEndTime = endDate.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
            });
        } else {
            startDate.setHours(startDate.getHours() + 1);
            formattedEndTime = startDate.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        return { startTime: formattedStartTime, endTime: formattedEndTime };
    } catch {
        return null;
    }
}

/* =========================
   POST
========================= */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            profile_id,
            facility_id,
            appointment_date,
            start_time,
            end_time,
            reason_for_visit,
        } = body as {
            profile_id?: string;
            facility_id?: string;
            appointment_date?: string;
            start_time?: string;
            end_time?: string;
            reason_for_visit?: string;
        };

        if (!profile_id || !facility_id || !appointment_date || !start_time) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const times = processTimes(start_time, end_time);
        if (!times) {
            return NextResponse.json(
                { error: "Invalid time format" },
                { status: 400 }
            );
        }

        const { data: existingBooking, error: checkError } = await supabase
            .from("cura_appointments")
            .select("id")
            .eq("facility_id", facility_id)
            .eq("appointment_date", appointment_date)
            .eq("start_time", times.startTime)
            .in("status", ["PENDING", "CONFIRMED"])
            .maybeSingle();

        if (checkError) {
            return NextResponse.json(
                { error: "Check failed" },
                { status: 500 }
            );
        }

        if (existingBooking) {
            return NextResponse.json(
                { error: "Sorry, this slot was just booked by someone else." },
                { status: 409 }
            );
        }

        const { data, error } = await supabase
            .from("cura_appointments")
            .insert([
                {
                    profile_id,
                    facility_id,
                    appointment_date,
                    start_time: times.startTime,
                    end_time: times.endTime,
                    reason_for_visit: reason_for_visit ?? "",
                    status: "CONFIRMED",
                },
            ])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
