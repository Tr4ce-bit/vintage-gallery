"use client";

import { useEffect, useState } from "react";
import { Save, CloudRain, Truck, Zap, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl }  from "@/lib/api";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";

interface DeliverySettings {
  delivery_standard:               string;
  delivery_sameday:                string;
  delivery_sameday_rain_surcharge: string;
  delivery_rain_enabled:           string;
  delivery_rain_mode:              string; // "auto" | "on" | "off"
}

interface WeatherInfo {
  isRaining:          boolean;
  weatherDescription: string;
  weatherIcon:        string;
  weatherTemp:        number;
  standard:           number;
  sameday:            number;
  rainSurcharge:      number;
}

const inputCls =
  "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors";

export default function SettingsPage() {
  const { getAccessToken } = useAuth();

  const [settings, setSettings] = useState<DeliverySettings>({
    delivery_standard:               "30",
    delivery_sameday:                "50",
    delivery_sameday_rain_surcharge: "20",
    delivery_rain_enabled:           "true",
    delivery_rain_mode:              "auto",
  });

  const [weather,  setWeather]  = useState<WeatherInfo | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [wxLoading,setWxLoading]= useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");

  // Load current settings
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        const res   = await fetch(apiUrl("/api/admin/settings/delivery"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []); // eslint-disable-line

  // Load live weather preview
  const loadWeather = async () => {
    setWxLoading(true);
    try {
      const res = await fetch(apiUrl("/api/delivery-fee"));
      if (res.ok) setWeather(await res.json());
    } catch { /* ignore */ }
    finally { setWxLoading(false); }
  };

  useEffect(() => { loadWeather(); }, []); // eslint-disable-line

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const token = await getAccessToken();
      const res   = await fetch(apiUrl("/api/admin/settings/delivery"), {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save settings.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Refresh weather preview with new settings
        await loadWeather();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const rainEnabled = settings.delivery_rain_enabled === "true";

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-4 max-w-3xl">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-48 mb-4" />
        <SkeletonCard rows={3} />
        <SkeletonCard rows={4} />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-500 font-light mb-1">
          Configuration
        </p>
        <h1 className="font-serif text-white leading-none" style={{ fontSize: "2rem", fontWeight: 300 }}>
          Settings
        </h1>
      </div>

      {/* ── Delivery Pricing ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
          <Truck size={16} className="text-zinc-400" />
          <h2 className="font-sans text-sm font-medium text-white">Delivery Pricing</h2>
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-600 font-light ml-auto">
            GHS (₵)
          </span>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Standard fee */}
          <div>
            <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
              Standard Delivery Fee
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm text-zinc-400">GH₵</span>
              <input
                type="number"
                min="0"
                max="10000"
                step="0.5"
                value={settings.delivery_standard}
                onChange={e => setSettings(s => ({ ...s, delivery_standard: e.target.value }))}
                className={`${inputCls} pl-12`}
                placeholder="30"
              />
            </div>
            <p className="font-sans text-[10px] text-zinc-600 mt-1.5">
              Applied to all standard orders (2 – 4 business days).
            </p>
          </div>

          {/* Same-day fee */}
          <div>
            <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
              Same-Day Delivery Base Fee
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm text-zinc-400">GH₵</span>
              <input
                type="number"
                min="0"
                max="10000"
                step="0.5"
                value={settings.delivery_sameday}
                onChange={e => setSettings(s => ({ ...s, delivery_sameday: e.target.value }))}
                className={`${inputCls} pl-12`}
                placeholder="50"
              />
            </div>
            <p className="font-sans text-[10px] text-zinc-600 mt-1.5">
              Base price before any weather surcharge.
            </p>
          </div>
        </div>
      </div>

      {/* ── Weather-Based Pricing ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
          <CloudRain size={16} className="text-blue-400" />
          <h2 className="font-sans text-sm font-medium text-white">Rain Surcharge</h2>
          <span className="font-sans text-[9px] text-zinc-500 font-light ml-1">Accra, GH</span>

          {/* Toggle */}
          <button
            type="button"
            onClick={() =>
              setSettings(s => ({
                ...s,
                delivery_rain_enabled: s.delivery_rain_enabled === "true" ? "false" : "true",
              }))
            }
            className="ml-auto flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            {rainEnabled
              ? <ToggleRight size={22} className="text-blue-400" />
              : <ToggleLeft  size={22} />}
            <span className="font-sans text-xs">{rainEnabled ? "Enabled" : "Disabled"}</span>
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          <p className="font-sans text-[11px] text-zinc-400 font-light leading-relaxed">
            When enabled, customers choosing Same-Day Delivery see a surcharge added when it&apos;s
            raining in Accra. Choose how rain is detected below.
          </p>

          {/* Rain detection mode */}
          <div className={rainEnabled ? "" : "opacity-40 pointer-events-none"}>
            <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
              Rain Detection
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { val: "auto", label: "Auto",  hint: "Live weather" },
                { val: "on",   label: "On",    hint: "Force raining" },
                { val: "off",  label: "Off",   hint: "Force clear" },
              ] as const).map(opt => {
                const active = (settings.delivery_rain_mode ?? "auto") === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, delivery_rain_mode: opt.val }))}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-blue-400 bg-blue-500/10"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                    }`}
                  >
                    <span className={`block font-sans text-sm ${active ? "text-blue-300" : "text-white"}`}>{opt.label}</span>
                    <span className="block font-sans text-[10px] text-zinc-500">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
            <p className="font-sans text-[10px] text-zinc-600 mt-1.5">
              Auto uses OpenWeatherMap (needs WEATHER_API_KEY). On/Off override the weather manually.
            </p>
          </div>

          {/* Rain surcharge amount */}
          <div className={rainEnabled ? "" : "opacity-40 pointer-events-none"}>
            <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
              Surcharge When Raining
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm text-zinc-400">GH₵</span>
              <input
                type="number"
                min="0"
                max="10000"
                step="0.5"
                value={settings.delivery_sameday_rain_surcharge}
                onChange={e =>
                  setSettings(s => ({ ...s, delivery_sameday_rain_surcharge: e.target.value }))
                }
                className={`${inputCls} pl-12`}
                placeholder="20"
              />
            </div>
            <p className="font-sans text-[10px] text-zinc-600 mt-1.5">
              Added on top of the same-day base fee when it&apos;s raining.
            </p>
          </div>

          {/* Live weather preview */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light">
                Live Preview · Accra Now
              </p>
              <button
                type="button"
                onClick={loadWeather}
                disabled={wxLoading}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <RefreshCw size={12} className={wxLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {weather ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${weather.isRaining ? "bg-blue-400" : "bg-emerald-400"}`} />
                  <span className="font-sans text-sm text-white capitalize">{weather.weatherDescription}</span>
                  <span className="font-sans text-xs text-zinc-500">{weather.weatherTemp}°C</span>
                  {weather.isRaining && (
                    <span className="font-sans text-[9px] tracking-[0.15em] uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      Rain active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 mt-3">
                  <div>
                    <p className="font-sans text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">Standard</p>
                    <p className="font-sans text-base text-white font-light">GH₵ {weather.standard}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      <Zap size={8} /> Same-Day {weather.isRaining && rainEnabled && "(+ rain)"}
                    </p>
                    <p className={`font-sans text-base font-light ${weather.isRaining && rainEnabled ? "text-blue-300" : "text-white"}`}>
                      GH₵ {weather.sameday}
                      {weather.isRaining && rainEnabled && weather.rainSurcharge > 0 && (
                        <span className="font-sans text-[10px] text-blue-500 ml-1">
                          (+{weather.rainSurcharge})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-sans text-xs text-zinc-600">
                {wxLoading ? "Loading weather…" : "Weather unavailable (check WEATHER_API_KEY env var)"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3">
          <p className="font-sans text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.18em] uppercase px-8 py-3.5 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
        ) : (
          <Save size={13} />
        )}
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}
