import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";

function formatTime(t: string) {
    const [hour, minute] = t.split(":");
    return `${hour}:${minute}`;
}

export async function GET(req: Request) {
    try {
        const session = await requireAnySession(req);
        if (session instanceof NextResponse) return session;

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");
        const facilityId =
            searchParams.get("facilityId") ?? searchParams.get("facility_id");

        if (!date) {
            return NextResponse.json(
                { error: "date is required" },
                { status: 400 }
            );
        }

        if (session.kind === "patient" && !facilityId) {
            return NextResponse.json(
                { error: "facilityId is required" },
                { status: 400 },
            );
        }

        let query = supabase
            .from("cura_appointments")
            .select("start_time, end_time, status")
            .eq("appointment_date", date)
            .in("status", ["PENDING", "CONFIRMED", "CHECKED_IN"]);

        if (facilityId) {
            if (session.kind === "staff" && facilityId !== session.facilityId) {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 }
                );
            }
            query = query.eq("facility_id", facilityId);
        } else if (session.kind === "staff") {
            query = query.eq("facility_id", session.facilityId);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch booked slots" },
                { status: 500 }
            );
        }

        const bookedSlots = (data ?? []).map((row) => {
            const start = formatTime(row.start_time);
            const end = formatTime(row.end_time);
            return `${start} - ${end}`;
        });

        return NextResponse.json(bookedSlots, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
