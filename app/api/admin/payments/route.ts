import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["PENDING", "SUCCESS", "FAILED", "REFUNDED", "CANCELLED"] as const);
const VALID_PROVIDERS = new Set(["PAYSTACK"] as const);

// GET /api/admin/payments
//   ?days=7|30|90|all   (default 30)
//   ?status=PENDING|SUCCESS|FAILED|REFUNDED|CANCELLED|all
//   ?provider=PAYSTACK|all
//   ?search=...         matches providerReference or customerEmail
//   ?page=1&limit=50
//
// Response: { totals, payments, page, limit, total }
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sp       = req.nextUrl.searchParams;
  const daysRaw  = sp.get("days") ?? "30";
  const status   = sp.get("status") ?? "all";
  const provider = sp.get("provider") ?? "all";
  const search   = (sp.get("search") ?? "").trim();

  const page  = Math.max(1, Math.min(1_000, Number(sp.get("page") ?? "1") || 1));
  const limit = Math.max(1, Math.min(100,   Number(sp.get("limit") ?? "50") || 50));

  // Window filter
  const where: Prisma.PaymentWhereInput = {};
  if (daysRaw !== "all") {
    const days = [7, 30, 90].includes(Number(daysRaw)) ? Number(daysRaw) : 30;
    where.createdAt = { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }

  // Status filter
  if (status !== "all" && VALID_STATUSES.has(status as never)) {
    where.status = status as "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";
  }

  // Provider filter
  if (provider !== "all" && VALID_PROVIDERS.has(provider as never)) {
    where.provider = provider as "PAYSTACK";
  }

  // Search filter
  if (search.length > 0 && search.length < 200) {
    where.OR = [
      { providerReference: { contains: search, mode: "insensitive" } },
      { customerEmail:     { contains: search, mode: "insensitive" } },
      { order: { orderNumber: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Aggregate KPIs over the same filter window (status-agnostic — we want
  // 'all events in this window' totals regardless of which status filter
  // is active in the table below).
  const kpiWhere = { ...where };
  delete kpiWhere.status;

  const [
    total,
    payments,
    successRevenueAgg,
    successCount,
    pendingCount,
    failedCount,
    refundedAgg,
  ] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        order: { select: { orderNumber: true, deliveryFullName: true } },
      },
    }),
    prisma.payment.aggregate({
      where: { ...kpiWhere, status: "SUCCESS" },
      _sum:  { amount: true, fee: true },
    }),
    prisma.payment.count({ where: { ...kpiWhere, status: "SUCCESS"   } }),
    prisma.payment.count({ where: { ...kpiWhere, status: "PENDING"   } }),
    prisma.payment.count({ where: { ...kpiWhere, status: "FAILED"    } }),
    prisma.payment.aggregate({
      where: { ...kpiWhere, status: "REFUNDED" },
      _sum:  { amount: true },
    }),
  ]);

  return NextResponse.json({
    totals: {
      successRevenue: successRevenueAgg._sum.amount ?? 0,
      successFees:    successRevenueAgg._sum.fee    ?? 0,
      refundedAmount: refundedAgg._sum.amount       ?? 0,
      counts: {
        success:  successCount,
        pending:  pendingCount,
        failed:   failedCount,
      },
    },
    payments: payments.map(p => ({
      id:                p.id,
      provider:          p.provider,
      providerReference: p.providerReference,
      status:            p.status,
      method:            p.method,
      amount:            p.amount,
      currency:          p.currency,
      fee:               p.fee,
      channel:           p.channel,
      customerEmail:     p.customerEmail,
      orderNumber:       p.order?.orderNumber       ?? null,
      customerName:      p.order?.deliveryFullName  ?? null,
      createdAt:         p.createdAt,
      paidAt:            p.paidAt,
    })),
    page,
    limit,
    total,
  });
}
