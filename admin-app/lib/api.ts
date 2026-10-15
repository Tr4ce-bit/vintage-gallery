/**
 * Admin API base URL.
 *
 * The admin app calls the main store's /api/admin/* routes directly
 * (cross-origin). Every route checks the Cognito token via requireAdmin().
 *
 * NEXT_PUBLIC_API_URL is set by sst.config.ts to the store URL at build time.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  // Always use the absolute URL so browser fetches go directly to the store.
  // Falls back to a relative path (same origin) if API_BASE is unset —
  // useful for local development where both apps share a port.
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}
