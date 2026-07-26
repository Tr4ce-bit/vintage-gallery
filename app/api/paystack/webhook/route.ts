import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { notifyAdminNewOrder } from "@/lib/notify";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/fetch-with-timeout";

// Register this URL in Paystack Dashboard → Settings → Webhooks:
// https://yourdomain.com/api/paystack/webhook

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

  // 1. Verify HMAC-SHA512 signature — reject anything that isn't really from Paystack
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  if (hash !== signature) {
    console.warn("Paystack webhook: invalid signature — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // ── charge.success ──────────────────────────────────────────────────────────
  if (event.event === "charge.success") {
    const { reference } = event.data;

    // 2. Idempotency guard
    const existing = await prisma.order.findUnique({
      where:   { paystackReference: reference },
      include: { items: true },
    });

    if (!existing) {
      console.warn(`Webhook: no order found for reference ${reference}`);
      return NextResponse.json({ received: true }); // 200 so Paystack stops retrying
    }

    if (existing.status !== "PENDING") {
      console.log(`Webhook: order ${reference} already ${existing.status}, skipping`);
      return NextResponse.json({ received: true });
    }

    // 3. Verify with Paystack before trusting the webhook.
    //    5s timeout: webhooks must respond fast; Paystack retries failed deliveries,
    //    so it's safe to bail on a slow verify and let the next retry succeed.
    try {
      const verify = await fetchWithTimeout(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers:   { Authorization: `Bearer ${secret}` },
          timeoutMs: 5_000,
        },
      );
      const vData = await verify.json();
      if (!verify.ok || vData.data?.status !== "success") {
        console.warn(`Webhook: Paystack verification failed for ${reference}`, vData);
        return NextResponse.json({ received: true });
      }
    } catch (err) {
      if (err instanceof FetchTimeoutError) {
        console.warn(`Webhook: Paystack verify timed out for ${reference}; Paystack will retry`);
      } else {
        console.error(`Webhook: error verifying ${reference}:`, err);
      }
      // Ack with 200 to keep current behaviour (Paystack won't retry).
      // The order stays PENDING; a follow-up reconciliation job or manual
      // admin action can resolve it. Changing this to 5xx would make Paystack
      // retry — worth considering separately as a reliability improvement.
      return NextResponse.json({ received: true });
    }

    // 4. Pre-fetch sizeStock for all items so the full update is ONE atomic transaction
    //    Only process items linked to a real product (custom-studio items have null productId)
    const productIds = existing.items.map(i => i.productId).filter((id): id is string => id !== null);
    const products = await prisma.product.findMany({
      where:  { id: { in: productIds } },
      select: { id: true, sizeStock: true },
    });
    const sizeStockMap = Object.fromEntries(products.map(p => [p.id, p.sizeStock]));

    // Pull paystack-side details (channel, fees) for the Payment record.
    // We already verified above; safe to re-read the response we got there.
    // Re-fetching is cheap and keeps this block self-contained.
    let verifyData: { channel?: string; fees?: number; channelText?: string } = {};
    try {
      const v = await fetchWithTimeout(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secret}` }, timeoutMs: 5_000 },
      );
      const j = await v.json();
      verifyData = {
        channel:     j.data?.channel,                   // e.g. "card", "mobile_money"
        fees:        typeof j.data?.fees === "number" ? j.data.fees / 100 : undefined,
        channelText: j.data?.channel,
      };
    } catch { /* non-fatal; Payment row will still be marked SUCCESS */ }

    const channelToMethod = (c?: string) => {
      switch ((c ?? "").toLowerCase()) {
        case "card":         return "CARD";
        case "mobile_money": return "MOMO";
        case "bank":
        case "bank_transfer":return "BANK_TRANSFER";
        case "ussd":         return "USSD";
        case "qr":           return "QR";
        default:             return undefined;
      }
    };
    const paymentMethod = channelToMethod(verifyData.channel);

    try {
      await prisma.$transaction([
        // Mark order paid
        prisma.order.update({
          where: { paystackReference: reference },
          data:  { status: "PAID" },
        }),
        // Mark the matching Payment row SUCCESS (upsert covers any orphan
        // payments that came in via a backfill or external initiation).
        prisma.payment.upsert({
          where:  { providerReference: reference },
          update: {
            status:  "SUCCESS",
            paidAt:  new Date(),
            fee:     verifyData.fees,
            channel: verifyData.channelText,
            ...(paymentMethod ? { method: paymentMethod as "CARD" | "MOMO" | "BANK_TRANSFER" | "USSD" | "QR" } : {}),
          },
          create: {
            orderId:           existing.id,
            provider:          "PAYSTACK",
            providerReference: reference,
            status:            "SUCCESS",
            paidAt:            new Date(),
            method:            (paymentMethod ?? "OTHER") as "CARD" | "MOMO" | "BANK_TRANSFER" | "USSD" | "QR" | "OTHER",
            amount:            existing.totalAmount,
            currency:          "GHS",
            customerEmail:     existing.guestEmail ?? undefined,
            fee:               verifyData.fees,
            channel:           verifyData.channelText,
          },
        }),
        // Decrement global stock + sizeStock only for items with a real productId
        ...existing.items.flatMap(item => {
          if (!item.productId) return []; // skip custom-studio items
          const ops = [
            prisma.product.update({
              where: { id: item.productId },
              data:  { stock: { decrement: item.quantity } },
            }),
          ];
          const raw = sizeStockMap[item.productId];
          if (raw) {
            const ss  = { ...(raw as Record<string, number>) };
            const key = String(item.size);
            ss[key]   = Math.max(0, (ss[key] ?? 0) - item.quantity);
            ops.push(
              prisma.product.update({
                where: { id: item.productId },
                data:  { sizeStock: ss },
              }),
            );
          }
          return ops;
        }),
      ]);

      console.log(`Webhook: order ${reference} marked PAID, stock decremented for ${existing.items.length} item(s)`);

      // Fire-and-forget admin notification (email + SMS) — never blocks the 200 response
      notifyAdminNewOrder({
        orderNumber:       existing.orderNumber,
        paystackReference: reference,
        totalAmount:       existing.totalAmount,
        deliveryFullName:  existing.deliveryFullName,
        deliveryPhone:     existing.deliveryPhone,
        deliveryAddress:   existing.deliveryAddress,
        deliveryCity:      existing.deliveryCity,
        deliveryRegion:    existing.deliveryRegion,
        items: existing.items.map(i => ({
          productName: i.productName,
          size:        String(i.size),
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
        })),
      }).catch(err => console.error("notifyAdminNewOrder failed:", err));

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

    if (!existing || existing.status === "REFUNDED") {
      return NextResponse.json({ received: true });
    }

    const refundProductIds = existing.items.map(i => i.productId).filter((id): id is string => id !== null);
    const products = await prisma.product.findMany({
      where:  { id: { in: refundProductIds } },
      select: { id: true, sizeStock: true },
    });
    const sizeStockMap = Object.fromEntries(products.map(p => [p.id, p.sizeStock]));

    try {
      await prisma.$transaction([
        prisma.order.update({
          where: { paystackReference: transaction_reference },
          data:  { status: "REFUNDED" },
        }),
        // Flip the matching Payment to REFUNDED (no-op if no row exists).
        prisma.payment.updateMany({
          where: { providerReference: transaction_reference },
          data:  { status: "REFUNDED" },
        }),
        ...existing.items.flatMap(item => {
          if (!item.productId) return []; // skip custom-studio items
          const ops = [
            prisma.product.update({
              where: { id: item.productId },
              data:  { stock: { increment: item.quantity } },
            }),
          ];
          const raw = sizeStockMap[item.productId];
          if (raw) {
            const ss  = { ...(raw as Record<string, number>) };
            const key = String(item.size);
            ss[key]   = (ss[key] ?? 0) + item.quantity;
            ops.push(
              prisma.product.update({
                where: { id: item.productId },
                data:  { sizeStock: ss },
              }),
            );
          }
          return ops;
        }),
      ]);

      console.log(`Webhook: order ${transaction_reference} marked REFUNDED, stock restored`);
    } catch (err) {
      console.error(`Webhook: refund update failed for ${transaction_reference}:`, err);
    }
  }

  return NextResponse.json({ received: true });
}
