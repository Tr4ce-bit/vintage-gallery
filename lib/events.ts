/**
 * Client-side analytics event sender.
 *
 * Fires POST /api/events for each interaction. Uses sendBeacon when the page
 * is unloading (e.g. on TIME_SPENT at unmount) so the event isn't lost — and
 * falls back to fetch with keepalive elsewhere so it never blocks navigation.
 *
 * Failures are silent by design. Analytics must never break the user UX.
 */

import { getSessionId } from "./session";

export type EventType =
  | "VIEW"
  | "TIME_SPENT"
  | "WISHLIST_ADD"
  | "WISHLIST_REMOVE"
  | "CART_ADD"
  | "CART_REMOVE";

interface EventInput {
  eventType:    EventType;
  productId?:   string | null;
  durationSec?: number;
  metadata?:    Record<string, unknown>;
}

const ENDPOINT = "/api/events";

export function trackEvent(input: EventInput, opts: { beacon?: boolean } = {}): void {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  const payload = JSON.stringify({
    sessionId,
    eventType:   input.eventType,
    productId:   input.productId ?? null,
    durationSec: input.durationSec,
    metadata:    input.metadata,
  });

  // On unload paths (TIME_SPENT), sendBeacon is the only reliable option —
  // the browser kills in-flight fetches when the page goes away.
  if (opts.beacon && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const ok   = navigator.sendBeacon(ENDPOINT, blob);
      if (ok) return;
    } catch { /* fall through to fetch */ }
  }

  // keepalive lets the fetch outlive the page if the user navigates.
  try {
    void fetch(ENDPOINT, {
      method:    "POST",
      headers:   { "Content-Type": "application/json" },
      body:      payload,
      keepalive: true,
    }).catch(() => { /* never bubble */ });
  } catch { /* never bubble */ }
}
