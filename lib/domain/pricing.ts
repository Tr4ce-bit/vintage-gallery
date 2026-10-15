import { assertPesewas, type Pesewas } from "./money";

// The server re-prices every cart from the database. Prices sent by the
// browser are never used.

export const MAX_QUANTITY_PER_LINE = 10;

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface PricedVariant {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  unitPricePesewas: Pesewas;
  available: number; // stock minus active reservations
  isActive: boolean;
}

export interface PricedLine extends PricedVariant {
  quantity: number;
  lineTotalPesewas: Pesewas;
}

export class CartError extends Error {}

export function priceCart(lines: CartLine[], variants: Map<string, PricedVariant>): {
  lines: PricedLine[];
  subtotalPesewas: Pesewas;
} {
  if (lines.length === 0) throw new CartError("Your cart is empty");

  const merged = new Map<string, number>();
  for (const l of lines) {
    if (!Number.isInteger(l.quantity) || l.quantity < 1) throw new CartError("Quantity must be at least 1");
    merged.set(l.variantId, (merged.get(l.variantId) ?? 0) + l.quantity);
  }

  const priced: PricedLine[] = [];
  for (const [variantId, quantity] of merged) {
    const v = variants.get(variantId);
    if (!v || !v.isActive) throw new CartError("An item in your cart is no longer available");
    if (quantity > MAX_QUANTITY_PER_LINE) throw new CartError(`At most ${MAX_QUANTITY_PER_LINE} of one item per order`);
    if (quantity > v.available) {
      throw new CartError(
        v.available === 0
          ? `${v.productName} (${v.size}) is sold out`
          : `Only ${v.available} left of ${v.productName} (${v.size})`,
      );
    }
    const lineTotalPesewas = assertPesewas(v.unitPricePesewas * quantity, "line total");
    priced.push({ ...v, quantity, lineTotalPesewas });
  }

  const subtotalPesewas = assertPesewas(priced.reduce((sum, l) => sum + l.lineTotalPesewas, 0), "subtotal");
  return { lines: priced, subtotalPesewas };
}
