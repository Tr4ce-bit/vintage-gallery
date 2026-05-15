import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Register this URL in Paystack Dashboard → Settings → Webhooks:
// https://yourdomain.com/api/paystack/webhook

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret    = process.env.PAYSTACK_SECRET_KEY!;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    console.warn("Paystack webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { reference } = event.data;
    try {
      await prisma.order.update({
        where: { paystackReference: reference },
        data:  { status: "PAID" },
      });
      console.log(`Order ${reference} marked as PAID`);
    } catch (err) {
      console.error(`Webhook: failed to update order ${reference}:`, err);
    }
  }

  if (event.event === "refund.processed") {
    const { transaction_reference } = event.data;
    try {
      await prisma.order.update({
        where: { paystackReference: transaction_reference },
        data:  { status: "REFUNDED" },
      });
    } catch (err) {
      console.error("Webhook: refund update failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
