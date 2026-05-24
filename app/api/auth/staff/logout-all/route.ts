import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";
import { STAFF_SESSION_COOKIE } from "@/lib/staff-session";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const now = new Date().toISOString();

    void logAudit({
        actor_id: session.staffId,
        actor_type: "staff",
        action: "LOGOUT",
        resource_type: "session",
        metadata: { role: session.role, all_sessions: true },
    });

    const { error } = await supabase.from("cura_staff_account_settings").upsert(
        {
            staff_id: session.staffId,
            session_version: session.sessionVersion + 1,
            last_seen_at: now,
            updated_at: now,
        },
        { onConflict: "staff_id" }
    );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(STAFF_SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
    return res;
}
