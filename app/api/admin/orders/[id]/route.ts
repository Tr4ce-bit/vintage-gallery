import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { notifyCustomerStatusUpdate } from "@/lib/notify";
import { adjustStock, holdsStock } from "@/lib/orders";

const VALID_STATUSES = ["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({
      where:   { id },
      include: { user: true, items: { include: { product: true } } },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    console.error("Admin order fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body   = await req.json();
  const { status } = body;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const existing = await prisma.order.findUnique({
      where:   { id },
      include: { items: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Stock is held while an order is PAID → DELIVERED. Moving into that range
    // (e.g. a manual "mark as paid") takes stock; moving out (cancel/refund)
    // returns it, including per-size stock.
    const before = holdsStock(existing.status);
    const after  = holdsStock(status);
    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id, status: existing.status },
        data:  { status },
      });
      if (res.count === 0) return false;
      if (before !== after) {
        await adjustStock(tx, existing.items.map(i => ({ ...i, size: String(i.size) })), after ? -1 : 1);
      }
      return true;
    });
    if (!updated) {
      return NextResponse.json({ error: "Order changed while saving — refresh and try again." }, { status: 409 });
    }

    const order = await prisma.order.findUnique({
      where:   { id },
      include: { user: true, items: { include: { product: true } } },
    });

    // Fire-and-forget customer notification — never blocks the response
    if (order) {
      const customerEmail = order.user?.email ?? order.guestEmail;
      const customerName  = order.deliveryFullName;
      if (customerEmail && status !== existing.status) {
        // Awaited: on Lambda an un-awaited send can be frozen mid-flight.
        await notifyCustomerStatusUpdate({
          orderNumber:       order.orderNumber,
          paystackReference: order.paystackReference,
          newStatus:         status,
          customerEmail,
          customerName,
          // No linked profile means this was a guest checkout — they have no
          // account to sign into, so the email links to /track instead.
          isGuest:           !order.user,
          totalAmount:       order.totalAmount,
          items: order.items.map(i => ({
            productName: i.productName,
            size:        String(i.size),
            quantity:    i.quantity,
            unitPrice:   i.unitPrice,
          })),
        }).catch(err => console.error("notifyCustomerStatusUpdate failed:", err));
      }
    }

    // Bust router cache so customer's orders pages show the new status immediately
    revalidatePath("/orders");
    if (order) revalidatePath(`/orders/${order.id}`);
    return NextResponse.json({ order });
  } catch (err) {
    console.error("Admin order update error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
