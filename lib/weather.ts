/**
 * Weather helper — checks current conditions in Accra, Ghana.
 * Results are cached by Next.js fetch for 15 minutes (900 s) to avoid
 * hammering the OpenWeatherMap API on every checkout page load.
 */

const OWM_KEY      = process.env.OPENWEATHER_API_KEY;
const ACCRA_LAT    = 5.6037;
const ACCRA_LON    = -0.1870;

export interface WeatherSnapshot {
  isRaining:   boolean;
  description: string; // e.g. "light rain", "clear sky"
  icon:        string; // OWM icon code e.g. "10d"
  temp:        number; // Celsius
}

const FALLBACK: WeatherSnapshot = {
  isRaining:   false,
  description: "unavailable",
  icon:        "01d",
  temp:        30,
};

/**
 * Returns current Accra weather.
 * Cached server-side for 15 minutes via Next.js fetch cache.
 * Never throws — returns FALLBACK on any error.
 */
export async function getAccraWeather(): Promise<WeatherSnapshot> {
  if (!OWM_KEY) return FALLBACK;

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${ACCRA_LAT}&lon=${ACCRA_LON}&units=metric&appid=${OWM_KEY}`;

    const res = await fetch(url, {
      next: { revalidate: 900 }, // 15-minute cache
    });

    if (!res.ok) return FALLBACK;

    const data = await res.json();

    const weatherId: number = data.weather?.[0]?.id ?? 800;

    // OWM weather IDs:
    //   2xx = Thunderstorm, 3xx = Drizzle, 5xx = Rain
    //   6xx = Snow (unlikely in Ghana), 7xx = Atmosphere
    const isRaining = weatherId < 600;

    return {
      isRaining,
      description: data.weather?.[0]?.description ?? "clear sky",
      icon:        data.weather?.[0]?.icon         ?? "01d",
      temp:        Math.round(data.main?.temp      ?? 30),
    };
  } catch {
    return FALLBACK;
  }
}
