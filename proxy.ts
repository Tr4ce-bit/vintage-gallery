import { NextRequest, NextResponse } from "next/server";

/**
 * Route protection middleware.
 *
 * Currently a safe pass-through — Clerk's server middleware requires
 * CLERK_SECRET_KEY at runtime, which crashes every request when the key
 * is missing. Once you add CLERK_SECRET_KEY to Amplify environment variables
 * and trigger a redeploy, swap this file for the Clerk version below.
 *
 * ── Clerk version (use after adding keys) ────────────────────────────────────
 * import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
 * const isProtected = createRouteMatcher(["/checkout(.*)", "/account(.*)"]);
 * export default clerkMiddleware(async (auth, req) => {
 *   if (isProtected(req)) await auth.protect();
 * });
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
