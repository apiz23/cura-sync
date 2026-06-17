import { NextResponse } from "next/server";

import supabase from "@/lib/supabase";
import { requireUserSession } from "@/lib/authz";

export async function GET(req: Request) {
    try {
        const patient = await requireUserSession(req);
        if (patient instanceof NextResponse) return patient;

        const { data, error } = await supabase
            .from("cura_notifications")
            .select("id, type, title, body, severity, read, metadata, created_at")
            .eq("profile_id", patient.profileId)
            .eq("read", false)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data ?? [] });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const patient = await requireUserSession(req);
        if (patient instanceof NextResponse) return patient;

        const body = await req.json().catch(() => ({}));
        const ids: string[] | undefined = body?.ids;

        let query = supabase
            .from("cura_notifications")
            .update({ read: true })
            .eq("profile_id", patient.profileId);

        if (Array.isArray(ids) && ids.length > 0) {
            query = query.in("id", ids);
        }

        const { error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notifications update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
