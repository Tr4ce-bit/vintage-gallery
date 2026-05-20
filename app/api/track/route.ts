import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public order tracking endpoint — no auth required.
// Requires orderNumber + (email OR phone) to prevent enumeration.
//
// GET /api/track?orderNumber=1&email=foo@bar.com
// GET /api/track?orderNumber=1&phone=0241234567

export async function GET(req: NextRequest) {
  const raw         = req.nextUrl.searchParams.get("orderNumber") ?? "";
  const emailParam  = (req.nextUrl.searchParams.get("email")  ?? "").trim().toLowerCase();
  const phoneParam  = (req.nextUrl.searchParams.get("phone")  ?? "").trim();

  const orderNumber = parseInt(raw, 10);
  if (!orderNumber || orderNumber < 1) {
    return NextResponse.json({ error: "Order number is required." }, { status: 400 });
  }
  if (!emailParam && !phoneParam) {
    return NextResponse.json({ error: "Email or phone number is required." }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user:  { select: { email: true } },
        items: { include: { product: { select: { name: true, imageUrl: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found. Please check your Order ID." }, { status: 404 });
    }

    // Verify identity: email or phone must match the order
    const orderEmail = (order.user?.email ?? order.guestEmail ?? "").toLowerCase();
    const emailMatch = emailParam  && orderEmail === emailParam;
    const phoneMatch = phoneParam  && order.deliveryPhone.replace(/\s/g, "") === phoneParam.replace(/\s/g, "");

    if (!emailMatch && !phoneMatch) {
      return NextResponse.json({ error: "Order not found. Please check your details." }, { status: 404 });
    }

    // Return only what the customer needs — no payment internals
    return NextResponse.json({
      order: {
        orderNumber:      order.orderNumber,
        status:           order.status,
        createdAt:        order.createdAt,
        updatedAt:        order.updatedAt,
        totalAmount:      order.totalAmount,
        deliveryFullName: order.deliveryFullName,
        deliveryPhone:    order.deliveryPhone,
        deliveryAddress:  order.deliveryAddress,
        deliveryCity:     order.deliveryCity,
        deliveryRegion:   order.deliveryRegion,
        deliveryNotes:    order.deliveryNotes,
        items: order.items.map(i => ({
          id:          i.id,
          productName: i.productName ?? i.product?.name ?? "Custom Studio item",
          imageUrl:    i.product?.imageUrl ?? null,
          size:        i.size,
          color:       i.color,
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
          subtotal:    i.subtotal,
        })),
      },
    });
  } catch (err) {
    console.error("Track order error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
