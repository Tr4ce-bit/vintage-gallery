/**
 * Shared server-side validation helpers.
 * Import these in API routes — never trust raw client input.
 */

/** RFC 5322-simplified email check */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  return (
    email.length <= 320 &&
    /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email)
  );
}

/**
 * Phone number — allows optional + prefix, digits, spaces, hyphens, parens.
 * Strips formatting then requires 7–15 digits (ITU E.164 range).
 */
export function isValidPhone(phone: unknown): phone is string {
  if (typeof phone !== "string") return false;
  const stripped = phone.replace(/[\s\-\(\)]/g, "");
  return /^\+?[0-9]{7,15}$/.test(stripped);
}

/**
 * URL slug — lowercase alphanumeric words separated by hyphens.
 * e.g. "hope-tee", "black-graphic-1"
 */
export function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  return (
    slug.length >= 2 &&
    slug.length <= 80 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  );
}

/**
 * Image URL — must be HTTPS and from one of our known image hosts.
 * Mirrors the remotePatterns list in next.config.js so Next <Image> can serve it.
 */
export function isAllowedImageUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url.trim()) return false;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    return (
      hostname.endsWith(".amazonaws.com") ||
      hostname === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}

/**
 * Clamp pagination params to safe integers.
 * Default limit 50, hard cap at maxLimit (default 100).
 */
export function clampPagination(
  rawPage: number,
  rawLimit: number,
  maxLimit = 100,
): { page: number; limit: number } {
  const page  = Math.max(1, Number.isFinite(rawPage)  ? Math.floor(rawPage)  : 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 50),
  );
  return { page, limit };
}

/**
 * Sanitise a ?redirect= query param — only allow same-origin relative paths.
 * Blocks open-redirect attacks where an attacker crafts
 *   /sign-in?redirect=https://evil.com
 */
export function safeRedirect(raw: string | null | undefined): string {
  if (!raw) return "/";
  // Must start with "/" but not "//" (protocol-relative = external host)
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}
