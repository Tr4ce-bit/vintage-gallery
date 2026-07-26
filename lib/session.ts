/**
 * Anonymous client-side session ID for analytics events.
 *
 * Stored in localStorage so it persists across page navigations and browser
 * restarts. Not linked to any user identity — purely a "this is the same
 * browser" handle for grouping events. No PII.
 *
 * Returns "" during SSR (window undefined). Callers should noop on empty id.
 */

const KEY = "vg-session-id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing && existing.length >= 16) return existing;

    // crypto.randomUUID is available in all modern browsers; fall back to a
    // basic random string if not (e.g. iOS Safari before 15.4).
    const fresh =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

    window.localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // localStorage disabled (private mode, etc.) — return a per-tab fallback
    return "";
  }
}
