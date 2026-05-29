/**
 * Weather helper — checks current conditions in Accra, Ghana.
 * Uses WeatherAPI.com (https://www.weatherapi.com/). Results are cached by
 * Next.js fetch for 15 minutes (900 s) to avoid hammering the API.
 *
 * Env var: WEATHER_API_KEY (from weatherapi.com → dashboard → API key)
 * Free tier: 1,000,000 calls/month — with 15-min caching we use ~3,000/month.
 */

const WEATHER_KEY  = process.env.WEATHER_API_KEY;
const ACCRA_QUERY  = "5.6037,-0.1870"; // "lat,lon" for Accra

export interface WeatherSnapshot {
  isRaining:   boolean;
  description: string; // e.g. "Light rain", "Sunny"
  icon:        string; // left blank — CSP only allows S3/Cloudinary images
  temp:        number; // Celsius
}

const FALLBACK: WeatherSnapshot = {
  isRaining:   false,
  description: "unavailable",
  icon:        "",
  temp:        30,
};

/**
 * Returns current Accra weather.
 * Cached server-side for 15 minutes via Next.js fetch cache.
 * Never throws — returns FALLBACK on any error or missing key.
 */
export async function getAccraWeather(): Promise<WeatherSnapshot> {
  if (!WEATHER_KEY) return FALLBACK;

  try {
    const url =
      `https://api.weatherapi.com/v1/current.json` +
      `?key=${WEATHER_KEY}&q=${ACCRA_QUERY}&aqi=no`;

    const res = await fetch(url, {
      next: { revalidate: 900 }, // 15-minute cache
    });

    if (!res.ok) return FALLBACK;

    const data = await res.json();
    const cur  = data.current;
    if (!cur) return FALLBACK;

    // WeatherAPI gives precipitation in mm + a condition text.
    // Treat any measurable precip OR a rainy condition word as "raining".
    const precip = Number(cur.precip_mm ?? 0);
    const text   = String(cur.condition?.text ?? "");
    const isRaining = precip > 0 || /rain|drizzle|thunder|shower|sleet/i.test(text);

    return {
      isRaining,
      description: text || "clear",
      icon:        "",
      temp:        Math.round(cur.temp_c ?? 30),
    };
  } catch {
    return FALLBACK;
  }
}
