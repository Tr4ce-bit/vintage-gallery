/**
 * Generates a cryptographically random, unguessable order ID.
 * Format: "VG" + 6 random chars = e.g. "VG4KX9M2"
 *
 * Uses crypto.randomBytes (CSPRNG) — not Math.random().
 * Charset excludes visually confusable characters (0/O, 1/I/L)
 * giving 32^6 ≈ 1.07 billion possible values.
 */
import { randomBytes } from "crypto";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderId(): string {
  let id = "VG";
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    id += CHARS[bytes[i] % CHARS.length];
  }
  return id;
}
