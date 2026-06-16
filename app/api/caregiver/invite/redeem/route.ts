import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAnySession } from "@/lib/authz";
import supabaseAdmin from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
    // Redeeming a code is how a user BECOMES a caregiver — it must not require
    // being one already. requireAnySession accepts any authenticated Clerk
    // user (patient or existing caregiver) and rejects only staff/admin/doctor
    // sessions, which use a separate auth system entirely.
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;
    if (session.kind !== "patient") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const caregiverId = session.profileId;

    let body: { code?: string; relationship?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!code) {
        return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const relationship = typeof body.relationship === "string" ? body.relationship.trim() : null;

    // Look up a valid (unexpired, unused) invite.
    const { data: invite, error: inviteError } = await supabaseAdmin
        .from("cura_caregiver_invite_codes")
        .select("id, patient_id")
        .eq("code", code)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

    if (inviteError) {
        return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }
    if (!invite) {
        return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
    }

    const patientId = invite.patient_id;

    // Prevent duplicate links.
    const { data: existing } = await supabaseAdmin
        .from("cura_caregiver_links")
        .select("id")
        .eq("caregiver_profile_id", caregiverId)
        .eq("patient", patientId)
        .eq("status", "ACTIVE")
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ error: "Already linked to this patient" }, { status: 409 });
    }

    // Create the caregiver link.
    const { error: linkError } = await supabaseAdmin
        .from("cura_caregiver_links")
        .insert({
            caregiver_profile_id: caregiverId,
            patient: patientId,
            relationship: relationship || null,
            status: "ACTIVE",
        });

    if (linkError) {
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }

    // Mark invite as used.
    const { error: markError } = await supabaseAdmin
        .from("cura_caregiver_invite_codes")
        .update({ used_at: new Date().toISOString(), used_by: caregiverId })
        .eq("id", invite.id);
    if (markError) {
        console.error("Failed to mark invite as used:", markError);
    }

    // Promote to "caregiver" if this is their first link — the auth gate above
    // only required *any* signed-in account, so a first-time redeemer is still
    // role "patient" at this point. Update both Supabase (source of truth for
    // server-side role checks) and Clerk's publicMetadata (source of truth for
    // the mobile app's tab visibility) so the Care tab appears immediately.
    const { data: profile } = await supabaseAdmin
        .from("cura_profiles")
        .select("role")
        .eq("id", caregiverId)
        .maybeSingle();

    if (String(profile?.role ?? "").toLowerCase() !== "caregiver") {
        const { error: roleError } = await supabaseAdmin
            .from("cura_profiles")
            .update({ role: "caregiver", updated_at: new Date().toISOString() })
            .eq("id", caregiverId);
        if (roleError) {
            console.error("Failed to promote profile role to caregiver:", roleError);
        }

        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(caregiverId, {
                publicMetadata: { role: "caregiver" },
            });
        } catch (err) {
            console.error("Failed to update Clerk publicMetadata role:", err);
        }
    }

    // Fetch patient name for the success message.
    const { data: patient } = await supabaseAdmin
        .from("cura_profiles")
        .select("full_name")
        .eq("id", patientId)
        .maybeSingle();

    return NextResponse.json({
        data: { message: "Linked successfully", patientName: patient?.full_name ?? null },
    });
}
