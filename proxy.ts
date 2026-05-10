import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
    STAFF_SESSION_COOKIE,
    verifyStaffSessionToken,
} from "@/lib/staff-session";

const isUserRoute = createRouteMatcher(["/user(.*)"]);
const isSsoCallback = createRouteMatcher(["/user/sso-callback(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isUserRoute(req) && !isSsoCallback(req)) {
        const { userId, redirectToSignIn } = await auth();
        if (!userId) {
            return redirectToSignIn({ returnBackUrl: "/user/dashboard" });
        }
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

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
