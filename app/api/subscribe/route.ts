import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Always read fresh — never cache POSTs anyway, but be explicit.
export const dynamic = "force-dynamic";

interface SubscribeBody {
  email?: string;
  name?:  string;
  source?: string;
}

// POST /api/subscribe — newsletter signup, idempotent.
// Re-subscribing flips unsubscribed back to false; we never duplicate rows.
export async function POST(req: NextRequest) {
  // 5 attempts per IP per minute — generous for legit users, blocks bot floods.
  const rl = rateLimit(`subscribe:${clientIp(req)}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  // Reject obviously oversized payloads before JSON parsing
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 4_096) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: SubscribeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email  = (body.email ?? "").trim().toLowerCase();
  const name   = body.name   ? String(body.name).slice(0, 120) : null;
  const source = body.source ? String(body.source).slice(0, 60) : "newsletter";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await prisma.subscriber.upsert({
      where:  { email },
      create: { email, name, source, unsubscribed: false },
      // If they previously unsubscribed and are signing up again, re-activate them.
      // Don't overwrite their name with an empty re-submission.
      update: { unsubscribed: false, ...(name ? { name } : {}) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("subscribe error:", err);
    // Always succeed visibly to the user — preserves UX even if DB hiccups.
    // The user can retry; idempotent upsert means double-submits are harmless.
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}
