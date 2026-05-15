import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// ── POST /api/orders  — create a pending order ────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const {
    paystackReference,
    paystackAccessCode,
    totalAmount,
    deliveryFullName,
    deliveryPhone,
    deliveryAddress,
    deliveryNotes,
    momoNetwork,
    momoNumberMasked,
    items,
  } = body;

  try {
    // Ensure user profile exists
    let profile = await prisma.userProfile.findUnique({ where: { clerkId: userId } });
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          clerkId:  userId,
          fullName: deliveryFullName,
          email:    body.email ?? "",
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        userId:             profile.id,
        paystackReference,
        paystackAccessCode,
        totalAmount,
        deliveryFullName,
        deliveryPhone,
        deliveryAddress,
        deliveryNotes,
        momoNetwork,
        momoNumberMasked,
        status: "PENDING",
        items: {
          create: items.map((item: {
            productId: string;
            size: string;
            color: string;
            quantity: number;
            unitPrice: number;
          }) => ({
            productId: item.productId,
            size:      item.size,
            color:     item.color,
            quantity:  item.quantity,
            unitPrice: item.unitPrice,
            subtotal:  item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// ── GET /api/orders  — get current user's orders ─────────────────────────────
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const profile = await prisma.userProfile.findUnique({ where: { clerkId: userId } });
    if (!profile) return NextResponse.json({ orders: [] });

    const orders = await prisma.order.findMany({
      where:   { userId: profile.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
