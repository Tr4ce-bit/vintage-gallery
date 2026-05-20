import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { clampPagination } from "@/lib/validation";

const VALID_ORDER_STATUSES = new Set([
  "PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED",
]);

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { page, limit } = clampPagination(
    Number(req.nextUrl.searchParams.get("page")  ?? 1),
    Number(req.nextUrl.searchParams.get("limit") ?? 50),
    100, // hard cap — prevents "give me all 1M rows" DoS
  );

  const rawStatus = req.nextUrl.searchParams.get("status");
  if (rawStatus && !VALID_ORDER_STATUSES.has(rawStatus)) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  try {
    const where = rawStatus ? { status: rawStatus as never } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (err) {
    console.error("Admin orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
