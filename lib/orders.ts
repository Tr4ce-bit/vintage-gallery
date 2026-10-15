import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { notifyAdminNewOrder, notifyCustomerStatusUpdate } from "@/lib/notify";

// Shared order lifecycle helpers. The webhook and the success-page verify both
// mark orders paid through markOrderPaid(), so whichever arrives first wins and
// the other is a no-op — stock is never decremented twice.

export interface PaystackVerification {
  ok:        boolean;
  status?:   string;   // Paystack transaction status, e.g. "success"
  amount?:   number;   // pesewas
  currency?: string;
  channel?:  string;
  fees?:     number;   // GHS
  gatewayResponse?: string;
}

/** Calls Paystack's verify endpoint. Throws on network error / timeout. */
export async function verifyPaystack(reference: string, timeoutMs = 5_000): Promise<PaystackVerification> {
  const res = await fetchWithTimeout(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers:   { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      timeoutMs,
    },
  );
  const j = await res.json();
  const d = j.data ?? {};
  return {
    ok:       res.ok && j.status === true && d.status === "success",
    status:   d.status,
    amount:   typeof d.amount === "number" ? d.amount : undefined,
    currency: d.currency,
    channel:  d.channel,
    fees:     typeof d.fees === "number" ? d.fees / 100 : undefined,
    gatewayResponse: d.gateway_response,
  };
}

const STOCK_HOLDING_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

/** True when stock was taken for an order in this status and not yet returned. */
export function holdsStock(status: string): boolean {
  return STOCK_HOLDING_STATUSES.includes(status);
}

type StockItem = { productId: string | null; size: string; quantity: number };

/**
 * Adjusts global stock and per-size stock for every catalogue item, inside the
 * caller's transaction. sign = -1 takes stock, +1 returns it. Custom studio
 * items (productId null) are skipped.
 */
export async function adjustStock(tx: Prisma.TransactionClient, items: StockItem[], sign: 1 | -1) {
  for (const item of items) {
    if (!item.productId) continue;
    const product = await tx.product.findUnique({
      where:  { id: item.productId },
      select: { sizeStock: true },
    });
    if (!product) continue;

    let sizeStock: Record<string, number> | undefined;
    if (product.sizeStock && typeof product.sizeStock === "object") {
      sizeStock = { ...(product.sizeStock as Record<string, number>) };
      const key = String(item.size);
      sizeStock[key] = Math.max(0, (sizeStock[key] ?? 0) + sign * item.quantity);
    }

    await tx.product.update({
      where: { id: item.productId },
      data:  {
        stock: sign < 0 ? { decrement: item.quantity } : { increment: item.quantity },
        ...(sizeStock ? { sizeStock } : {}),
      },
    });
  }
}

const channelToMethod = (c?: string) => {
  switch ((c ?? "").toLowerCase()) {
    case "card":          return "CARD" as const;
    case "mobile_money":  return "MOMO" as const;
    case "bank":
    case "bank_transfer": return "BANK_TRANSFER" as const;
    case "ussd":          return "USSD" as const;
    case "qr":            return "QR" as const;
    default:              return undefined;
  }
};

export type MarkPaidResult = "paid" | "already" | "missing" | "mismatch";

/**
 * Moves a PENDING order to PAID, takes its stock and marks the Payment row
 * SUCCESS, all in one transaction. Only the caller that actually flips the
 * status gets "paid" — and only that caller sends notifications.
 *
 * `v` must be a successful Paystack verification for this reference.
 */
export async function markOrderPaid(reference: string, v: PaystackVerification): Promise<MarkPaidResult> {
  const order = await prisma.order.findUnique({
    where:   { paystackReference: reference },
    include: { items: true, user: { select: { email: true } } },
  });
  if (!order) return "missing";
  if (order.status !== "PENDING") return "already";

  // The amount Paystack actually collected must match what we priced.
  const expected = Math.round(order.totalAmount * 100);
  if (v.amount !== expected || (v.currency && v.currency !== order.currency)) {
    console.error(`markOrderPaid: amount mismatch for ${reference}`, {
      expected, got: v.amount, currency: v.currency,
    });
    return "mismatch";
  }

  const method = channelToMethod(v.channel);

  const flipped = await prisma.$transaction(async (tx) => {
    // Conditional update: if a concurrent caller already flipped it, count is 0.
    const res = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data:  { status: "PAID" },
    });
    if (res.count === 0) return false;

    await tx.payment.upsert({
      where:  { providerReference: reference },
      update: {
        status:  "SUCCESS",
        paidAt:  new Date(),
        fee:     v.fees,
        channel: v.channel,
        ...(method ? { method } : {}),
      },
      create: {
        orderId:           order.id,
        provider:          "PAYSTACK",
        providerReference: reference,
        status:            "SUCCESS",
        paidAt:            new Date(),
        method:            method ?? "OTHER",
        amount:            order.totalAmount,
        currency:          order.currency,
        customerEmail:     order.user?.email ?? order.guestEmail ?? undefined,
        fee:               v.fees,
        channel:           v.channel,
      },
    });

    await adjustStock(tx, order.items.map(i => ({ ...i, size: String(i.size) })), -1);
    return true;
  });

  if (!flipped) return "already";
  console.log(`Order ${reference} marked PAID, stock taken for ${order.items.length} item(s)`);

  const items = order.items.map(i => ({
    productName: i.productName,
    size:        String(i.size),
    quantity:    i.quantity,
    unitPrice:   i.unitPrice,
  }));

  // Awaited, not fire-and-forget: on Lambda the function is frozen as soon as
  // the response is sent, which can drop an in-flight email or SMS.
  const customerEmail = order.user?.email ?? order.guestEmail;
  await Promise.allSettled([
    notifyAdminNewOrder({
      orderNumber:       order.orderNumber,
      paystackReference: reference,
      totalAmount:       order.totalAmount,
      deliveryFullName:  order.deliveryFullName,
      deliveryPhone:     order.deliveryPhone,
      deliveryAddress:   order.deliveryAddress,
      deliveryCity:      order.deliveryCity,
      deliveryRegion:    order.deliveryRegion,
      items,
    }),
    customerEmail
      ? notifyCustomerStatusUpdate({
          orderNumber:       order.orderNumber,
          paystackReference: reference,
          newStatus:         "PAID",
          customerEmail,
          customerName:      order.deliveryFullName,
          isGuest:           !order.userId,
          totalAmount:       order.totalAmount,
          items,
        })
      : Promise.resolve(),
  ]).then(results => {
    for (const r of results) {
      if (r.status === "rejected") console.error("Order paid notification failed:", r.reason);
    }
  });

  return "paid";
}
