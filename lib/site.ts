// The one app serves two sites, told apart by host name:
//   vintagegallery.store            → shop
//   admin.vintagegallery.store      → admin panel
//   (staging: admin.staging.…; local: admin.localhost:3000)
// Behind CloudFront the viewer's host arrives as x-forwarded-host (added by
// SST's CloudFront function). The Lambdas are only reachable through
// CloudFront, so that header can't be set by a caller.

export type Site = "shop" | "admin";

export function siteForHost(host: string | null | undefined): Site {
  const name = (host ?? "").toLowerCase().split(":")[0];
  return name.startsWith("admin.") ? "admin" : "shop";
}

export function requestHost(headers: Headers): string | null {
  return headers.get("x-forwarded-host") ?? headers.get("host");
}

/** Paths under app/admin and app/api/admin belong to the admin site only. */
export function isAdminPath(pathname: string): boolean {
  return /^\/(api\/)?admin(\/|$)/.test(pathname);
}
