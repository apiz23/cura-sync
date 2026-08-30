import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";
import supabaseAdmin from "@/lib/supabase-admin";
import { requireMobileOrBrowserUserId } from "@/lib/mobile-auth";
import {
    getStaffSessionFromRequest,
    type StaffSessionClaims,
} from "@/lib/staff-session";
import { normalizeStaffRole } from "@/lib/staff-role";

export type PatientSession = {
    kind: "patient";
    profileId: string;
};

export type StaffSession = {
    kind: "staff";
    staffId: string;
    facilityId: string;
    role: string;
    isAdmin: boolean;
    sessionVersion: number;
};

export type AnySession = PatientSession | StaffSession;

const STAFF_SESSION_VERSION_CACHE_TTL_MS = 15_000;

type StaffSessionVersionCacheEntry = {
    sessionVersion: number;
    expiresAt: number;
};

const staffSessionVersionCache = new Map<string, StaffSessionVersionCacheEntry>();

export async function requirePatientSession(
    req?: Request
): Promise<
    PatientSession | NextResponse
> {
    let userId: string;
    if (req) {
        const mobileOrBrowserUserId = await requireMobileOrBrowserUserId(req);
        if (mobileOrBrowserUserId instanceof NextResponse) {
            return mobileOrBrowserUserId;
        }
        userId = mobileOrBrowserUserId;
    } else {
        const browserAuth = await auth();
        if (!browserAuth.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        userId = browserAuth.userId;
    }

    let { data, error } = await supabase
        .from("cura_profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        return NextResponse.json(
            { error: "Profile lookup failed" },
            { status: 500 }
        );
    }

    if (!data) {
        // Profile not found by Clerk ID — check if same email exists (e.g. dev→prod Clerk migration)
        const emailMatch = await findProfileByClerkEmail(userId);
        if (emailMatch) {
            const role = String(emailMatch.role ?? "").toLowerCase();
            if (role !== "patient") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            return { kind: "patient", profileId: emailMatch.id };
        }

        const provisioned = await provisionPatientProfile(userId);
        if (provisioned instanceof NextResponse) return provisioned;
        data = provisioned;
    }

    const role = String(data.role ?? "").toLowerCase();
    if (role !== "patient") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return { kind: "patient", profileId: userId };
}

async function findProfileByClerkEmail(
    userId: string
): Promise<{ id: string; role: string } | null> {
    try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) return null;

        const { data } = await supabaseAdmin
            .from("cura_profiles")
            .select("id, role")
            .eq("email", email)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!data) return null;

        // If the old profile has a different id than the current Clerk userId,
        // migrate all data to the new id so future lookups hit the correct row.
        if (data.id !== userId) {
            await migrateProfileId(data.id, userId);
            return { id: userId, role: data.role };
        }

        return data ?? null;
    } catch {
        return null;
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
        "cura_symptom_analyses",
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

    console.log(`[authz] Migrated profile ${oldId} → ${newId}`);
}

async function provisionPatientProfile(
    userId: string
): Promise<{ role: string } | NextResponse> {
    try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json(
                { error: "Profile incomplete: no email on Clerk account" },
                { status: 400 }
            );
        }

        const fullName = `${clerkUser.firstName ?? ""} ${
            clerkUser.lastName ?? ""
        }`.trim();
        const role =
            String(clerkUser.publicMetadata?.role ?? "patient").toLowerCase() ||
            "patient";

        const { data: upserted, error: upsertError } = await supabaseAdmin
            .from("cura_profiles")
            .upsert(
                {
                    id: userId,
                    email,
                    full_name: fullName,
                    avatar_url: clerkUser.imageUrl,
                    role,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "id" }
            )
            .select("role")
            .single();

        if (upsertError || !upserted) {
            console.error("Auto-provision failed:", upsertError);
            return NextResponse.json(
                { error: "Profile provisioning failed" },
                { status: 500 }
            );
        }

        return { role: String(upserted.role ?? role) };
    } catch (err) {
        console.error("Clerk user lookup failed:", err);
        return NextResponse.json(
            { error: "Profile provisioning failed" },
            { status: 500 }
        );
    }
}

export async function requireStaffSession(
    req: Request
): Promise<StaffSession | NextResponse> {
    const claims = await getStaffSessionFromRequest(req);

    if (!claims) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cachedVersion = getCachedStaffSessionVersion(claims.staffId);
    let expectedVersion = cachedVersion;

    if (expectedVersion === null) {
        const { data, error } = await supabase
            .from("cura_staff_account_settings")
            .select("session_version")
            .eq("staff_id", claims.staffId)
            .maybeSingle();

        if (error) {
            return NextResponse.json(
                { error: "Unable to verify session" },
                { status: 500 }
            );
        }

        const verifiedVersion = data?.session_version ?? 1;
        expectedVersion = verifiedVersion;
        setCachedStaffSessionVersion(claims.staffId, verifiedVersion);
    }

    if (claims.sessionVersion !== expectedVersion) {
        clearCachedStaffSessionVersion(claims.staffId);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return normalizeStaffClaims(claims);
}

export async function requireAdminStaffSession(
    req: Request
): Promise<StaffSession | NextResponse> {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;
    if (!session.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return session;
}

export async function requireAnySession(
    req: Request
): Promise<AnySession | NextResponse> {
    // Prefer Clerk user session if present. This avoids accidentally treating a
    // browser with a leftover staff cookie as "staff" when the user is signed in
    // as a patient.
    const mobileOrBrowserUserId = await requireMobileOrBrowserUserId(req);
    if (!(mobileOrBrowserUserId instanceof NextResponse)) {
        return { kind: "patient", profileId: mobileOrBrowserUserId };
    }

    const staff = await getStaffSessionFromRequest(req);
    if (staff) return normalizeStaffClaims(staff);

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function ensureFacilityAccess(
    staff: StaffSession,
    facilityId: string
): NextResponse | void {
    if (staff.facilityId !== facilityId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
}

function normalizeStaffClaims(claims: StaffSessionClaims): StaffSession {
    const role = normalizeStaffRole(claims.role);
    const isAdmin = role === "admin";
    return {
        kind: "staff",
        staffId: claims.staffId,
        facilityId: claims.facilityId,
        role,
        isAdmin,
        sessionVersion: claims.sessionVersion,
    };
}

function getCachedStaffSessionVersion(staffId: string): number | null {
    const now = Date.now();
    const cached = staffSessionVersionCache.get(staffId);

    if (!cached) return null;
    if (cached.expiresAt <= now) {
        staffSessionVersionCache.delete(staffId);
        return null;
    }

    return cached.sessionVersion;
}

function setCachedStaffSessionVersion(
    staffId: string,
    sessionVersion: number
): void {
    staffSessionVersionCache.set(staffId, {
        sessionVersion,
        expiresAt: Date.now() + STAFF_SESSION_VERSION_CACHE_TTL_MS,
    });
}

function clearCachedStaffSessionVersion(staffId: string): void {
    staffSessionVersionCache.delete(staffId);
}

export type UserSession = {
    kind: "user";
    profileId: string;
    role: string;
};

export type CaregiverSession = {
    kind: "caregiver";
    profileId: string;
};

/** Any authenticated Clerk user — patient, caregiver, or unknown role. */
export async function requireUserSession(
    req?: Request
): Promise<UserSession | NextResponse> {
    let userId: string;
    if (req) {
        const result = await requireMobileOrBrowserUserId(req);
        if (result instanceof NextResponse) return result;
        userId = result;
    } else {
        const browserAuth = await auth();
        if (!browserAuth.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        userId = browserAuth.userId;
    }

    let { data, error } = await supabase
        .from("cura_profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
    }

    if (!data) {
        const emailMatch = await findProfileByClerkEmail(userId);
        if (emailMatch) {
            return {
                kind: "user",
                profileId: emailMatch.id,
                role: String(emailMatch.role ?? "patient").toLowerCase(),
            };
        }

        const provisioned = await provisionPatientProfile(userId);
        if (provisioned instanceof NextResponse) return provisioned;
        data = provisioned;
    }

    const role = String(data.role ?? "patient").toLowerCase();
    return { kind: "user", profileId: userId, role };
}

export async function requireCaregiverSession(
    req?: Request
): Promise<CaregiverSession | NextResponse> {
    let userId: string;
    if (req) {
        const mobileOrBrowserUserId = await requireMobileOrBrowserUserId(req);
        if (mobileOrBrowserUserId instanceof NextResponse) return mobileOrBrowserUserId;
        userId = mobileOrBrowserUserId;
    } else {
        const browserAuth = await auth();
        if (!browserAuth.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        userId = browserAuth.userId;
    }

    let { data, error } = await supabase
        .from("cura_profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
    }

    if (!data) {
        const emailMatch = await findProfileByClerkEmail(userId);
        if (emailMatch) {
            const role = String(emailMatch.role ?? "").toLowerCase();
            if (role !== "caregiver") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            return { kind: "caregiver", profileId: emailMatch.id };
        }
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (String(data.role ?? "").toLowerCase() !== "caregiver") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return { kind: "caregiver", profileId: userId };
}
