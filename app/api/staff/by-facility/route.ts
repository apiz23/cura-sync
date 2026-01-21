import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

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
        .from("cura_staff_profiles")
        .select(
            `
                id,
                full_name,
                role,
                specialization,
                license_number,
                facility_id,
                years_of_experience,
                availability,
                created_at,
                email
            `
        )
        .eq("facility_id", facilityId)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: data });
}
