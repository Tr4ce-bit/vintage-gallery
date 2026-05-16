import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page  = Number(req.nextUrl.searchParams.get("page")  ?? 1);
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const status = req.nextUrl.searchParams.get("status") ?? undefined;

  try {
    const where = status ? { status: status as never } : {};
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
