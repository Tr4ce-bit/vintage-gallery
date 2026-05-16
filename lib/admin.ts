import { getAuthUser } from "./auth-server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Verify the request is from a signed-in admin.
 * Returns the auth user or null if unauthorized.
 */
export async function requireAdmin(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth?.email) return null;
  if (!ADMIN_EMAILS.includes(auth.email.toLowerCase())) return null;
  return auth;
}
