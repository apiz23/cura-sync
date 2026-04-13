import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireAnySession } from "@/lib/authz";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAnySession(request);
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: "Profile ID is required" },
            { status: 400 }
        );
    }

    if (session.kind === "patient" && id !== session.profileId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.kind === "staff") {
        const { data: reg } = await supabase
            .from("cura_patient_facilities")
            .select("id")
            .eq("facility_id", session.facilityId)
            .eq("profile_id", id)
            .eq("status", "active")
            .maybeSingle();

        if (!reg) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    const { data, error } = await supabase
        .from("cura_profiles")
        .select(
            `
            id,
            email,
            full_name,
            role,
            avatar_url,
            phone_number,
            created_at,
            updated_at
        `
        )
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(data);
}
