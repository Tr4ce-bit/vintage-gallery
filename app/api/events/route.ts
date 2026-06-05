import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const VALID_TYPES = new Set([
  "VIEW", "TIME_SPENT", "WISHLIST_ADD", "WISHLIST_REMOVE", "CART_ADD", "CART_REMOVE",
] as const);

type EventTypeStr = typeof VALID_TYPES extends Set<infer T> ? T : never;

interface InboundEvent {
  sessionId?:   string;
  eventType?:   string;
  productId?:   string | null;
  durationSec?: number;
  metadata?:    Record<string, unknown>;
}

// POST /api/events
//   Body can be a single event object, or an array of events (for batching).
//   Anonymous — no auth required. The sessionId is a client-generated UUID
//   stored in localStorage; we never link it to a user account.
export async function POST(req: NextRequest) {
  // 200 events per IP per minute — generous; a real user fires maybe 1–5/min.
  // Bots hammering this lose a single second to rate limit and that's it.
  const rl = rateLimit(`events:${clientIp(req)}`, 200, 60_000);
  if (!rl.allowed) {
    return new NextResponse(null, { status: 429 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return new NextResponse(null, { status: 413 });
  }

  let raw: InboundEvent | InboundEvent[];
  try {
    raw = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const incoming = Array.isArray(raw) ? raw : [raw];
  if (incoming.length === 0 || incoming.length > 50) {
    return new NextResponse(null, { status: 400 });
  }

  const rows = incoming
    .map(e => normalise(e))
    .filter((e): e is NonNullable<typeof e> => e !== null);

  if (rows.length === 0) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    await prisma.productEvent.createMany({ data: rows });
  } catch (err) {
    // Analytics ingestion must never surface as a user-facing error.
    // Log and return 204 so the client doesn't retry.
    console.warn("events: insert failed", err);
  }

  return new NextResponse(null, { status: 204 });
}

function normalise(e: InboundEvent) {
  const type = (e.eventType ?? "").toString().toUpperCase();
  if (!VALID_TYPES.has(type as EventTypeStr)) return null;

  const sessionId = (e.sessionId ?? "").toString();
  if (sessionId.length < 8 || sessionId.length > 80) return null;

  const productId = e.productId == null
    ? null
    : String(e.productId).slice(0, 80);

  let durationSec: number | null = null;
  if (type === "TIME_SPENT") {
    const n = Number(e.durationSec);
    if (!Number.isFinite(n) || n < 0 || n > 7200) return null; // cap 2h
    durationSec = Math.round(n);
  }

  // Keep metadata small to avoid runaway rows
  const metadata = e.metadata && typeof e.metadata === "object"
    ? truncateJson(e.metadata)
    : null;

  return {
    productId,
    eventType:   type as EventTypeStr,
    sessionId,
    durationSec,
    // Prisma's Json field expects InputJsonValue; we've already round-tripped
    // through JSON.stringify/parse so the value is guaranteed serialisable.
    metadata:    metadata ?? Prisma.JsonNull,
  };
}

function truncateJson(obj: unknown): Prisma.InputJsonValue | null {
  try {
    const s = JSON.stringify(obj);
    if (s.length > 1024) return null;
    return JSON.parse(s) as Prisma.InputJsonValue;
  } catch {
    return null;
  }
}
