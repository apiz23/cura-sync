import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requirePatientSession } from "@/lib/authz";
import { z } from "zod";

const schema = z.object({
    token: z.string().trim().min(1).nullable(),
});

export async function PUT(req: Request) {
    try {
        const session = await requirePatientSession(req);
        if (session instanceof NextResponse) return session;

        const body = await req.json().catch(() => null);
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        const { error } = await supabase
            .from("cura_profiles")
            .update({ expo_push_token: parsed.data.token })
            .eq("id", session.profileId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Push token update error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
