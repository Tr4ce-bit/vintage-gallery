// Sign-in tokens live only in httpOnly cookies set by the server, never in
// browser storage. Cookies carry no Domain attribute, so the shop's cookie is
// never sent to the admin host and the other way round. In production the
// __Host- prefix makes the browser enforce Secure, Path=/ and no Domain.

const secure = process.env.NODE_ENV === "production";
const prefix = secure ? "__Host-" : "";

export const SHOP_SESSION_COOKIE = `${prefix}vg_session`;
export const ADMIN_SESSION_COOKIE = `${prefix}vg_admin`;

export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
