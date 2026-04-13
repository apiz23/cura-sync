import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import {
    STAFF_SESSION_COOKIE,
    verifyStaffSessionToken,
} from "@/lib/staff-session";
import { routing } from "@/i18n/routing";

const isUserRoute = createRouteMatcher(["/user(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
    const pathname = req.nextUrl.pathname;

    if (isUserRoute(req)) {
        auth.protect();
    }

    if (isAdminRoute(req)) {
        const token = req.cookies.get(STAFF_SESSION_COOKIE)?.value;
        if (!token) {
            return NextResponse.redirect(new URL("/auth/admin", req.url));
        }

        const claims = await verifyStaffSessionToken(token);
        if (!claims) {
            return NextResponse.redirect(new URL("/auth/admin", req.url));
        }
    }

    if (shouldHandlePublicI18n(pathname)) {
        return intlMiddleware(req);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

function shouldHandlePublicI18n(pathname: string) {
    return !(
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/trpc") ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/user")
    );
}
