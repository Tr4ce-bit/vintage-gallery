// Where to send someone after they sign in. Only a path on this same site is
// allowed: "/\evil.example", "/\t/evil.example", "//evil.example" and
// "https://evil.example" all fall back to the home page.

const BASE = "https://same-origin.invalid";

export function safeRedirectPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || !raw.startsWith("/")) return fallback;
  // Browsers strip tabs and newlines and treat "\" like "/", so refuse them outright.
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;
  return url.pathname + url.search + url.hash;
}
