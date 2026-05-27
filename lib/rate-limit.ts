// In-memory sliding-window rate limiter.
//
// Per-Lambda-instance — each instance has its own counter, so the effective
// limit across N concurrent instances is N × limit. For a small store this is
// acceptable. A Redis-backed limiter (e.g., Upstash) would give exact limits
// across all instances but requires a paid service.
//
// Memory: each entry is ~8 bytes × window-hits. At 50 unique IPs/minute with
// a limit of 20 hits, peak usage is ~8 KB — completely negligible.

const store = new Map<string, number[]>();

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
  const now  = Date.now();
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

// Extract the client IP from the request.
// CloudFront / ALB set x-forwarded-for; the first entry is the real client IP.
export function clientIp(req: Request): string {
  const xff = (req.headers as Headers).get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() ?? "unknown";
}
