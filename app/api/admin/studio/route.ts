import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const KEYS = ["studio_base_price", "studio_design_addon"] as const;
const DEFAULTS: Record<string, string> = {
  studio_base_price:   "150",
  studio_design_addon: "30",
};

// GET /api/admin/studio — get current studio prices
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.settings.findMany({ where: { key: { in: [...KEYS] } } });
  const map: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) map[row.key] = row.value;

  return NextResponse.json({
    basePriceGHS:   Number(map.studio_base_price),
    designAddonGHS: Number(map.studio_design_addon),
  });
}

// PATCH /api/admin/studio — update studio prices
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { basePriceGHS, designAddonGHS } = body;

  if (
    (basePriceGHS   !== undefined && (typeof basePriceGHS   !== "number" || basePriceGHS   < 0)) ||
    (designAddonGHS !== undefined && (typeof designAddonGHS !== "number" || designAddonGHS < 0))
  ) {
    return NextResponse.json({ error: "Prices must be non-negative numbers" }, { status: 400 });
  }

  const updates: Array<Promise<unknown>> = [];
  if (basePriceGHS   !== undefined) updates.push(prisma.settings.upsert({ where: { key: "studio_base_price"   }, create: { key: "studio_base_price",   value: String(basePriceGHS)   }, update: { value: String(basePriceGHS)   } }));
  if (designAddonGHS !== undefined) updates.push(prisma.settings.upsert({ where: { key: "studio_design_addon" }, create: { key: "studio_design_addon", value: String(designAddonGHS) }, update: { value: String(designAddonGHS) } }));

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
