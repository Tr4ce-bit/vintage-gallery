/**
 * GET  /api/admin/settings/delivery  — fetch delivery price settings
 * PUT  /api/admin/settings/delivery  — update delivery price settings
 *
 * Admin-only. Uses requireAdmin() guard.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma }       from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const KEYS = [
  "delivery_standard",
  "delivery_sameday",
  "delivery_sameday_rain_surcharge",
  "delivery_rain_enabled",
] as const;

type Key = typeof KEYS[number];

function defaults(): Record<Key, string> {
  return {
    delivery_standard:                "30",
    delivery_sameday:                 "50",
    delivery_sameday_rain_surcharge:  "20",
    delivery_rain_enabled:            "true",
  };
}

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await prisma.settings.findMany({ where: { key: { in: [...KEYS] } } });

  const result = { ...defaults() };
  for (const r of rows) result[r.key as Key] = r.value;

  return NextResponse.json(result);
}

// ── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: Partial<Record<Key, string>>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate numeric fields
  for (const k of ["delivery_standard", "delivery_sameday", "delivery_sameday_rain_surcharge"] as const) {
    if (k in body) {
      const n = Number(body[k]);
      if (!Number.isFinite(n) || n < 0 || n > 10_000) {
        return NextResponse.json(
          { error: `${k} must be a number between 0 and 10 000` },
          { status: 400 }
        );
      }
      // Normalise to 2 dp
      body[k] = n.toFixed(2);
    }
  }

  // Validate boolean field
  if ("delivery_rain_enabled" in body) {
    if (body.delivery_rain_enabled !== "true" && body.delivery_rain_enabled !== "false") {
      return NextResponse.json(
        { error: "delivery_rain_enabled must be 'true' or 'false'" },
        { status: 400 }
      );
    }
  }

  // Upsert each provided key
  const updates = Object.entries(body).filter(([k]) => KEYS.includes(k as Key));
  await Promise.all(
    updates.map(([key, value]) =>
      prisma.settings.upsert({
        where:  { key },
        update: { value: value! },
        create: { key, value: value! },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
