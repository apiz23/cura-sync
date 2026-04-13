import { SignJWT, jwtVerify } from "jose";

export const STAFF_SESSION_COOKIE = "cura_staff_session";

const STAFF_SESSION_ISSUER = "cura-sync";
const STAFF_SESSION_AUDIENCE = "cura-sync-staff";

export type StaffSessionClaims = {
    staffId: string;
    facilityId: string;
    role: string;
    sessionVersion: number;
};

function getStaffSessionSecret(): Uint8Array {
    const secret =
        process.env.CURA_STAFF_JWT_SECRET || process.env.CLERK_SECRET_KEY;

    if (!secret) {
        throw new Error(
            "Missing CURA_STAFF_JWT_SECRET (or CLERK_SECRET_KEY fallback) for staff sessions"
        );
    }

    return new TextEncoder().encode(secret);
}

export async function signStaffSession(
    claims: StaffSessionClaims,
    opts?: { expiresIn?: string }
): Promise<string> {
    const expiresIn = opts?.expiresIn ?? "7d";

    return await new SignJWT({
        staffId: claims.staffId,
        facilityId: claims.facilityId,
        role: claims.role,
        sessionVersion: claims.sessionVersion,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer(STAFF_SESSION_ISSUER)
        .setAudience(STAFF_SESSION_AUDIENCE)
        .setExpirationTime(expiresIn)
        .sign(getStaffSessionSecret());
}

export async function verifyStaffSessionToken(
    token: string
): Promise<StaffSessionClaims | null> {
    try {
        const { payload } = await jwtVerify(token, getStaffSessionSecret(), {
            issuer: STAFF_SESSION_ISSUER,
            audience: STAFF_SESSION_AUDIENCE,
        });

        const staffId = payload.staffId;
        const facilityId = payload.facilityId;
        const role = payload.role;
        const sessionVersion = payload.sessionVersion;

        if (typeof staffId !== "string") return null;
        if (typeof facilityId !== "string") return null;
        if (typeof role !== "string") return null;
        if (typeof sessionVersion !== "number") {
            return { staffId, facilityId, role, sessionVersion: 1 };
        }

        return { staffId, facilityId, role, sessionVersion };
    } catch {
        return null;
    }
}

function parseCookieHeader(
    cookieHeader: string | null,
    name: string
): string | null {
    if (!cookieHeader) return null;

    const parts = cookieHeader.split(";");
    for (const part of parts) {
        const [rawKey, ...rawVal] = part.trim().split("=");
        if (!rawKey) continue;
        if (rawKey === name) {
            return decodeURIComponent(rawVal.join("="));
        }
    }
    return null;
}

export function getStaffSessionTokenFromRequest(req: Request): string | null {
    return parseCookieHeader(req.headers.get("cookie"), STAFF_SESSION_COOKIE);
}

export async function getStaffSessionFromRequest(
    req: Request
): Promise<StaffSessionClaims | null> {
    const token = getStaffSessionTokenFromRequest(req);
    if (!token) return null;
    return await verifyStaffSessionToken(token);
}
