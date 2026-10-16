// Sign-in tokens live only in httpOnly cookies set by the server, never in
// browser storage. Cookies carry no Domain attribute, so the shop's cookies are
// never sent to the admin host and the other way round. In production the
// __Host- prefix makes the browser enforce Secure, Path=/ and no Domain.

const secure = process.env.NODE_ENV === "production";
const prefix = secure ? "__Host-" : "";

export const SHOP_SESSION_COOKIE = `${prefix}vg_session`; // Cognito id token, 1 hour
export const SHOP_REFRESH_COOKIE = `${prefix}vg_refresh`; // Cognito refresh token, 30 days
export const ADMIN_SESSION_COOKIE = `${prefix}vg_admin`; // admin id token, 8 hours, no refresh
export const CHALLENGE_COOKIE = `${prefix}vg_challenge`; // sign-in step in progress, 5 minutes

export const SHOP_SESSION_SECONDS = 60 * 60;
export const SHOP_REFRESH_SECONDS = 30 * 24 * 60 * 60;
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
export const CHALLENGE_SECONDS = 5 * 60;

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Reads a JWT's exp without verifying it. Only for deciding when to refresh. */
export function tokenExpiresAt(jwt: string | undefined): number {
  if (!jwt) return 0;
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}
