import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

/* =========================
   GET /api/medications
   ========================= */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profile_id");

    if (!profileId) {
        return NextResponse.json(
            { error: "profile_id is required" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

/* =========================
   POST /api/medications
   ========================= */
export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
        profile_id,
        name,
        dosage,
        frequency,
        schedule,
        start_date,
        end_date,
        notes,
        prescribed_by,
    } = body;

    if (
        !profile_id ||
        !name ||
        !dosage ||
        !frequency ||
        !schedule ||
        !start_date
    ) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .insert({
            profile_id,
            name,
            dosage,
            frequency,
            schedule,
            start_date,
            end_date,
            notes,
            prescribed_by,
            status: "ACTIVE",
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
