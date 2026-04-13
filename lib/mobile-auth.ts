import { auth, verifyToken } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function requireMobileOrBrowserUserId(
    req: Request,
): Promise<string | NextResponse> {
    const browserAuth = await auth();
    if (browserAuth.userId) {
        return browserAuth.userId;
    }

    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        const userId = payload.sub;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return userId;
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
