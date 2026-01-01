import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: "Profile ID is required" },
            { status: 400 }
        );
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
