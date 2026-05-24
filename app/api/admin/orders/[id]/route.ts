import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { notifyCustomerStatusUpdate } from "@/lib/notify";

const VALID_STATUSES = ["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];

// Stock was decremented when order reached PAID; restore it on cancel/refund
const STOCK_DECREMENTED_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

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

    const wasPaid    = STOCK_DECREMENTED_STATUSES.includes(existing.status);
    const isCancelling = status === "CANCELLED" || status === "REFUNDED";
    const needsStockRestore = isCancelling && wasPaid && existing.status !== "CANCELLED" && existing.status !== "REFUNDED";

    // Run status update + optional stock restore in one transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data:  { status },
      }),
      ...(needsStockRestore
        ? existing.items
            .filter((item): item is typeof item & { productId: string } => item.productId !== null)
            .map(item =>
              prisma.product.update({
                where: { id: item.productId },
                data:  { stock: { increment: item.quantity } },
              })
            )
        : []),
    ]);

    const order = await prisma.order.findUnique({
      where:   { id },
      include: { user: true, items: { include: { product: true } } },
    });

    // Fire-and-forget customer notification — never blocks the response
    if (order) {
      const customerEmail = order.user?.email ?? order.guestEmail;
      const customerName  = order.deliveryFullName;
      if (customerEmail) {
        notifyCustomerStatusUpdate({
          orderNumber:       order.orderNumber,
          paystackReference: order.paystackReference,
          newStatus:         status,
          customerEmail,
          customerName,
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
