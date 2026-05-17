import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Default prices — used if nothing has been set in the DB yet
const DEFAULTS = {
  studio_base_price:   "150",
  studio_design_addon: "30",
};

// GET /api/studio — returns studio prices (public, no auth needed)
export async function GET() {
  try {
    const rows = await prisma.settings.findMany({
      where: { key: { in: Object.keys(DEFAULTS) } },
    });

    const map: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) map[row.key] = row.value;

    return NextResponse.json({
      basePriceGHS:   Number(map.studio_base_price),
      designAddonGHS: Number(map.studio_design_addon),
    });
  } catch {
    // Fallback to defaults if DB is unavailable
    return NextResponse.json({
      basePriceGHS:   Number(DEFAULTS.studio_base_price),
      designAddonGHS: Number(DEFAULTS.studio_design_addon),
    });
  }
}
