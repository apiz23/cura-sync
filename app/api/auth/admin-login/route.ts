import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { STAFF_SESSION_COOKIE, signStaffSession } from "@/lib/staff-session";
import { normalizeStaffRole } from "@/lib/staff-role";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 }
            );
        }

        const { data: user, error } = await supabase
            .from("cura_staff_profiles")
            .select("id, facility_id, role, password")
            .ilike("email", normalizedEmail)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        if (!user.password) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const normalizedRole = normalizeStaffRole(user.role);
        const now = new Date().toISOString();

        const { data: settings, error: settingsError } = await supabase
            .from("cura_staff_account_settings")
            .upsert(
                {
                    staff_id: user.id,
                    last_login_at: now,
                    last_seen_at: now,
                    updated_at: now,
                },
                { onConflict: "staff_id" }
            )
            .select("session_version")
            .single();

        if (settingsError) {
            console.error("Failed to initialize admin session settings:", settingsError);
            return NextResponse.json(
                { error: "Unable to initialize admin session" },
                { status: 500 }
            );
        }

        const token = await signStaffSession({
            staffId: user.id,
            facilityId: user.facility_id,
            role: normalizedRole,
            sessionVersion: settings?.session_version ?? 1,
        });

        const res = NextResponse.json(
            {
                success: true,
                staffId: user.id,
                role: normalizedRole,
                facilityId: user.facility_id,
            },
            { status: 200 }
        );

        res.cookies.set(STAFF_SESSION_COOKIE, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        void logAudit({
            actor_id: user.id,
            actor_type: "staff",
            action: "LOGIN",
            resource_type: "session",
            metadata: { role: normalizedRole, facility_id: user.facility_id },
        });

        return res;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
