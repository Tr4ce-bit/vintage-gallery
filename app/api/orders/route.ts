import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { clampPagination } from "@/lib/validation";

// ── POST /api/orders  ─────────────────────────────────────────────────────────
// REMOVED: order creation now happens exclusively inside POST /api/paystack,
// which recalculates prices server-side from DB. Accepting client-supplied
// totalAmount / unitPrice / paystackReference here was a critical backdoor.
export async function POST() {
  return NextResponse.json(
    { error: "Use POST /api/paystack to initialise a payment and create an order." },
    { status: 405 },
  );
}

// ── GET /api/orders  — get current user's orders (paginated) ─────────────────
export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { page, limit } = clampPagination(
    Number(req.nextUrl.searchParams.get("page")  ?? 1),
    Number(req.nextUrl.searchParams.get("limit") ?? 20),
    50, // customers never need more than 50 orders per page
  );

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { cognitoId: authUser.userId },
    });
    if (!profile) return NextResponse.json({ orders: [], total: 0, page, limit });

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where:   { userId: profile.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.order.count({ where: { userId: profile.id } }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (err) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
