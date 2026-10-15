import "server-only";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { cookies } from "next/headers";
import { Resource } from "sst";
import { ADMIN_SESSION_COOKIE } from "./cookies";

// Admins sign in to their own Cognito user pool: no self sign-up, MFA
// required, and membership of the "admin" group is still checked. Email
// addresses are never used as a permission.

export interface AdminSession {
  sub: string;
  email: string;
}

let verifier: ReturnType<typeof makeVerifier> | undefined;
function makeVerifier() {
  return CognitoJwtVerifier.create({
    userPoolId: requiredEnv("ADMIN_USER_POOL_ID"),
    clientId: Resource.AdminWebClient.id,
    tokenUse: "id",
    groups: "admin",
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    verifier ??= makeVerifier();
    const claims = await verifier.verify(token);
    return { sub: claims.sub, email: String(claims.email ?? "") };
  } catch {
    return null;
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export class NotAdminError extends Error {}

/** Use at the top of every admin page, layout and API handler. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new NotAdminError("Admin sign-in required");
  return session;
}
