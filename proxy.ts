// ⚠️  THIS FILE IS NOT ACTIVE — Next.js only loads middleware from `middleware.ts`.
// This file was incorrectly named and was never executed. It has been superseded
// by middleware.ts at the project root, which fixes the CORS logic and uses the
// correct filename. This file can be safely deleted.
//
// DO NOT rename this back to middleware.ts — that would create a duplicate.

import { NextRequest, NextResponse } from "next/server";

const ADMIN_ORIGIN = process.env.ADMIN_APP_URL ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Max-Age":       "86400",
};

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const origin  = req.headers.get("origin") ?? "";
    const allowed = !origin || !ADMIN_ORIGIN || origin === ADMIN_ORIGIN;

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status:  allowed ? 204 : 403,
        headers: allowed
          ? { "Access-Control-Allow-Origin": ADMIN_ORIGIN || "*", ...CORS_HEADERS }
          : {},
      });
    }

    // Attach CORS headers to the actual response
    const res = NextResponse.next();
    if (allowed && ADMIN_ORIGIN) {
      res.headers.set("Access-Control-Allow-Origin",  ADMIN_ORIGIN);
      res.headers.set("Access-Control-Allow-Methods", CORS_HEADERS["Access-Control-Allow-Methods"]);
      res.headers.set("Access-Control-Allow-Headers", CORS_HEADERS["Access-Control-Allow-Headers"]);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
