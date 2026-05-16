/**
 * All admin API calls go to the main store's API,
 * which lives at a separate domain from this admin panel.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function apiUrl(path: string): string {
  return `${BASE}${path}`;
}
