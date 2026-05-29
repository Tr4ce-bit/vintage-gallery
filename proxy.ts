import { NextRequest, NextResponse } from "next/server";

// Next.js 16 proxy (formerly "middleware"). Runs on every matched request.
//
// ADMIN_APP_URL must be set in production. If unset, cross-origin requests
// to /api/admin/* are rejected (fail-closed). Same-origin and server-to-server
// requests pass through; requireAdmin() JWT check is the authority there.
const ADMIN_ORIGIN = process.env.ADMIN_APP_URL ?? "";

const CORS_ALLOW_METHODS = "GET,POST,PATCH,DELETE,OPTIONS";
const CORS_ALLOW_HEADERS = "Authorization,Content-Type";
const CORS_MAX_AGE = "86400";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const origin = req.headers.get("origin");

    // No Origin header = same-origin browser request or server-to-server call.
    // Let the route handler's requireAdmin() JWT check be the authority.
    if (!origin) return NextResponse.next();

    // ADMIN_APP_URL not configured — block all cross-origin requests.
    // Prevents a misconfigured deploy from silently opening the admin API.
    if (!ADMIN_ORIGIN) {
      return new NextResponse(null, { status: 403 });
    }

    // Origin mismatch — reject unknown cross-origin callers.
    if (origin !== ADMIN_ORIGIN) {
      return new NextResponse(null, { status: 403 });
    }

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin":  ADMIN_ORIGIN,
          "Access-Control-Allow-Methods": CORS_ALLOW_METHODS,
          "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
          "Access-Control-Max-Age":       CORS_MAX_AGE,
          "Vary":                         "Origin",
        },
      });
    }

    // Actual cross-origin request — attach CORS headers to the response.
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin",  ADMIN_ORIGIN);
    res.headers.set("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
    res.headers.set("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
    res.headers.set("Vary", "Origin");
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
