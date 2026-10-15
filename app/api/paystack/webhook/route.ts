import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { verifyPaystack, markOrderPaid, adjustStock } from "@/lib/orders";

// Register this URL in Paystack Dashboard → Settings → Webhooks:
// https://yourdomain.com/api/paystack/webhook
//
// Response codes matter: Paystack retries any non-2xx delivery. So we answer
// 200 only when the event is fully handled (or can never be handled), and 5xx
// on transient failures — a verify timeout or a DB error — so a paid order
// never gets stuck in PENDING because one delivery hit a bad moment.

export async function POST(req: NextRequest) {
  // Reject payloads that are unrealistically large before reading the body.
  // A real Paystack event is at most a few KB; 64 KB is a generous ceiling.
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 65_536) {
    console.warn("Webhook: oversized payload rejected", { contentLength });
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const body      = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret    = process.env.PAYSTACK_SECRET_KEY!;

  if (!secret) {
    console.error("Webhook: PAYSTACK_SECRET_KEY not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // 1. Verify HMAC-SHA512 signature (constant-time) — reject anything not from Paystack
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.warn("Paystack webhook: invalid signature — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // ── charge.success ──────────────────────────────────────────────────────────
  if (event.event === "charge.success") {
    const { reference } = event.data;

    try {
      // 2. Confirm with Paystack before trusting the webhook body.
      const v = await verifyPaystack(reference);
      if (!v.ok) {
        console.warn(`Webhook: Paystack verification failed for ${reference}`, v);
        return NextResponse.json({ received: true });
      }

      const result = await markOrderPaid(reference, v);
      if (result === "missing") console.warn(`Webhook: no order found for reference ${reference}`);
      if (result === "already") console.log(`Webhook: order ${reference} already processed, skipping`);
      if (result === "mismatch") console.error(`Webhook: order ${reference} left PENDING — amount mismatch, needs manual review`);
    } catch (err) {
      console.error(`Webhook: failed to process ${reference}; asking Paystack to retry:`, err);
      return NextResponse.json({ error: "Temporary failure" }, { status: 503 });
    }
  }

  // ── refund.processed ────────────────────────────────────────────────────────
  if (event.event === "refund.processed") {
    const { transaction_reference } = event.data;

    const existing = await prisma.order.findUnique({
      where:   { paystackReference: transaction_reference },
      include: { items: true },
    });

    if (!existing || existing.status === "REFUNDED") {
      return NextResponse.json({ received: true });
    }

    // Only return stock if it is still held (not already returned by a cancel).
    const returnStock = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(existing.status);

    try {
      await prisma.$transaction(async (tx) => {
        const res = await tx.order.updateMany({
          where: { id: existing.id, status: existing.status },
          data:  { status: "REFUNDED" },
        });
        if (res.count === 0) return; // changed under us — another delivery handled it
        await tx.payment.updateMany({
          where: { providerReference: transaction_reference },
          data:  { status: "REFUNDED" },
        });
        if (returnStock) {
          await adjustStock(tx, existing.items.map(i => ({ ...i, size: String(i.size) })), 1);
        }
      });

      console.log(`Webhook: order ${transaction_reference} marked REFUNDED`);
    } catch (err) {
      console.error(`Webhook: refund update failed for ${transaction_reference}:`, err);
      return NextResponse.json({ error: "Temporary failure" }, { status: 503 });
    }
  }

  return NextResponse.json({ received: true });
}
