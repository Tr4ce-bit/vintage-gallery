import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";

describe("safeRedirectPath", () => {
  it("keeps paths on this site", () => {
    expect(safeRedirectPath("/orders")).toBe("/orders");
    expect(safeRedirectPath("/orders/VG1234?tab=items#top")).toBe("/orders/VG1234?tab=items#top");
  });

  it("refuses anything that could leave the site", () => {
    // The first two passed the old shop's check (finding F6 in the security assessment).
    for (const bad of ["/\\evil.example", "/\t/evil.example", "//evil.example", "https://evil.example", "evil.example", "/%5Cevil.example/../\\x", "/\n/evil.example"]) {
      const out = safeRedirectPath(bad);
      expect(new URL(out, "https://vintagegallery.store").host, bad).toBe("vintagegallery.store");
    }
    expect(safeRedirectPath("//evil.example")).toBe("/");
  });

  it("falls back when empty", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath("", "/account")).toBe("/account");
  });
});
