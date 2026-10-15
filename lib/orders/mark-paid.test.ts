import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { freshDatabase, TEST_DATABASE_URL } from "@/test/db";
import { markPaid } from "./mark-paid";

describe.skipIf(!TEST_DATABASE_URL)("markPaid (needs TEST_DATABASE_URL)", () => {
  let db: Awaited<ReturnType<typeof freshDatabase>>;
  beforeAll(async () => {
    db = await freshDatabase("markpaid");
  });
  afterAll(async () => {
    await db?.drop();
  });

  async function orderWithHold(reference: string, stock: number, qty: number) {
    const product = await db.prisma.product.create({
      data: {
        slug: `tee-${reference}`, name: "Tee", pricePesewas: 25000,
        variants: { create: { sku: `TEE-M-${reference}`, size: "M", color: "Black", stock } },
      },
      include: { variants: true },
    });
    const variant = product.variants[0];
    const order = await db.prisma.order.create({
      data: {
        orderNumber: `VG${reference.toUpperCase().padEnd(8, "X").slice(0, 8)}`, reference,
        subtotalPesewas: 25000 * qty, deliveryPesewas: 3000, totalPesewas: 25000 * qty + 3000,
        deliveryType: "STANDARD", deliveryFullName: "Ama", deliveryPhone: "0240000000",
        deliveryAddress: "1 Oxford St", deliveryCity: "Accra", deliveryRegion: "Greater Accra",
        guestEmail: "ama@example.com",
        items: { create: { productId: product.id, variantId: variant.id, productName: "Tee", size: "M", color: "Black", quantity: qty, unitPricePesewas: 25000, lineTotalPesewas: 25000 * qty } },
        reservations: { create: { variantId: variant.id, quantity: qty, expiresAt: new Date(Date.now() + 20 * 60_000) } },
      },
    });
    return { order, variant };
  }

  const paid = (reference: string, amountPesewas: number) => ({
    reference, amountPesewas, currency: "GHS", channel: "mobile_money", paidAt: new Date(),
  });

  it("marks paid once and takes stock once, even when called three times at once", async () => {
    const { order, variant } = await orderWithHold("race1", 5, 2);
    const results = await Promise.all([1, 2, 3].map(() => markPaid(db.prisma, paid("race1", order.totalPesewas))));

    expect(results.filter((r) => r.outcome === "paid")).toHaveLength(1);
    expect(results.filter((r) => r.outcome === "already-paid")).toHaveLength(2);
    expect((await db.prisma.variant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(3);
    expect((await db.prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("PAID");
    expect(await db.prisma.payment.count({ where: { providerReference: "race1", status: "SUCCESS" } })).toBe(1);
    expect(await db.prisma.orderEvent.count({ where: { orderId: order.id, toStatus: "PAID" } })).toBe(1);
  });

  it("refuses a payment for the wrong amount", async () => {
    const { order } = await orderWithHold("short1", 5, 1);
    const r = await markPaid(db.prisma, paid("short1", order.totalPesewas - 100));
    expect(r.outcome).toBe("amount-mismatch");
    expect((await db.prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("PENDING_PAYMENT");
  });

  it("flags money taken for a cancelled order", async () => {
    const { order } = await orderWithHold("late1", 5, 1);
    await db.prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    expect((await markPaid(db.prisma, paid("late1", order.totalPesewas))).outcome).toBe("paid-after-cancel");
  });

  it("never lets stock go negative", async () => {
    const { order, variant } = await orderWithHold("over1", 1, 1);
    await db.prisma.variant.update({ where: { id: variant.id }, data: { stock: 0 } });
    const r = await markPaid(db.prisma, paid("over1", order.totalPesewas));
    expect(r).toMatchObject({ outcome: "paid", oversold: [variant.sku] });
    expect((await db.prisma.variant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(0);
  });

  it("ignores references it doesn't know", async () => {
    expect((await markPaid(db.prisma, paid("nope", 100))).outcome).toBe("unknown-reference");
  });
});
