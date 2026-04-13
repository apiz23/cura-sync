import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

// Mobile-friendly alias endpoint (returns an array, not { facility: [...] }).
export async function GET() {
    const { data, error } = await supabase
        .from("cura_facilities")
        .select("*")
        .eq("is_active", true)
        .order("name");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
}

