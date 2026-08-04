import { NextRequest, NextResponse } from "next/server";

// TEMPORARY DIAGNOSTIC — delete after use.
//
// Reports which client-identifying headers actually reach the Lambda, so the
// rate limiter can key off one the caller cannot forge. Values are masked to
// their first two octets so nothing identifying is returned.
export const dynamic = "force-dynamic";

function mask(v: string | null): string | null {
  if (!v) return null;
  return v.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, "$1.$2.x.x");
}

export async function GET(req: NextRequest) {
  const interesting: Record<string, string | null> = {};
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k.startsWith("cloudfront-") || k === "x-forwarded-for" || k === "x-real-ip" || k === "true-client-ip") {
      interesting[k] = mask(value);
    }
  });

  const xff = req.headers.get("x-forwarded-for");
  const parts = (xff ?? "").split(",").map(s => s.trim()).filter(Boolean);

  return NextResponse.json({
    headersPresent: interesting,
    xffEntryCount: parts.length,
    xffFirstEqualsLast: parts.length > 0 ? parts[0] === parts[parts.length - 1] : null,
  });
}
