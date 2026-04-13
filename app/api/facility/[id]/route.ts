import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireAnySession } from "@/lib/authz";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Staff can view their own facility even if inactive. Everyone else only sees active facilities.
    const query = supabase.from("cura_facilities").select("*").eq("id", id);

    const { data, error } =
        session.kind === "staff" && session.facilityId === id
            ? await query.single()
            : await query.eq("is_active", true).single();

    if (error || !data) {
        return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json({ facility: data });
}

