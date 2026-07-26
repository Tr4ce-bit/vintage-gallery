import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/subscribers
//   ?page=1&limit=50&search=foo            — paginated JSON list
//   ?format=csv                            — full CSV export
//   ?status=active|unsubscribed|all (default: all)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "json";
  const status = searchParams.get("status") ?? "all";
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();

  const where: Record<string, unknown> = {};
  if (status === "active")        where.unsubscribed = false;
  if (status === "unsubscribed")  where.unsubscribed = true;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name:  { contains: search, mode: "insensitive" } },
    ];
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  if (format === "csv") {
    const rows = await prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const header = "email,name,source,unsubscribed,subscribedAt\n";
    const body   = rows.map(r => [
      escapeCsv(r.email),
      escapeCsv(r.name ?? ""),
      escapeCsv(r.source ?? ""),
      r.unsubscribed ? "true" : "false",
      r.createdAt.toISOString(),
    ].join(",")).join("\n");

    return new NextResponse(header + body, {
      status: 200,
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }

  // ── JSON paginated list ───────────────────────────────────────────────────
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));

  const [items, total, activeCount] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.subscriber.count({ where }),
    prisma.subscriber.count({ where: { unsubscribed: false } }),
  ]);

  return NextResponse.json({
    items, total, activeCount, page, limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

function escapeCsv(s: string): string {
  // Neutralise spreadsheet formula injection before anything else. Excel,
  // Google Sheets and LibreOffice execute a cell that starts with = + - @ (or
  // a leading tab/CR). `name` and `source` here are attacker-controlled via the
  // public /api/subscribe endpoint, so someone could sign up as
  //   =HYPERLINK("https://evil.example","Click me")
  // and have it run on the admin's machine when they open the export.
  // A leading apostrophe forces the cell to be treated as text.
  let out = s;
  if (/^[=+\-@\t\r]/.test(out)) out = `'${out}`;

  // Quote if it contains a comma, quote, or newline; double-up internal quotes.
  if (/[",\n\r]/.test(out)) return `"${out.replace(/"/g, '""')}"`;
  return out;
}
