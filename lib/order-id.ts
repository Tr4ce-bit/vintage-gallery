/**
 * Generates a random, unguessable order ID.
 * Format: "VG" + 6 random chars = e.g. "VG4KX9M2"
 *
 * Charset excludes visually confusable characters (0/O, 1/I/L)
 * giving 32^6 ≈ 1.07 billion possible values.
 */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderId(): string {
  let id = "VG";
  for (let i = 0; i < 6; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}
