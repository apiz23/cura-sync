import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";
import { normalizeStaffRole } from "@/lib/staff-role";

type StaffProfileUpdateBody = {
    full_name?: string;
    email?: string;
    specialization?: string | null;
    license_number?: string | null;
    years_of_experience?: number | null;
};

async function touchStaffSettings(staffId: string) {
    const now = new Date().toISOString();

    await supabase.from("cura_staff_account_settings").upsert(
        {
            staff_id: staffId,
            last_seen_at: now,
            updated_at: now,
        },
        { onConflict: "staff_id" }
    );
}

async function getStaffAccount(staffId: string) {
    const [{ data: staff, error: staffError }, { data: settings, error: settingsError }] =
        await Promise.all([
            supabase
                .from("cura_staff_profiles")
                .select(
                    `
                    id,
                    full_name,
                    email,
                    role,
                    specialization,
                    license_number,
                    facility_id,
                    years_of_experience,
                    availability,
                    created_at
                `
                )
                .eq("id", staffId)
                .single(),
            supabase
                .from("cura_staff_account_settings")
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
                .eq("staff_id", staffId)
                .maybeSingle(),
        ]);

    if (staffError || !staff) {
        throw new Error(staffError?.message || "Staff profile not found");
    }

    if (settingsError) {
        throw new Error(settingsError.message);
    }

    return {
        ...staff,
        role: normalizeStaffRole(staff.role),
        account_settings: settings
            ? {
                  ...settings,
                  session_version: settings.session_version ?? 1,
              }
            : null,
    };
}

export async function GET(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        await touchStaffSettings(session.staffId);
        const profile = await getStaffAccount(session.staffId);
        return NextResponse.json(profile);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to load account" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const body = (await req.json()) as StaffProfileUpdateBody;

        if (!body.full_name?.trim()) {
            return NextResponse.json(
                { error: "Full name is required" },
                { status: 400 }
            );
        }

        if (!body.email?.trim()) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const updateData = {
            full_name: body.full_name.trim(),
            email: body.email.trim().toLowerCase(),
            specialization: body.specialization?.trim() || null,
            license_number: body.license_number?.trim() || null,
            years_of_experience:
                body.years_of_experience === null ||
                body.years_of_experience === undefined ||
                Number.isNaN(body.years_of_experience)
                    ? null
                    : body.years_of_experience,
        };

        const { error } = await supabase
            .from("cura_staff_profiles")
            .update(updateData)
            .eq("id", session.staffId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        await touchStaffSettings(session.staffId);
        const profile = await getStaffAccount(session.staffId);
        return NextResponse.json(profile);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update account" },
            { status: 500 }
        );
    }
}
