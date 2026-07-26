/**
 * Same-day delivery region rules.
 *
 * Same-day delivery is only available in select regions, and the available
 * list changes at 12:30 PM Ghana time:
 *   - Before 12:30 → Greater Accra + Ashanti
 *   - From 12:30  → Greater Accra only
 *
 * Ghana is permanently UTC+0 (no DST), so we check UTC directly. This works
 * the same on the server, in CI, and in any customer browser regardless of
 * their local timezone setting.
 *
 * The list resets automatically every day at midnight — there's nothing to
 * cron, the function just returns the right answer for "right now".
 */

export const SAMEDAY_CUTOFF_LABEL = "12:30 PM Ghana time";

const REGION_ACCRA   = "Greater Accra";
const REGION_ASHANTI = "Ashanti";

/** Returns true when current Ghana time is at or after 12:30. */
export function isPastSamedayCutoff(now: Date = new Date()): boolean {
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  return h > 12 || (h === 12 && m >= 30);
}

/** Regions eligible for same-day delivery at the given moment. */
export function samedayRegions(now: Date = new Date()): string[] {
  return isPastSamedayCutoff(now)
    ? [REGION_ACCRA]
    : [REGION_ACCRA, REGION_ASHANTI];
}

/** Server-side guard for /api/paystack: did the user pick a same-day region
 *  that's actually allowed for same-day right now? */
export function isSamedayRegionAllowed(region: string, now: Date = new Date()): boolean {
  return samedayRegions(now).includes(region);
}
