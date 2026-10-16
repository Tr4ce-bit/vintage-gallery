import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/cookies";
import { refreshShopSession } from "@/lib/auth/refresh";
import { isAdminPath, requestHost, siteForHost } from "@/lib/site";

// Host routing between the shop and the admin panel. This is routing, not
// security: every admin page and API also verifies the admin session on the
// server (lib/auth/admin.ts).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = requestHost(request.headers);
  const site = siteForHost(host);
  // Build redirects on the viewer's host, not the origin's.
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, `${request.nextUrl.protocol}//${host ?? request.nextUrl.host}`));

  if (site === "shop") {
    // The shop host never serves anything admin.
    if (isAdminPath(pathname)) return notFound();
    return refreshShopSession(request);
  }

  // Admin host: only the admin API and the admin pages.
  if (pathname.startsWith("/api/")) {
    return pathname.startsWith("/api/admin/") ? NextResponse.next() : notFound();
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Canonical admin URLs have no /admin prefix.
    return redirectTo((pathname.slice("/admin".length) || "/") + request.nextUrl.search);
  }

  const signedIn = request.cookies.has(ADMIN_SESSION_COOKIE);
  if (!signedIn && pathname !== "/sign-in") return redirectTo("/sign-in");

  const url = request.nextUrl.clone();
  url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

export const config = {
  // Skip static files and the image optimiser.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)"],
};
