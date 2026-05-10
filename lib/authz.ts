import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";
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

    // Optional: ensure this Clerk user is actually a patient profile.
    const { data, error } = await supabase
        .from("cura_profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (error || !data) {
        return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
        );
    }

    const role = String(data.role ?? "").toLowerCase();
    if (role !== "patient") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return { kind: "patient", profileId: userId };
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
