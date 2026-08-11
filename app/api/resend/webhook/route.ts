import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/resend/webhook
//
// Receives delivery events from Resend so bounces and complaints are visible
// rather than silent. Register this URL in Resend → Webhooks and subscribe to
// email.bounced, email.complained, email.delivered and email.delivery_delayed.
//
// Resend signs payloads with the Svix scheme: the signature is an HMAC-SHA256
// over "<id>.<timestamp>.<body>", base64-encoded, and the header can carry
// several space-separated values (each prefixed "v1,") during key rotation.

const SIGNING_SECRET = process.env.RESEND_WEBHOOK_SECRET;

// Reject anything older than this to blunt replay attempts.
const MAX_SKEW_SECONDS = 5 * 60;

function verify(req: NextRequest, raw: string): boolean {
  if (!SIGNING_SECRET) return false;

  const id        = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_SKEW_SECONDS) return false;

  // Secrets are issued as "whsec_<base64>"; the bytes after the prefix are the key.
  const key = Buffer.from(SIGNING_SECRET.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${id}.${timestamp}.${raw}`)
    .digest("base64");

  // Compare against every offered version, in constant time.
  return signature.split(" ").some(part => {
    const value = part.startsWith("v1,") ? part.slice(3) : part;
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  if (!SIGNING_SECRET) {
    console.error("Resend webhook: RESEND_WEBHOOK_SECRET not set — rejecting");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (!verify(req, raw)) {
    console.warn("Resend webhook: invalid signature — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type ?? "unknown";
  const to   = Array.isArray(event.data?.to) ? (event.data!.to as string[]) : [];
  const subject = (event.data?.subject as string | undefined) ?? "";

  switch (type) {
    case "email.bounced":
    case "email.complained": {
      // A bounce means the address is bad; a complaint means they marked us as
      // spam. Continuing to mail either one damages sending reputation, so the
      // address is unsubscribed where we hold it.
      console.warn(`Resend ${type}: ${to.join(", ")} — "${subject}"`);
      for (const address of to) {
        try {
          await prisma.subscriber.updateMany({
            where: { email: address.toLowerCase() },
            data:  { unsubscribed: true },
          });
        } catch (err) {
          console.error("Resend webhook: suppression write failed", err);
        }
      }
      break;
    }
    case "email.delivery_delayed":
      console.warn(`Resend delivery delayed: ${to.join(", ")} — "${subject}"`);
      break;
    default:
      // delivered / sent / opened — useful in logs, no action needed.
      console.log(`Resend ${type}: ${to.join(", ")}`);
  }

  // Always acknowledge. A non-2xx makes Resend retry, and none of the work
  // above benefits from retrying.
  return NextResponse.json({ received: true });
}
