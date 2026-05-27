import { getAuthUser } from "./auth-server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Preferred: add users to the "admin" Cognito group instead of the email list.
// This prevents a new user registering with an admin email from gaining access.
//
// To add a user to the group via AWS CLI:
//   aws cognito-idp admin-add-user-to-group \
//     --user-pool-id <POOL_ID> --username <email> --group-name admin
//
// The email fallback remains for backward compatibility but should be phased out.
export async function requireAdmin(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth) return null;

  // Primary: Cognito group membership (registering with an admin email won't help)
  if (auth.groups.includes("admin")) return auth;

  // Fallback: explicit email allowlist
  if (auth.email && ADMIN_EMAILS.includes(auth.email.toLowerCase())) return auth;

  return null;
}
