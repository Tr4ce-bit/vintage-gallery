// Shared rain-surcharge resolver, used by BOTH the public /api/delivery-fee
// endpoint (display) and /api/paystack (the actual charge), so the fee shown
// and the fee charged can never drift apart.
//
// Settings:
//   delivery_rain_enabled  "true" | "false"  — master on/off for the feature
//   delivery_rain_mode     "auto" | "on" | "off"
//       auto → OpenWeatherMap decides (needs OPENWEATHER_API_KEY)
//       on   → force surcharge applied (manual: "it's raining")
//       off  → force no surcharge (manual: "it's clear")

import { getAccraWeather } from "@/lib/weather";

export type RainMode = "auto" | "on" | "off";

export interface RainResult {
  isRaining:   boolean;
  description: string;
  icon:        string;
  temp:        number;
  source:      "auto" | "manual" | "disabled";
}

export async function resolveRain(cfg: Record<string, string>): Promise<RainResult> {
  // Master switch off → no surcharge at all
  if (cfg.delivery_rain_enabled === "false") {
    return { isRaining: false, description: "disabled", icon: "01d", temp: 30, source: "disabled" };
  }

  const mode = (cfg.delivery_rain_mode ?? "auto") as RainMode;

  if (mode === "on") {
    return { isRaining: true,  description: "manual override: raining", icon: "10d", temp: 30, source: "manual" };
  }
  if (mode === "off") {
    return { isRaining: false, description: "manual override: clear",   icon: "01d", temp: 30, source: "manual" };
  }

  // auto — live weather (falls back to not-raining if no API key)
  const wx = await getAccraWeather();
  return { ...wx, source: "auto" };
}
