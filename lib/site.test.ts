import { describe, expect, it } from "vitest";
import { isAdminPath, siteForHost } from "./site";

describe("site routing", () => {
  it("tells the admin host from the shop host", () => {
    expect(siteForHost("admin.vintagegallery.store")).toBe("admin");
    expect(siteForHost("admin.staging.vintagegallery.store")).toBe("admin");
    expect(siteForHost("admin.localhost:3000")).toBe("admin");
    expect(siteForHost("vintagegallery.store")).toBe("shop");
    expect(siteForHost("staging.vintagegallery.store")).toBe("shop");
    expect(siteForHost(null)).toBe("shop");
  });

  it("finds admin paths, and only admin paths", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/orders")).toBe(true);
    expect(isAdminPath("/api/admin/orders")).toBe(true);
    expect(isAdminPath("/administrator-tips")).toBe(false);
    expect(isAdminPath("/shop/admin")).toBe(false);
  });
});
