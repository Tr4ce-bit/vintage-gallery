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
      where: { paystackReference: reference },
    });

    if (!existing) {
      console.warn(`Webhook: no order found for reference ${reference}`);
      // Return 200 so Paystack stops retrying
      return NextResponse.json({ received: true });
    }

    if (existing.status !== "PENDING") {
      // Already processed — idempotent, no double-update
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

    // 4. Mark as PAID
    try {
      await prisma.order.update({
        where: { paystackReference: reference },
        data:  { status: "PAID" },
      });
      console.log(`Webhook: order ${reference} marked as PAID`);
    } catch (err) {
      console.error(`Webhook: failed to mark order ${reference} as PAID:`, err);
    }
  }

  // ── refund.processed ────────────────────────────────────────────────────────
  if (event.event === "refund.processed") {
    const { transaction_reference } = event.data;

    const existing = await prisma.order.findUnique({
      where: { paystackReference: transaction_reference },
    });

    if (!existing) {
      console.warn(`Webhook: no order for refund reference ${transaction_reference}`);
      return NextResponse.json({ received: true });
    }

    if (existing.status === "REFUNDED") {
      return NextResponse.json({ received: true });
    }

    try {
      await prisma.order.update({
        where: { paystackReference: transaction_reference },
        data:  { status: "REFUNDED" },
      });
      console.log(`Webhook: order ${transaction_reference} marked as REFUNDED`);
    } catch (err) {
      console.error(`Webhook: refund update failed for ${transaction_reference}:`, err);
    }
  }

  return NextResponse.json({ received: true });
}
