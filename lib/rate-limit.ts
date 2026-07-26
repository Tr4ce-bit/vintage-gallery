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

// Proxy hops we trust in front of this app. The architecture is
// Browser → CloudFront → Lambda Function URL, and CloudFront is the only hop
// that appends to X-Forwarded-For, so the real client sits 1 entry from the end.
const TRUSTED_PROXY_HOPS = 1;

// Real client IP, read from the END of X-Forwarded-For.
//
// CloudFront APPENDS the viewer's IP to whatever the client already sent, so
// every entry before the last one is attacker-controlled. Reading the FIRST
// entry (the previous behaviour) let a caller send `X-Forwarded-For: <random>`
// and land in a fresh bucket on every request — bypassing every limiter here.
//
// Returns "unknown" when the header is absent (direct or local access). All
// such callers then share a single bucket, which fails closed, not open.
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  const parts = xff.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return "unknown";
  return parts[parts.length - TRUSTED_PROXY_HOPS] ?? parts[parts.length - 1];
}
