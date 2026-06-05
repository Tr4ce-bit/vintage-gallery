/**
 * fetchWithTimeout — fetch() with a hard upper-bound on how long it can hang.
 *
 * Without this, every external HTTP call (Paystack, Weather, fal.ai, etc.) can
 * block the Lambda for its full 29-second timeout. That eats GB-seconds, gives
 * customers spinning UIs, and prevents graceful fallback code from ever running.
 *
 * Usage:
 *   const res = await fetchWithTimeout(url, { timeoutMs: 5000 });
 *
 * On timeout, throws a FetchTimeoutError. Callers should catch this and either
 * return a fallback, surface a "service slow" message, or retry — never let it
 * propagate as an opaque 500.
 */

export class FetchTimeoutError extends Error {
  readonly timeoutMs: number;
  readonly target:    string;
  constructor(timeoutMs: number, target: string) {
    super(`Request to ${target} exceeded ${timeoutMs}ms timeout`);
    this.name      = "FetchTimeoutError";
    this.timeoutMs = timeoutMs;
    this.target    = target;
  }
}

export interface FetchTimeoutInit extends RequestInit {
  /** Max ms before the request is aborted. Defaults to 8000. */
  timeoutMs?: number;
}

export async function fetchWithTimeout(
  url: string | URL,
  init: FetchTimeoutInit = {},
): Promise<Response> {
  const { timeoutMs = 8000, signal: callerSignal, ...rest } = init;

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new FetchTimeoutError(timeoutMs, String(url)));
  }, timeoutMs);

  // If the caller passed their own AbortSignal, forward its abort to ours so
  // we still clean up timers if they cancel.
  if (callerSignal) {
    if (callerSignal.aborted) {
      clearTimeout(timer);
      controller.abort(callerSignal.reason);
    } else {
      callerSignal.addEventListener(
        "abort",
        () => controller.abort(callerSignal.reason),
        { once: true },
      );
    }
  }

  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
