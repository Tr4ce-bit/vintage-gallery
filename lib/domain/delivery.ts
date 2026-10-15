import type { Pesewas } from "./money";

// Delivery pricing, ported from the original shop's rules:
// standard GH₵30; same-day GH₵50 plus GH₵20 when it is raining in Accra.
// Same-day regions: Greater Accra and Ashanti before 12:30 Ghana time, then
// Greater Accra only. Ghana is UTC+0 all year, so UTC hours are Ghana hours.

export type DeliveryType = "STANDARD" | "SAME_DAY";

export interface DeliverySettings {
  standardPesewas: Pesewas;
  sameDayPesewas: Pesewas;
  rainSurchargePesewas: Pesewas;
}

export const DEFAULT_DELIVERY: DeliverySettings = {
  standardPesewas: 30_00,
  sameDayPesewas: 50_00,
  rainSurchargePesewas: 20_00,
};

export const GHANA_REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra",
  "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta",
  "Western", "Western North",
] as const;

export const SAME_DAY_CUTOFF_LABEL = "12:30 PM Ghana time";

export function isPastSameDayCutoff(now: Date): boolean {
  const h = now.getUTCHours();
  return h > 12 || (h === 12 && now.getUTCMinutes() >= 30);
}

export function sameDayRegions(now: Date): string[] {
  return isPastSameDayCutoff(now) ? ["Greater Accra"] : ["Greater Accra", "Ashanti"];
}

export function deliveryFee(
  type: DeliveryType,
  region: string,
  opts: { now: Date; isRaining: boolean; settings?: DeliverySettings },
): Pesewas {
  const s = opts.settings ?? DEFAULT_DELIVERY;
  if (type === "STANDARD") return s.standardPesewas;
  if (!sameDayRegions(opts.now).includes(region)) {
    throw new DeliveryNotAvailableError(region, opts.now);
  }
  return s.sameDayPesewas + (opts.isRaining ? s.rainSurchargePesewas : 0);
}

export class DeliveryNotAvailableError extends Error {
  constructor(region: string, now: Date) {
    super(`Same-day delivery isn't available to ${region} at ${now.toISOString().slice(11, 16)} UTC`);
  }
}
