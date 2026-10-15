import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { verifyPaystack, markOrderPaid, adjustStock, holdsStock } from "@/lib/orders";
import { notifyAdminCancellation } from "@/lib/notify";

// Statuses the customer is allowed to cancel from
const CUSTOMER_CANCELLABLE = ["PENDING", "PAID"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { cognitoId: authUser.userId },
    });
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const order = await prisma.order.findFirst({
      where:   { id, userId: profile.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Order fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// Customer-initiated cancel
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.action !== "cancel" && body.action !== "update-address") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { cognitoId: authUser.userId },
    });
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const order = await prisma.order.findFirst({
      where:   { id, userId: profile.id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // ── Address update (15-minute window) ─────────────────────────────────────
    if (body.action === "update-address") {
      const EDIT_WINDOW_MINUTES = 15;
      const minutesSince = (Date.now() - new Date(order.createdAt).getTime()) / 60_000;
      if (minutesSince > EDIT_WINDOW_MINUTES) {
        return NextResponse.json(
          { error: `Delivery address can only be updated within ${EDIT_WINDOW_MINUTES} minutes of placing the order.` },
          { status: 409 }
        );
      }
      if (!["PENDING", "PAID"].includes(order.status)) {
        return NextResponse.json(
          { error: "Your order is already being prepared and cannot be changed." },
          { status: 409 }
        );
      }
      const { fullName, phone, address, city, region, notes } = body.deliveryInfo ?? {};
      if (!fullName || !phone || !address || !city || !region) {
        return NextResponse.json({ error: "All delivery fields are required." }, { status: 400 });
      }
      await prisma.order.update({
        where: { id },
        data: {
          deliveryFullName: String(fullName).slice(0, 120),
          deliveryPhone:    String(phone).slice(0, 20),
          deliveryAddress:  String(address).slice(0, 300),
          deliveryCity:     String(city).slice(0, 100),
          deliveryRegion:   String(region).slice(0, 100),
          deliveryNotes:    notes ? String(notes).slice(0, 500) : null,
        },
      });
      return NextResponse.json({ success: true });
    }

    // A PENDING order may already be paid — the MoMo prompt can complete after
    // the customer gives up waiting. Ask Paystack first, so we never cancel an
    // order whose payment then lands with nothing to attach to.
    let current = order;
    if (current.status === "PENDING") {
      let v;
      try {
        v = await verifyPaystack(current.paystackReference);
      } catch {
        return NextResponse.json(
          { error: "We couldn't check your payment status. Please try again in a moment." },
          { status: 503 },
        );
      }
      if (v.ok) {
        await markOrderPaid(current.paystackReference, v);
        const fresh = await prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (fresh) current = fresh;
      }
    }

    // Block cancellation once admin has confirmed (PROCESSING or later)
    if (!CUSTOMER_CANCELLABLE.includes(current.status)) {
      return NextResponse.json(
        { error: "This order can no longer be cancelled. Please contact us if you need help." },
        { status: 409 }
      );
    }

    const wasPaid = holdsStock(current.status);

    // Cancel + restore stock atomically; the status condition guards against
    // an admin or webhook changing the order at the same moment.
    const cancelled = await prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id, status: current.status },
        data:  { status: "CANCELLED" },
      });
      if (res.count === 0) return false;
      if (wasPaid) {
        await adjustStock(tx, current.items.map(i => ({ ...i, size: String(i.size) })), 1);
      } else {
        await tx.payment.updateMany({
          where: { providerReference: current.paystackReference, status: "PENDING" },
          data:  { status: "CANCELLED" },
        });
      }
      return true;
    });
    if (!cancelled) {
      return NextResponse.json({ error: "Your order changed while cancelling. Please refresh and try again." }, { status: 409 });
    }

    // The customer has paid, so someone has to send the money back.
    if (wasPaid) {
      await notifyAdminCancellation({
        orderNumber:       current.orderNumber,
        paystackReference: current.paystackReference,
        totalAmount:       current.totalAmount,
        customerName:      current.deliveryFullName,
        customerPhone:     current.deliveryPhone,
      }).catch(err => console.error("notifyAdminCancellation failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Order cancel error:", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
