import { NextResponse } from "next/server";
import { STAFF_SESSION_COOKIE } from "@/lib/staff-session";

export async function POST() {
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

