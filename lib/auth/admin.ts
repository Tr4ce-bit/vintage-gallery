import "server-only";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { cookies } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { poolConfig, type Tokens } from "./cognito";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_SECONDS, sessionCookieOptions } from "./cookies";

// Admins sign in to their own Cognito user pool: no self sign-up, MFA
// required, and membership of the "admin" group is still checked. Email
// addresses are never used as a permission.

export interface AdminSession {
  sub: string;
  email: string;
}

let verifier: ReturnType<typeof makeVerifier> | undefined;
function makeVerifier() {
  const cfg = poolConfig("admin");
  return CognitoJwtVerifier.create({ userPoolId: cfg.userPoolId, clientId: cfg.clientId, tokenUse: "id", groups: "admin" });
}

async function verify(token: string): Promise<AdminSession | null> {
  try {
    verifier ??= makeVerifier();
    const claims = await verifier.verify(token);
    return { sub: claims.sub, email: String(claims.email ?? "") };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verify(token) : null;
}

export class NotAdminError extends Error {}

/** Use at the top of every admin page, layout, Server Action and API handler. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new NotAdminError("Admin sign-in required");
  return session;
}

/** Returns null when the tokens aren't an admin's (for example, not in the admin group). */
export async function startAdminSession(tokens: Tokens): Promise<AdminSession | null> {
  const session = await verify(tokens.idToken);
  if (!session) return null;
  (await cookies()).set(ADMIN_SESSION_COOKIE, tokens.idToken, sessionCookieOptions(ADMIN_SESSION_SECONDS));
  await audit(session, "admin.sign-in", `admin:${session.sub}`);
  return session;
}

export async function endAdminSession() {
  const session = await getAdminSession();
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  if (session) await audit(session, "admin.sign-out", `admin:${session.sub}`);
}

export async function audit(admin: AdminSession, action: string, target: string, details?: Record<string, unknown>) {
  await db().adminAudit.create({
    data: { adminSub: admin.sub, adminEmail: admin.email, action, target, details: details as Prisma.InputJsonValue | undefined },
  });
}
