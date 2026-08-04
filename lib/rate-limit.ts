// In-memory sliding-window rate limiter.
//
// Per-Lambda-instance — each instance has its own counter, so the effective
// limit across N concurrent instances is N × limit. For a small store this is
// acceptable. A Redis-backed limiter (e.g., Upstash) would give exact limits
// across all instances but requires a paid service.

const store = new Map<string, number[]>();

// Widest window any caller has used. Hits older than this can never affect a
// decision, so the sweeper treats it as the expiry threshold. Tracked
// dynamically so adding a limiter with a longer window stays correct.
let maxWindowMs = 0;

const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

// Drop keys whose most recent hit has aged out. Without this the Map grows for
// the whole life of the Lambda instance — every IP that ever calls in leaves a
// permanent entry behind even after all its hits expire.
function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  const cutoff = now - maxWindowMs;
  for (const [key, hits] of store) {
    if (hits.length === 0 || hits[hits.length - 1] <= cutoff) {
      store.delete(key);
    }
  }
}

interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  retryAfterMs: number; // ms until the oldest hit ages out
}

export function rateLimit(
  key:      string,  // e.g. "checkout:1.2.3.4"
  limit:    number,  // max requests per window
  windowMs: number,  // window size in milliseconds
): RateLimitResult {
  const now = Date.now();
  if (windowMs > maxWindowMs) maxWindowMs = windowMs;
  sweepExpired(now);

  const hits = (store.get(key) ?? []).filter(t => t > now - windowMs);

  if (hits.length >= limit) {
    store.set(key, hits);
    const retryAfterMs = hits[0] + windowMs - now;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  hits.push(now);
  store.set(key, hits);
  return { allowed: true, remaining: limit - hits.length, retryAfterMs: 0 };
}

// Real client IP for rate-limit bucketing.
//
// X-Forwarded-For is NOT usable here. Verified against this deployment: a request
// carrying `X-Forwarded-For: 198.51.100.42` arrives at the Lambda with exactly
// that value and a chain length of 1 — CloudFront forwards the viewer's header
// verbatim rather than appending to it. So every entry, first or last, is
// attacker-controlled, and rotating it per request yields a fresh bucket every
// time. That defeated every limiter in this app.
//
// CloudFront-Viewer-Address is set by CloudFront itself and overwrites anything
// the client sends, so it cannot be forged. Format is `IP:port`, for both IPv4
// ("143.105.1.2:48592") and IPv6 ("2600:1f18::1:50000"), hence splitting on the
// LAST colon to keep IPv6 addresses intact.
//
// Falls back to X-Forwarded-For only for environments with no CloudFront in
// front (local dev). Returns "unknown" when nothing identifies the caller, so
// those requests share one bucket — restrictive, not permissive.
export function clientIp(req: Request): string {
  const viewer = req.headers.get("cloudfront-viewer-address");
  if (viewer) {
    const cut = viewer.lastIndexOf(":");
    const ip = cut > 0 ? viewer.slice(0, cut) : viewer;
    if (ip) return ip;
  }

  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  const parts = xff.split(",").map(s => s.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "unknown";
}
