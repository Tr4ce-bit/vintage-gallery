import type { PrismaClient } from "@/generated/prisma/client";

// Units a shopper can still buy: stock minus unexpired holds by other orders.
export async function availableStock(prisma: PrismaClient, variantIds: string[], now = new Date()) {
  const rows = await prisma.$queryRaw<{ id: string; available: number }[]>`
    SELECT v."id", (v."stock" - COALESCE(SUM(r."quantity") FILTER (
      WHERE r."status" = 'HELD' AND r."expiresAt" > ${now}), 0))::int AS "available"
    FROM "variants" v
    LEFT JOIN "stock_reservations" r ON r."variantId" = v."id"
    WHERE v."id" = ANY(${variantIds})
    GROUP BY v."id"`;
  return new Map(rows.map((r) => [r.id, Math.max(0, r.available)]));
}

export const RESERVATION_MINUTES = 20;
