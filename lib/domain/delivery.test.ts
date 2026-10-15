import { describe, expect, it } from "vitest";
import { DeliveryNotAvailableError, deliveryFee, sameDayRegions } from "./delivery";

const morning = new Date("2026-10-15T10:00:00Z");
const afternoon = new Date("2026-10-15T12:30:00Z");

describe("delivery", () => {
  it("charges the flat standard fee anywhere", () => {
    expect(deliveryFee("STANDARD", "Volta", { now: afternoon, isRaining: true })).toBe(3000);
  });

  it("adds the rain surcharge to same-day only when raining", () => {
    expect(deliveryFee("SAME_DAY", "Greater Accra", { now: morning, isRaining: false })).toBe(5000);
    expect(deliveryFee("SAME_DAY", "Greater Accra", { now: morning, isRaining: true })).toBe(7000);
  });

  it("drops Ashanti from same-day at 12:30 Ghana time", () => {
    expect(sameDayRegions(morning)).toEqual(["Greater Accra", "Ashanti"]);
    expect(sameDayRegions(afternoon)).toEqual(["Greater Accra"]);
    expect(() => deliveryFee("SAME_DAY", "Ashanti", { now: afternoon, isRaining: false })).toThrow(
      DeliveryNotAvailableError,
    );
  });
});
