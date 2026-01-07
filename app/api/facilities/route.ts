import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("cura_facilities")
            .select("id, name, address, type, latitude, longitude")
            .eq("is_active", true)
            .order("name", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
