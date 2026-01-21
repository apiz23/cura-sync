import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from("cura_facilities")
        .select("*")
        .eq("is_active", true);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ facility: data });
}

export async function PUT(req: Request) {
    const body = await req.json();

    const {
        id,
        name,
        type,
        specialty,
        address,
        latitude,
        longitude,
        is_active,
    } = body;

    if (!id || !name || !address) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const { error } = await supabase
        .from("cura_facilities")
        .update({
            name,
            type,
            specialty,
            address,
            latitude,
            longitude,
            is_active,
        })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
