import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: me, error: meError } = await supabase
        .from("cura_profiles")
        .select("role")
        .eq("id", userId)
        .single();

    if (meError || !me) {
        return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
        );
    }

    const { data, error } = await supabase
        .from("cura_profiles")
        .select("id, email, full_name, role")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
