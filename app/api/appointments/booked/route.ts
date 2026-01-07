import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

function formatTime(t: string) {
    const [hour, minute] = t.split(":");
    return `${hour}:${minute}`;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json(
                { error: "date is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("cura_appointments")
            .select("start_time, end_time, status")
            .eq("appointment_date", date)
            .in("status", ["PENDING", "CONFIRMED"]);

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
