/**
 * Next.js middleware — adds CORS headers to all /api/admin/* routes
 * so the admin app (on Vercel) can call the main store API directly
 * from the browser without a server-side proxy.
 */
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://vintage-gallery-admin.vercel.app",
  "https://vintage-gallery-admin-git-master-iryakubu10-7132s-projects.vercel.app",
  // Allow localhost for local development
  "http://localhost:3001",
  "http://localhost:3000",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Methods":  "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":  "Authorization,Content-Type,X-Requested-With",
  "Access-Control-Max-Age":        "86400",
};

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin);

  // Preflight OPTIONS request — respond immediately
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowed ? origin : "",
        ...CORS_HEADERS,
      },
    });
  }

  // For actual requests, continue to the route handler then add CORS headers
  const res = NextResponse.next();
  if (allowed) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  }
  return res;
}

export const config = {
  // Only run on admin API routes — no overhead on public pages
  matcher: "/api/admin/:path*",
};
