import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SHOP_REFRESH_COOKIE, SHOP_SESSION_COOKIE } from "./cookies";
import { needsRefresh, refreshShopSession } from "./refresh";

function jwt(expSeconds: number) {
  const part = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${part({ alg: "none" })}.${part({ exp: expSeconds })}.sig`;
}
const now = Date.now();
const fresh = jwt(Math.floor(now / 1000) + 3600);
const stale = jwt(Math.floor(now / 1000) + 10);

function request(cookies: Record<string, string>) {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  return new NextRequest("https://vintagegallery.store/account", { headers: { cookie } });
}
const tokens = { idToken: fresh, accessToken: "a", expiresIn: 3600 };

describe("needsRefresh", () => {
  it("only refreshes when there is a refresh token", () => {
    expect(needsRefresh(undefined, false, now)).toBe(false);
    expect(needsRefresh(undefined, true, now)).toBe(true);
  });
  it("refreshes a token about to expire, not a fresh one", () => {
    expect(needsRefresh(stale, true, now)).toBe(true);
    expect(needsRefresh(fresh, true, now)).toBe(false);
  });
});

describe("refreshShopSession", () => {
  it("leaves a fresh session alone", async () => {
    let called = false;
    const res = await refreshShopSession(request({ [SHOP_SESSION_COOKIE]: fresh, [SHOP_REFRESH_COOKIE]: "r" }), async () => {
      called = true;
      return tokens;
    });
    expect(called).toBe(false);
    expect(res.cookies.getAll()).toEqual([]);
  });

  it("sets a new id token when the old one expired", async () => {
    const res = await refreshShopSession(request({ [SHOP_REFRESH_COOKIE]: "r" }), async (t) => {
      expect(t).toBe("r");
      return tokens;
    });
    const set = res.cookies.get(SHOP_SESSION_COOKIE);
    expect(set?.value).toBe(fresh);
    expect(set?.httpOnly).toBe(true);
  });

  it("clears both cookies when the refresh token is refused", async () => {
    const res = await refreshShopSession(request({ [SHOP_SESSION_COOKIE]: stale, [SHOP_REFRESH_COOKIE]: "r" }), async () => {
      throw Object.assign(new Error("revoked"), { name: "NotAuthorizedException" });
    });
    expect(res.cookies.get(SHOP_SESSION_COOKIE)?.value).toBe("");
    expect(res.cookies.get(SHOP_REFRESH_COOKIE)?.value).toBe("");
  });
});
