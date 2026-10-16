import { NextResponse, type NextRequest } from "next/server";
import { poolConfig, refreshTokens, type Tokens } from "./cognito";
import {
  SHOP_REFRESH_COOKIE,
  SHOP_SESSION_COOKIE,
  SHOP_SESSION_SECONDS,
  sessionCookieOptions,
  tokenExpiresAt,
} from "./cookies";

// Shoppers stay signed in for 30 days: when the 1-hour id token is missing or
// about to expire and a refresh token is present, the proxy swaps it for a new
// id token before the page renders. The new token is verified like any other
// by lib/auth/shop.ts; this only decides when to ask Cognito.

const EARLY_MS = 60_000;

export function needsRefresh(idToken: string | undefined, hasRefreshToken: boolean, now = Date.now()): boolean {
  return hasRefreshToken && tokenExpiresAt(idToken) - now < EARLY_MS;
}

type Refresh = (refreshToken: string) => Promise<Tokens>;
const cognitoRefresh: Refresh = (t) => refreshTokens(poolConfig("shop"), t);

/** Returns the response to continue with, carrying fresh cookies when they changed. */
export async function refreshShopSession(request: NextRequest, refresh: Refresh = cognitoRefresh): Promise<NextResponse> {
  const refreshToken = request.cookies.get(SHOP_REFRESH_COOKIE)?.value;
  if (!needsRefresh(request.cookies.get(SHOP_SESSION_COOKIE)?.value, Boolean(refreshToken))) return NextResponse.next();

  try {
    const tokens = await refresh(refreshToken!);
    // Set it on the request too, so this same render already sees the new token.
    request.cookies.set(SHOP_SESSION_COOKIE, tokens.idToken);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.set(SHOP_SESSION_COOKIE, tokens.idToken, sessionCookieOptions(SHOP_SESSION_SECONDS));
    return response;
  } catch {
    // Revoked, expired or signed out elsewhere: drop both so we don't retry on every request.
    request.cookies.delete(SHOP_SESSION_COOKIE);
    request.cookies.delete(SHOP_REFRESH_COOKIE);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.delete(SHOP_SESSION_COOKIE);
    response.cookies.delete(SHOP_REFRESH_COOKIE);
    return response;
  }
}
