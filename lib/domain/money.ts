// All money is integer pesewas (1 GHS = 100 pesewas). Floats never hold money.

export type Pesewas = number;

export function assertPesewas(value: number, label = "amount"): Pesewas {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative whole number of pesewas, got ${value}`);
  }
  return value;
}

/** Parses an admin-entered cedi amount like "120", "120.5" or "120.50". */
export function parseCedis(input: string): Pesewas {
  const m = /^\s*(\d{1,7})(?:\.(\d{1,2}))?\s*$/.exec(input);
  if (!m) throw new RangeError(`Not a cedi amount: "${input}"`);
  const cedis = Number(m[1]);
  const pesewas = Number((m[2] ?? "").padEnd(2, "0"));
  return cedis * 100 + pesewas;
}

/** "GH₵ 1,234.50" */
export function formatGhs(amount: Pesewas): string {
  assertPesewas(amount);
  const cedis = Math.floor(amount / 100);
  const rest = String(amount % 100).padStart(2, "0");
  return `GH₵ ${cedis.toLocaleString("en-GH")}.${rest}`;
}
