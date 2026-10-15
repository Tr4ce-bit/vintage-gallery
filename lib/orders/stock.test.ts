import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { freshDatabase, TEST_DATABASE_URL } from "@/test/db";
import { availableStock } from "./stock";

describe.skipIf(!TEST_DATABASE_URL)("availableStock (needs TEST_DATABASE_URL)", () => {
  let db: Awaited<ReturnType<typeof freshDatabase>>;
  beforeAll(async () => {
    db = await freshDatabase("stock");
  });
  afterAll(async () => {
    await db?.drop();
  });

  it("subtracts unexpired holds only", async () => {
    const p = await db.prisma.product.create({
      data: { slug: "hope", name: "Hope Tee", pricePesewas: 20000, variants: { create: [
        { sku: "HOPE-S", size: "S", color: "White", stock: 5 },
        { sku: "HOPE-M", size: "M", color: "White", stock: 2 },
      ] } },
      include: { variants: true },
    });
    const [s, m] = p.variants;
    const order = await db.prisma.order.create({
      data: {
        orderNumber: "VGSTOCK001", reference: "stock1", subtotalPesewas: 1, deliveryPesewas: 0, totalPesewas: 1,
        deliveryType: "STANDARD", deliveryFullName: "A", deliveryPhone: "0", deliveryAddress: "x", deliveryCity: "Accra", deliveryRegion: "Greater Accra",
        reservations: { create: [
          { variantId: s.id, quantity: 2, expiresAt: new Date(Date.now() + 60_000) },
          { variantId: s.id, quantity: 1, expiresAt: new Date(Date.now() - 60_000) }, // expired
          { variantId: m.id, quantity: 5, expiresAt: new Date(Date.now() + 60_000) }, // more than stock
        ] },
      },
    });
    expect(order.id).toBeTruthy();
    const available = await availableStock(db.prisma, [s.id, m.id]);
    expect(available.get(s.id)).toBe(3);
    expect(available.get(m.id)).toBe(0);
  });
});
