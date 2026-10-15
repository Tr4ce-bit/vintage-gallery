import type { PrismaClient } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";
import type { Pesewas } from "@/lib/domain/money";

// The only code that marks an order paid. The webhook worker, the return
// page and the reconciliation job all call it after verifying the payment
// with Paystack, so calling it twice, or three times at once, is safe.

export interface VerifiedPayment {
  reference: string;
  amountPesewas: Pesewas;
  currency: string;
  channel?: string | null;
  feePesewas?: number | null;
  paidAt: Date;
}

export type MarkPaidResult =
  | { outcome: "paid"; orderId: string; oversold: string[] }
  | { outcome: "already-paid"; orderId: string }
  | { outcome: "paid-after-cancel"; orderId: string } // money taken for a cancelled order: refund it
  | { outcome: "amount-mismatch"; orderId: string; expected: Pesewas; got: Pesewas }
  | { outcome: "unknown-reference" };

export async function markPaid(
  prisma: PrismaClient,
  payment: VerifiedPayment,
  actor: "paystack" | "system" = "paystack",
): Promise<MarkPaidResult> {
  return prisma.$transaction(async (tx) => {
    // Row lock: concurrent callers for the same order queue up here.
    const locked = await tx.$queryRaw<{ id: string; status: OrderStatus; totalPesewas: number; currency: string }[]>`
      SELECT "id", "status"::text AS "status", "totalPesewas", "currency"
      FROM "orders" WHERE "reference" = ${payment.reference} FOR UPDATE`;
    const order = locked[0];
    if (!order) return { outcome: "unknown-reference" } as const;

    if (order.totalPesewas !== payment.amountPesewas || order.currency !== payment.currency) {
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: order.status,
          actor,
          note: `Payment amount mismatch: expected ${order.totalPesewas} ${order.currency}, got ${payment.amountPesewas} ${payment.currency}`,
        },
      });
      return { outcome: "amount-mismatch", orderId: order.id, expected: order.totalPesewas, got: payment.amountPesewas } as const;
    }

    await recordPayment(tx, order.id, payment);

    if (order.status === "CANCELLED") {
      await tx.orderEvent.create({
        data: { orderId: order.id, fromStatus: "CANCELLED", toStatus: "CANCELLED", actor, note: "Payment succeeded after the order was cancelled: refund needed" },
      });
      return { outcome: "paid-after-cancel", orderId: order.id } as const;
    }
    if (order.status !== "PENDING_PAYMENT") return { outcome: "already-paid", orderId: order.id } as const;

    await tx.order.update({ where: { id: order.id }, data: { status: "PAID", paidAt: payment.paidAt } });
    await tx.orderEvent.create({ data: { orderId: order.id, fromStatus: "PENDING_PAYMENT", toStatus: "PAID", actor } });

    // Turn the stock hold into a sale. The CHECK (stock >= 0) constraint and
    // the WHERE clause mean stock can never go negative.
    const oversold: string[] = [];
    const holds = await tx.stockReservation.findMany({
      where: { orderId: order.id, status: "HELD" },
      include: { variant: { select: { sku: true } } },
    });
    for (const hold of holds) {
      const updated = await tx.$executeRaw`
        UPDATE "variants" SET "stock" = "stock" - ${hold.quantity}
        WHERE "id" = ${hold.variantId} AND "stock" >= ${hold.quantity}`;
      if (updated === 0) oversold.push(hold.variant.sku);
    }
    await tx.stockReservation.updateMany({ where: { orderId: order.id, status: "HELD" }, data: { status: "CONVERTED" } });
    if (oversold.length > 0) {
      await tx.orderEvent.create({
        data: { orderId: order.id, fromStatus: "PAID", toStatus: "PAID", actor: "system", note: `Oversold: ${oversold.join(", ")}` },
      });
    }
    return { outcome: "paid", orderId: order.id, oversold } as const;
  });
}

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

async function recordPayment(tx: Tx, orderId: string, p: VerifiedPayment) {
  const data = {
    status: "SUCCESS" as const,
    amountPesewas: p.amountPesewas,
    currency: p.currency,
    channel: p.channel ?? null,
    feePesewas: p.feePesewas ?? null,
    rawStatus: "success",
    paidAt: p.paidAt,
  };
  await tx.payment.upsert({
    where: { providerReference: p.reference },
    update: data,
    create: { ...data, orderId, providerReference: p.reference },
  });
}
