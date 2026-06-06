/**
 * One-shot, idempotent backfill that creates Payment rows for every existing
 * Order with a paystackReference. After the first deploy that includes the
 * Payment model, your historical orders show up in the admin Payments page
 * alongside any new transactions.
 *
 * Safe to run repeatedly — upserts by providerReference (the unique key).
 * If the Payment already exists, only loose status drift is corrected; we
 * never overwrite richer fields the live webhook has filled in.
 *
 * Run locally:  npm run backfill:payments
 * In CI:        added as a step in .github/workflows/deploy.yml
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function statusFromOrder(s: string): "PENDING" | "SUCCESS" | "REFUNDED" | "CANCELLED" {
  switch (s) {
    case "PENDING":   return "PENDING";
    case "CANCELLED": return "CANCELLED";
    case "REFUNDED":  return "REFUNDED";
    // Anything past PAID implies payment succeeded.
    case "PAID":
    case "PROCESSING":
    case "SHIPPED":
    case "DELIVERED": return "SUCCESS";
    default:          return "PENDING";
  }
}

function methodFromOrder(momoNetwork: string | null): "CARD" | "MOMO" | "BANK_TRANSFER" | "OTHER" {
  return momoNetwork ? "MOMO" : "OTHER";
}

async function main() {
  console.log("[backfill] starting payment backfill from orders…");

  const orders = await prisma.order.findMany({
    where:  { paystackReference: { not: "" } },
    select: {
      id:                true,
      paystackReference: true,
      totalAmount:       true,
      status:            true,
      momoNetwork:       true,
      guestEmail:        true,
      createdAt:         true,
      updatedAt:         true,
      user:              { select: { email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const o of orders) {
    const status = statusFromOrder(o.status);
    const email  = o.user?.email ?? o.guestEmail ?? null;

    const existing = await prisma.payment.findUnique({
      where: { providerReference: o.paystackReference },
    });

    if (!existing) {
      await prisma.payment.create({
        data: {
          orderId:           o.id,
          provider:          "PAYSTACK",
          providerReference: o.paystackReference,
          status,
          method:            methodFromOrder(o.momoNetwork),
          amount:            o.totalAmount,
          currency:          "GHS",
          customerEmail:     email ?? undefined,
          createdAt:         o.createdAt,
          paidAt:            status === "SUCCESS" ? o.updatedAt : null,
        },
      });
      created++;
    } else if (existing.status === "PENDING" && status !== "PENDING") {
      // Only correct status drift; never overwrite richer fields.
      await prisma.payment.update({
        where: { id: existing.id },
        data:  {
          status,
          paidAt: status === "SUCCESS" ? existing.paidAt ?? o.updatedAt : existing.paidAt,
        },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`[backfill] done. created=${created} updated=${updated} skipped=${skipped} (of ${orders.length} orders)`);
  await prisma.$disconnect();
}

main().catch(async err => {
  console.error("[backfill] failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
