import { describe, expect, it } from "vitest";
import { newOrderNumber, newPaymentReference } from "./order-number";

describe("order numbers", () => {
  it("look like VG + 8 unambiguous characters", () => {
    for (let i = 0; i < 200; i++) expect(newOrderNumber()).toMatch(/^VG[A-HJ-NP-Z2-9]{8}$/);
  });
  it("payment references are random hex", () => {
    expect(newPaymentReference()).toMatch(/^vg_[0-9a-f]{24}$/);
  });
});
