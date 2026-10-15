import { describe, expect, it } from "vitest";
import { CartError, priceCart, type PricedVariant } from "./pricing";

const tee: PricedVariant = {
  variantId: "v1", productId: "p1", productName: "Tupac Tee", size: "M", color: "Black",
  unitPricePesewas: 25000, available: 3, isActive: true,
};
const variants = new Map([[tee.variantId, tee]]);

describe("priceCart", () => {
  it("prices from the database and merges duplicate lines", () => {
    const r = priceCart([{ variantId: "v1", quantity: 1 }, { variantId: "v1", quantity: 2 }], variants);
    expect(r.subtotalPesewas).toBe(75000);
    expect(r.lines).toHaveLength(1);
  });

  it("refuses more than is available", () => {
    expect(() => priceCart([{ variantId: "v1", quantity: 4 }], variants)).toThrow("Only 3 left");
  });

  it("refuses unknown, inactive or empty carts", () => {
    expect(() => priceCart([], variants)).toThrow(CartError);
    expect(() => priceCart([{ variantId: "nope", quantity: 1 }], variants)).toThrow(CartError);
    const off = new Map([["v1", { ...tee, isActive: false }]]);
    expect(() => priceCart([{ variantId: "v1", quantity: 1 }], off)).toThrow(CartError);
  });

  it("refuses fractional or zero quantities", () => {
    expect(() => priceCart([{ variantId: "v1", quantity: 0 }], variants)).toThrow(CartError);
    expect(() => priceCart([{ variantId: "v1", quantity: 1.5 }], variants)).toThrow(CartError);
  });
});
