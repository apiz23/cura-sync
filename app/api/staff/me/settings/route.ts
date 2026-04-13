import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";

type SettingsBody = {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    schedule_notifications?: boolean;
    security_alerts?: boolean;
    marketing_emails?: boolean;
};

export async function PATCH(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const body = (await req.json()) as SettingsBody;
        const now = new Date().toISOString();

        const updateData = {
            staff_id: session.staffId,
            email_notifications: body.email_notifications ?? true,
            sms_notifications: body.sms_notifications ?? false,
            schedule_notifications: body.schedule_notifications ?? true,
            security_alerts: body.security_alerts ?? true,
            marketing_emails: body.marketing_emails ?? false,
            last_seen_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase
            .from("cura_staff_account_settings")
            .upsert(updateData, { onConflict: "staff_id" })
            .select(
                `
                email_notifications,
                sms_notifications,
                schedule_notifications,
                security_alerts,
                marketing_emails,
                session_version,
                last_login_at,
                last_seen_at,
                password_changed_at,
                created_at,
                updated_at
            `
            )
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update settings" },
            { status: 500 }
        );
    }
}
