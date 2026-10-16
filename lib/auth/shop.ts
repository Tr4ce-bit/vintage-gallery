import "server-only";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { poolConfig, type Tokens } from "./cognito";
import {
  SHOP_REFRESH_COOKIE,
  SHOP_REFRESH_SECONDS,
  SHOP_SESSION_COOKIE,
  SHOP_SESSION_SECONDS,
  sessionCookieOptions,
} from "./cookies";

export interface ShopSession {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

let verifier: ReturnType<typeof makeVerifier> | undefined;
function makeVerifier() {
  const cfg = poolConfig("shop");
  return CognitoJwtVerifier.create({ userPoolId: cfg.userPoolId, clientId: cfg.clientId, tokenUse: "id" });
}

export async function verifyShopIdToken(token: string): Promise<ShopSession | null> {
  try {
    verifier ??= makeVerifier();
    const c = await verifier.verify(token);
    return {
      sub: c.sub,
      email: String(c.email ?? ""),
      emailVerified: String(c.email_verified) === "true",
      name: String(c.name ?? ""),
    };
  } catch {
    return null;
  }
}

export async function getShopSession(): Promise<ShopSession | null> {
  const token = (await cookies()).get(SHOP_SESSION_COOKIE)?.value;
  return token ? verifyShopIdToken(token) : null;
}

/** Call only from Server Actions or route handlers (cookies can't be set while rendering). */
export async function startShopSession(tokens: Tokens): Promise<ShopSession | null> {
  const session = await verifyShopIdToken(tokens.idToken);
  if (!session) return null;
  const jar = await cookies();
  jar.set(SHOP_SESSION_COOKIE, tokens.idToken, sessionCookieOptions(SHOP_SESSION_SECONDS));
  if (tokens.refreshToken) jar.set(SHOP_REFRESH_COOKIE, tokens.refreshToken, sessionCookieOptions(SHOP_REFRESH_SECONDS));
  await linkCustomer(session);
  return session;
}

export async function endShopSession() {
  const jar = await cookies();
  jar.delete(SHOP_SESSION_COOKIE);
  jar.delete(SHOP_REFRESH_COOKIE);
}

/** Creates or updates the Customer row for this Cognito user. */
export async function linkCustomer(s: ShopSession) {
  await db().customer.upsert({
    where: { cognitoSub: s.sub },
    create: { cognitoSub: s.sub, email: s.email.toLowerCase(), emailVerified: s.emailVerified, fullName: s.name },
    update: { email: s.email.toLowerCase(), emailVerified: s.emailVerified, ...(s.name ? { fullName: s.name } : {}) },
  });
}
