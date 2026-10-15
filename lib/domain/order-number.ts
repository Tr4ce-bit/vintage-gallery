import { randomBytes } from "node:crypto";

// "VG" + 8 characters from 32 letters and digits without 0/O and 1/I:
// 32^8 ≈ 1.1 trillion values from the CSPRNG. 256 is a multiple of 32, so
// `byte % 32` has no modulo bias.
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newOrderNumber(): string {
  let out = "VG";
  for (const b of randomBytes(8)) out += CHARS[b % CHARS.length];
  return out;
}

/** Our Paystack reference, created with the order before payment starts. */
export function newPaymentReference(): string {
  return `vg_${randomBytes(12).toString("hex")}`;
}
