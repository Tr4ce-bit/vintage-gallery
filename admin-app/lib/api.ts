/**
 * Admin API base URL.
 *
 * The admin app (Vercel) calls the main store API (Amplify) directly.
 * Amplify's middleware adds CORS headers for the admin app's origin,
 * so the browser can make cross-origin requests without a proxy.
 *
 * NEXT_PUBLIC_API_URL must be set in Vercel env vars to the main
 * store URL, e.g. https://master.d1bljs8ku3bbh3.amplifyapp.com
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  // Always use the absolute URL so browser fetches go directly to Amplify.
  // Falls back to a relative path (same origin) if API_BASE is unset —
  // useful for local development where both apps share a port.
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}
