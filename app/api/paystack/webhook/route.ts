import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Register this URL in Paystack Dashboard → Settings → Webhooks:
// https://yourdomain.com/api/paystack/webhook

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret    = process.env.PAYSTACK_SECRET_KEY!;

  // 1. Verify HMAC-SHA512 signature
  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    console.warn("Paystack webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // ── charge.success ──────────────────────────────────────────────────────────
  if (event.event === "charge.success") {
    const { reference } = event.data;

    // 2. Check order exists + idempotency guard
    const existing = await prisma.order.findUnique({
      where:   { paystackReference: reference },
      include: { items: true },
    });

    if (!existing) {
      console.warn(`Webhook: no order found for reference ${reference}`);
      return NextResponse.json({ received: true });
    }

    if (existing.status !== "PENDING") {
      console.log(`Webhook: order ${reference} already has status ${existing.status}, skipping`);
      return NextResponse.json({ received: true });
    }

    // 3. Verify with Paystack API before trusting the webhook
    try {
      const verify = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secret}` } },
      );
      const vData = await verify.json();
      if (!verify.ok || vData.data?.status !== "success") {
        console.warn(`Webhook: Paystack verification failed for ${reference}`, vData);
        return NextResponse.json({ received: true });
      }
    } catch (err) {
      console.error(`Webhook: error verifying ${reference} with Paystack:`, err);
      return NextResponse.json({ received: true });
    }

    // 4. Mark as PAID + decrement global stock — in one transaction
    try {
      await prisma.$transaction([
        prisma.order.update({
          where: { paystackReference: reference },
          data:  { status: "PAID" },
        }),
        ...existing.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data:  { stock: { decrement: item.quantity } },
          })
        ),
      ]);

      // 5. Also decrement sizeStock JSON for the specific size on each item
      for (const item of existing.items) {
        try {
          const prod = await prisma.product.findUnique({
            where:  { id: item.productId },
            select: { sizeStock: true },
          });
          if (prod?.sizeStock) {
            const ss = { ...(prod.sizeStock as Record<string, number>) };
            const key = String(item.size);
            ss[key] = Math.max(0, (ss[key] ?? 0) - item.quantity);
            await prisma.product.update({
              where: { id: item.productId },
              data:  { sizeStock: ss },
            });
          }
        } catch (err) {
          console.error(`Webhook: sizeStock update failed for product ${item.productId}:`, err);
        }
      }

      console.log(`Webhook: order ${reference} marked PAID, stock decremented for ${existing.items.length} item(s)`);
    } catch (err) {
      console.error(`Webhook: failed to process order ${reference}:`, err);
    }
  }

  // ── refund.processed ────────────────────────────────────────────────────────
  if (event.event === "refund.processed") {
    const { transaction_reference } = event.data;

    const existing = await prisma.order.findUnique({
      where:   { paystackReference: transaction_reference },
      include: { items: true },
    });

    if (!existing) {
      console.warn(`Webhook: no order for refund reference ${transaction_reference}`);
      return NextResponse.json({ received: true });
    }

    if (existing.status === "REFUNDED") {
      return NextResponse.json({ received: true });
    }

    try {
      await prisma.$transaction([
        prisma.order.update({
          where: { paystackReference: transaction_reference },
          data:  { status: "REFUNDED" },
        }),
        ...existing.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data:  { stock: { increment: item.quantity } },
          })
        ),
      ]);

      // Restore sizeStock JSON for each item's size
      for (const item of existing.items) {
        try {
          const prod = await prisma.product.findUnique({
            where:  { id: item.productId },
            select: { sizeStock: true },
          });
          if (prod?.sizeStock) {
            const ss = { ...(prod.sizeStock as Record<string, number>) };
            const key = String(item.size);
            ss[key] = (ss[key] ?? 0) + item.quantity;
            await prisma.product.update({
              where: { id: item.productId },
              data:  { sizeStock: ss },
            });
          }
        } catch (err) {
          console.error(`Webhook: sizeStock restore failed for product ${item.productId}:`, err);
        }
      }

      console.log(`Webhook: order ${transaction_reference} marked REFUNDED, stock restored`);
    } catch (err) {
      console.error(`Webhook: refund update failed for ${transaction_reference}:`, err);
    }
  }

  return NextResponse.json({ received: true });
}
