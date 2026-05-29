/**
 * GET /api/delivery-fee
 *
 * Public endpoint — returns current delivery fees, weather-aware.
 * Called by the checkout page to show live pricing.
 * Response is cached at the CDN/edge for 10 minutes.
 */
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/db";
import { getAccraWeather } from "@/lib/weather";

// Always read current settings from the DB so admin price changes show
// in the store immediately. This is a tiny 4-row query; weather is still
// cached 15 min inside getAccraWeather(), so no external API hammering.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Load delivery settings from DB (with defaults)
    const rows = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "delivery_standard",
            "delivery_sameday",
            "delivery_sameday_rain_surcharge",
            "delivery_rain_enabled",
          ],
        },
      },
    });

    const cfg: Record<string, string> = {};
    for (const r of rows) cfg[r.key] = r.value;

    const standardFee   = Number(cfg.delivery_standard                ?? 30);
    const samedayBase   = Number(cfg.delivery_sameday                 ?? 50);
    const rainSurcharge = Number(cfg.delivery_sameday_rain_surcharge  ?? 20);
    const rainEnabled   = cfg.delivery_rain_enabled !== "false"; // default on

    // Check Accra weather (cached 15 min server-side)
    const weather = rainEnabled
      ? await getAccraWeather()
      : { isRaining: false, description: "N/A", icon: "01d", temp: 30 };

    const samedayTotal = weather.isRaining
      ? samedayBase + rainSurcharge
      : samedayBase;

    return NextResponse.json({
      standard:           standardFee,
      sameday:            samedayTotal,
      samedayBase,
      rainSurcharge:      weather.isRaining ? rainSurcharge : 0,
      isRaining:          weather.isRaining,
      weatherDescription: weather.description,
      weatherIcon:        weather.icon,
      weatherTemp:        weather.temp,
    });
  } catch (err) {
    console.error("delivery-fee error:", err);
    // Always return a usable fallback
    return NextResponse.json({
      standard:           30,
      sameday:            50,
      samedayBase:        50,
      rainSurcharge:      0,
      isRaining:          false,
      weatherDescription: "unknown",
      weatherIcon:        "01d",
      weatherTemp:        30,
    });
  }
}
