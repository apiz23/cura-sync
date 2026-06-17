import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import supabaseAdmin from "@/lib/supabase-admin";

export async function POST() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const clerkRole = (user.publicMetadata?.role as string | undefined)?.toLowerCase();
        const fullName = `${user.firstName ?? ""} ${
            user.lastName ?? ""
        }`.trim();
        const email = user.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json(
                { error: "No email address on Clerk account" },
                { status: 400 }
            );
        }

        const newId = user.id;

        // Detect email collision: same email, different Clerk ID (env mismatch or re-registration)
        const { data: existingByEmail } = await supabaseAdmin
            .from("cura_profiles")
            .select("id")
            .eq("email", email)
            .neq("id", newId)
            .maybeSingle();

        if (existingByEmail?.id) {
            await migrateProfileId(existingByEmail.id, newId);
        }

        // Prefer Clerk metadata role; fall back to existing DB role so a
        // caregiver role set by the redeem route is never overwritten with "patient".
        const { data: existing } = await supabaseAdmin
            .from("cura_profiles")
            .select("role")
            .eq("id", newId)
            .maybeSingle();

        const ALLOWED_ROLES = ["patient", "caregiver", "admin", "staff"];
        const dbRole = typeof existing?.role === "string" ? existing.role.toLowerCase() : null;
        const resolvedRole =
            clerkRole && ALLOWED_ROLES.includes(clerkRole) ? clerkRole :
            dbRole && ALLOWED_ROLES.includes(dbRole) ? dbRole :
            "patient";

        const userData = {
            id: newId,
            email,
            full_name: fullName,
            avatar_url: user.imageUrl,
            role: resolvedRole,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from("cura_profiles")
            .upsert(userData, { onConflict: "id" })
            .select();

        if (error) {
            console.error("Supabase Sync Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Internal Sync Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Migrate all profile data from oldId to newId when a Clerk ID mismatch is detected.
// This happens when a user's email exists in the DB under a different Clerk instance ID
// (e.g. after switching from a dev Clerk environment to prod).
async function migrateProfileId(oldId: string, newId: string) {
    // Tables where profile_id is a non-PK text column referencing cura_profiles.id
    const profileIdTables = [
        "cura_conditions",
        "cura_allergies",
        "cura_medications",
        "cura_medication_logs",
        "cura_appointments",
        "cura_encounters",
        "cura_procedures",
        "cura_health_sync_snapshots",
        "cura_notifications",
        "cura_patient_facilities",
    ] as const;

    await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profileIdTables.map((table) =>
            supabaseAdmin
                .from(table as any)
                .update({ profile_id: newId })
                .eq("profile_id", oldId)
        )
    );

    // cura_caregiver_links has two separate profile_id columns
    await Promise.all([
        supabaseAdmin
            .from("cura_caregiver_links")
            .update({ caregiver_profile_id: newId })
            .eq("caregiver_profile_id", oldId),
        supabaseAdmin
            .from("cura_caregiver_links")
            .update({ patient_profile_id: newId })
            .eq("patient_profile_id", oldId),
    ]);

    // cura_patient_profiles: profile_id IS the primary key — must delete + re-insert
    const { data: oldPatientProfile } = await supabaseAdmin
        .from("cura_patient_profiles")
        .select("*")
        .eq("profile_id", oldId)
        .maybeSingle();

    if (oldPatientProfile) {
        await supabaseAdmin
            .from("cura_patient_profiles")
            .upsert(
                { ...oldPatientProfile, profile_id: newId },
                { onConflict: "profile_id" }
            );
        await supabaseAdmin
            .from("cura_patient_profiles")
            .delete()
            .eq("profile_id", oldId);
    }

    // Remove the old profile row — the caller's upsert will create the new one
    await supabaseAdmin.from("cura_profiles").delete().eq("id", oldId);

    console.log(`[sync] Migrated profile ${oldId} → ${newId}`);
}
