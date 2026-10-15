import { describe, expect, it } from "vitest";
import { assertTransition, canTransition, nextStatuses } from "./order-status";

describe("order status", () => {
  it("only Paystack or the system can mark an order paid", () => {
    expect(canTransition("PENDING_PAYMENT", "PAID", "paystack")).toBe(true);
    expect(canTransition("PENDING_PAYMENT", "PAID", "admin")).toBe(false);
    expect(canTransition("PENDING_PAYMENT", "PAID", "customer")).toBe(false);
  });

  it("customers can cancel only before payment, and only request it after", () => {
    expect(canTransition("PENDING_PAYMENT", "CANCELLED", "customer")).toBe(true);
    expect(canTransition("PAID", "CANCELLED", "customer")).toBe(false);
    expect(canTransition("PAID", "CANCEL_REQUESTED", "customer")).toBe(true);
  });

  it("refunds go through REFUND_PENDING and finish only on Paystack's word", () => {
    expect(canTransition("PAID", "REFUNDED", "admin")).toBe(false);
    expect(canTransition("REFUND_PENDING", "REFUNDED", "admin")).toBe(false);
    expect(canTransition("REFUND_PENDING", "REFUNDED", "paystack")).toBe(true);
  });

  it("final states go nowhere", () => {
    expect(nextStatuses("REFUNDED", "admin")).toEqual([]);
    expect(nextStatuses("CANCELLED", "admin")).toEqual([]);
    expect(() => assertTransition("CANCELLED", "PAID", "paystack")).toThrow();
  });
});
