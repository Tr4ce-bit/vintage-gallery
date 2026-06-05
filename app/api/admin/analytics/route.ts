import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/analytics?days=7|30|90  (default 30)
// Returns aggregations over the last N days of product_events.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const daysRaw = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const days    = [7, 30, 90].includes(daysRaw) ? daysRaw : 30;
  const since   = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Pull products once to attach human-readable names in the response
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, imageUrl: true },
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  // High-level totals
  const [
    totalEvents,
    totalSessions,
    totalViews,
    totalWishlistAdds,
    totalCartAdds,
    timeStats,
  ] = await Promise.all([
    prisma.productEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.productEvent.findMany({
      where:  { createdAt: { gte: since } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    }).then(rs => rs.length),
    prisma.productEvent.count({ where: { eventType: "VIEW",         createdAt: { gte: since } } }),
    prisma.productEvent.count({ where: { eventType: "WISHLIST_ADD", createdAt: { gte: since } } }),
    prisma.productEvent.count({ where: { eventType: "CART_ADD",     createdAt: { gte: since } } }),
    prisma.productEvent.aggregate({
      where:  { eventType: "TIME_SPENT", createdAt: { gte: since } },
      _avg:   { durationSec: true },
      _count: { durationSec: true },
    }),
  ]);

  // Per-product groups for the four interaction types
  const grouped = await prisma.productEvent.groupBy({
    by:     ["productId", "eventType"],
    where:  {
      createdAt: { gte: since },
      productId: { not: null },
      eventType: { in: ["VIEW", "WISHLIST_ADD", "WISHLIST_REMOVE", "CART_ADD", "CART_REMOVE"] },
    },
    _count: { _all: true },
  });

  // Avg time per product
  const timePerProduct = await prisma.productEvent.groupBy({
    by:     ["productId"],
    where:  { eventType: "TIME_SPENT", createdAt: { gte: since }, productId: { not: null } },
    _avg:   { durationSec: true },
    _count: { _all: true },
  });

  // Pivot grouped data into per-product rows
  type Row = {
    productId:    string;
    productName:  string;
    slug:         string;
    imageUrl:     string;
    views:        number;
    wishlistAdds: number;
    wishlistRemoves: number;
    cartAdds:     number;
    cartRemoves:  number;
    avgTimeSec:   number;
    timeSamples:  number;
  };
  const byProduct: Record<string, Row> = {};
  function rowFor(pid: string): Row {
    if (byProduct[pid]) return byProduct[pid];
    const p = productMap.get(pid);
    byProduct[pid] = {
      productId:       pid,
      productName:     p?.name     ?? "Unknown product",
      slug:            p?.slug     ?? "",
      imageUrl:        p?.imageUrl ?? "",
      views:           0,
      wishlistAdds:    0,
      wishlistRemoves: 0,
      cartAdds:        0,
      cartRemoves:     0,
      avgTimeSec:      0,
      timeSamples:     0,
    };
    return byProduct[pid];
  }
  for (const g of grouped) {
    if (!g.productId) continue;
    const r = rowFor(g.productId);
    const n = g._count._all;
    switch (g.eventType) {
      case "VIEW":             r.views = n; break;
      case "WISHLIST_ADD":     r.wishlistAdds = n; break;
      case "WISHLIST_REMOVE":  r.wishlistRemoves = n; break;
      case "CART_ADD":         r.cartAdds = n; break;
      case "CART_REMOVE":      r.cartRemoves = n; break;
    }
  }
  for (const t of timePerProduct) {
    if (!t.productId) continue;
    const r = rowFor(t.productId);
    r.avgTimeSec  = Math.round(t._avg.durationSec ?? 0);
    r.timeSamples = t._count._all;
  }

  const rows = Object.values(byProduct);

  return NextResponse.json({
    days,
    totals: {
      events:        totalEvents,
      uniqueSessions: totalSessions,
      views:         totalViews,
      wishlistAdds:  totalWishlistAdds,
      cartAdds:      totalCartAdds,
      avgTimeSec:    Math.round(timeStats._avg.durationSec ?? 0),
      timeSamples:   timeStats._count.durationSec,
    },
    topByViews:    [...rows].sort((a, b) => b.views        - a.views).slice(0, 10),
    topByTime:     [...rows].filter(r => r.timeSamples > 0)
                            .sort((a, b) => b.avgTimeSec - a.avgTimeSec).slice(0, 10),
    topByWishlist: [...rows].sort((a, b) => b.wishlistAdds - a.wishlistAdds).slice(0, 10),
    topByCart:     [...rows].sort((a, b) => b.cartAdds     - a.cartAdds).slice(0, 10),
  });
}
