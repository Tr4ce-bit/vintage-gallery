import { describe, expect, it } from "vitest";
import { assertPesewas, formatGhs, parseCedis } from "./money";

describe("money", () => {
  it("parses cedi amounts into whole pesewas", () => {
    expect(parseCedis("120")).toBe(12000);
    expect(parseCedis("120.5")).toBe(12050);
    expect(parseCedis("0.07")).toBe(7);
    expect(parseCedis(" 19.99 ")).toBe(1999);
  });

  it("rejects anything that isn't a plain cedi amount", () => {
    for (const bad of ["", "-1", "1.234", "1e3", "abc", "1,000"]) expect(() => parseCedis(bad)).toThrow();
  });

  it("formats pesewas as cedis", () => {
    expect(formatGhs(123450)).toBe("GH₵ 1,234.50");
    expect(formatGhs(5)).toBe("GH₵ 0.05");
  });

  it("refuses fractions and negatives", () => {
    expect(() => assertPesewas(10.5)).toThrow();
    expect(() => assertPesewas(-1)).toThrow();
  });
});
