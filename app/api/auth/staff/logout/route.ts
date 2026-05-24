import { NextRequest, NextResponse } from "next/server";
import { STAFF_SESSION_COOKIE, getStaffSessionFromRequest } from "@/lib/staff-session";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
    // Best-effort: read session before clearing cookie so we can log the logout.
    const session = await getStaffSessionFromRequest(req);
    if (session) {
        void logAudit({
            actor_id: session.staffId,
            actor_type: "staff",
            action: "LOGOUT",
            resource_type: "session",
            metadata: { role: session.role },
        });
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
