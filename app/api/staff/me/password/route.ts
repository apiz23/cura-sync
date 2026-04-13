import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";

type PasswordBody = {
    currentPassword?: string;
    newPassword?: string;
};

export async function POST(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const body = (await req.json()) as PasswordBody;

        if (!body.currentPassword || !body.newPassword) {
            return NextResponse.json(
                { error: "Current and new password are required" },
                { status: 400 }
            );
        }

        if (body.newPassword.length < 8) {
            return NextResponse.json(
                { error: "New password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const { data: user, error: userError } = await supabase
            .from("cura_staff_profiles")
            .select("password")
            .eq("id", session.staffId)
            .single();

        if (userError || !user?.password) {
            return NextResponse.json(
                { error: "Unable to verify current password" },
                { status: 400 }
            );
        }

        const matches = await bcrypt.compare(body.currentPassword, user.password);
        if (!matches) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 400 }
            );
        }

        const password = await bcrypt.hash(body.newPassword, 10);
        const now = new Date().toISOString();

        const { error: updateError } = await supabase
            .from("cura_staff_profiles")
            .update({ password })
            .eq("id", session.staffId);

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 400 }
            );
        }

        await supabase.from("cura_staff_account_settings").upsert(
            {
                staff_id: session.staffId,
                password_changed_at: now,
                last_seen_at: now,
                updated_at: now,
            },
            { onConflict: "staff_id" }
        );

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update password" },
            { status: 500 }
        );
    }
}
