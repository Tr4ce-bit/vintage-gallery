import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Paystack sends POST to this endpoint on payment events.
// Add this URL in your Paystack dashboard → Settings → Webhooks

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret    = process.env.PAYSTACK_SECRET_KEY!;

  // Verify the webhook signature
  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { reference, metadata } = event.data;
    // TODO: update order status in DB to PAID
    // await prisma.order.update({ where: { paystackReference: reference }, data: { status: "PAID" } });
    console.log("Payment confirmed:", reference, metadata);
  }

  return NextResponse.json({ received: true });
}
