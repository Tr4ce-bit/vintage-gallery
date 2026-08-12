"use client";

import { useEffect, useState } from "react";
import { Eye, Heart, ShoppingBag, Users, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";
import { Skeleton, SkeletonKpi } from "@/components/Skeleton";

interface ProductRow {
  productId:       string;
  productName:     string;
  slug:            string;
  imageUrl:        string;
  views:           number;
  wishlistAdds:    number;
  wishlistRemoves: number;
  cartAdds:        number;
  cartRemoves:     number;
  avgTimeSec:      number;
  timeSamples:     number;
}

interface Analytics {
  days:    number;
  totals: {
    events:         number;
    uniqueSessions: number;
    views:          number;
    wishlistAdds:   number;
    cartAdds:       number;
    avgTimeSec:     number;
    timeSamples:    number;
  };
  topByViews:    ProductRow[];
  topByTime:     ProductRow[];
  topByWishlist: ProductRow[];
  topByCart:     ProductRow[];
}

const RANGES = [7, 30, 90] as const;
type Range = typeof RANGES[number];

function fmtSecs(n: number): string {
  if (n < 60) return `${n}s`;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export default function AnalyticsPage() {
  const { getAccessToken } = useAuth();
  const [data,    setData]    = useState<Analytics | null>(null);
  const [days,    setDays]    = useState<Range>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [days]); // eslint-disable-line

  async function load() {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) { setData(null); return; }

      const res = await fetch(apiUrl(`/api/admin/analytics?days=${days}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      // An error body has no `totals`, and storing it would make the render
      // throw on data.totals.uniqueSessions — killing the page mid-render.
      if (!res.ok) { setData(null); return; }

      const body = await res.json();
      setData(body && body.totals ? body : null);
    } catch { setData(null); }
    finally   { setLoading(false); }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-500 dark:text-zinc-300 font-medium mb-1">Insights</p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50" style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 300 }}>
            Analytics
          </h1>
          <p className="font-sans text-xs text-zinc-400 dark:text-zinc-500 font-light mt-1">
            Anonymous product interaction events from the store
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border transition-all ${
                days === r
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400"
              }`}
            >
              Last {r}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonKpi key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-5">
                <Skeleton className="h-3 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="h-3 flex-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : !data ? (
        <p className="text-zinc-400 font-sans text-sm">Could not load analytics.</p>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <Kpi icon={<Users size={14} />}      label="Unique sessions" value={data.totals.uniqueSessions.toLocaleString()} />
            <Kpi icon={<Eye size={14} />}        label="Product views"   value={data.totals.views.toLocaleString()} />
            <Kpi icon={<Clock size={14} />}      label="Avg time / shirt" value={fmtSecs(data.totals.avgTimeSec)} />
            <Kpi icon={<Heart size={14} />}      label="Wishlist adds"    value={data.totals.wishlistAdds.toLocaleString()} />
            <Kpi icon={<ShoppingBag size={14} />} label="Cart adds"        value={data.totals.cartAdds.toLocaleString()} />
          </div>

          {/* Top tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopTable title="Most viewed shirts" rows={data.topByViews}    metricLabel="Views"     metric={r => r.views} />
            <TopTable title="Longest browse time" rows={data.topByTime}    metricLabel="Avg time"  metric={r => r.avgTimeSec} formatMetric={fmtSecs} />
            <TopTable title="Most wishlisted"   rows={data.topByWishlist} metricLabel="Wishlists" metric={r => r.wishlistAdds} />
            <TopTable title="Most added to cart" rows={data.topByCart}    metricLabel="Cart adds" metric={r => r.cartAdds} />
          </div>

          {data.totals.events === 0 && (
            <p className="mt-8 font-sans text-sm text-zinc-400 dark:text-zinc-500 text-center max-w-md mx-auto">
              No events recorded yet in this window. As customers browse the store,
              data will start appearing here within a minute or two.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
        {icon}
        <span className="font-sans text-[9px] tracking-[0.3em] uppercase font-medium text-zinc-500 dark:text-zinc-300">{label}</span>
      </div>
      <p className="mt-2 font-serif text-2xl text-zinc-900 dark:text-zinc-50" style={{ fontWeight: 300 }}>{value}</p>
    </div>
  );
}

function TopTable({
  title, rows, metricLabel, metric, formatMetric,
}: {
  title:        string;
  rows:         ProductRow[];
  metricLabel:  string;
  metric:       (r: ProductRow) => number;
  formatMetric?: (n: number) => string;
}) {
  const max = Math.max(1, ...rows.map(metric));
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700">
        <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">{title}</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-10 font-sans text-sm text-zinc-300 dark:text-zinc-600 text-center">No data yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-700/60">
          {rows.map(r => {
            const v = metric(r);
            const pct = Math.max(2, Math.round((v / max) * 100));
            return (
              <li key={r.productId} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-zinc-700 dark:text-zinc-200 truncate">{r.productName}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                    <div className="h-full bg-zinc-800 dark:bg-zinc-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans text-sm text-zinc-900 dark:text-zinc-100 font-medium tabular-nums">
                    {formatMetric ? formatMetric(v) : v.toLocaleString()}
                  </p>
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light">{metricLabel}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
