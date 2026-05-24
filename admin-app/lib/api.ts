/**
 * All admin API calls go to the main store's API.
 * Calls use relative paths (/api/...) which Vercel proxies server-side to
 * NEXT_PUBLIC_API_URL via next.config.js rewrites — no CORS issues.
 */
export function apiUrl(path: string): string {
  // Relative path — handled by Next.js rewrite in next.config.js
  return path;
}
