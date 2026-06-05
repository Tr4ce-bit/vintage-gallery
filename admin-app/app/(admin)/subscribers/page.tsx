"use client";

import { useEffect, useState } from "react";
import { Download, Search, Trash2, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

interface Subscriber {
  id:           string;
  email:        string;
  name:         string | null;
  source:       string | null;
  unsubscribed: boolean;
  createdAt:    string;
}

const FILTERS = ["all", "active", "unsubscribed"] as const;
type Filter = typeof FILTERS[number];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function SubscribersPage() {
  const { getAccessToken } = useAuth();
  const [items,       setItems]       = useState<Subscriber[]>([]);
  const [total,       setTotal]       = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [filter,      setFilter]      = useState<Filter>("all");
  const [search,      setSearch]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [busyId,      setBusyId]      = useState<string | null>(null);

  useEffect(() => { load(); }, [page, filter]); // eslint-disable-line

  // Debounce search by 300 ms
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  async function load() {
    setLoading(true);
    const token = await getAccessToken();
    const qs = new URLSearchParams({
      page:   String(page),
      limit:  "50",
      status: filter,
      ...(search ? { search } : {}),
    });
    try {
      const res  = await fetch(apiUrl(`/api/admin/subscribers?${qs}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setActiveCount(data.activeCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUnsub(s: Subscriber) {
    setBusyId(s.id);
    const token = await getAccessToken();
    await fetch(apiUrl(`/api/admin/subscribers/${s.id}`), {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ unsubscribed: !s.unsubscribed }),
    });
    setBusyId(null);
    load();
  }

  async function remove(s: Subscriber) {
    if (!confirm(`Permanently delete ${s.email}? This cannot be undone.`)) return;
    setBusyId(s.id);
    const token = await getAccessToken();
    await fetch(apiUrl(`/api/admin/subscribers/${s.id}`), {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBusyId(null);
    load();
  }

  async function downloadCsv() {
    const token = await getAccessToken();
    const qs = new URLSearchParams({ format: "csv", status: filter, ...(search ? { search } : {}) });
    const res = await fetch(apiUrl(`/api/admin/subscribers?${qs}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Management</p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50" style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 300 }}>
            Subscribers
          </h1>
          <p className="font-sans text-xs text-zinc-400 dark:text-zinc-500 font-light mt-1">
            {activeCount} active · {total} total{search ? ` matching "${search}"` : ""}
          </p>
        </div>
        <button
          onClick={downloadCsv}
          className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans font-medium text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => { setPage(1); setFilter(f); }}
            className={`font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border transition-all ${
              filter === f
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email or name"
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full pl-9 pr-4 py-2 font-sans text-xs text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors w-64"
          />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-800 dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-12 font-sans text-sm text-zinc-300 dark:text-zinc-600 text-center">
            No subscribers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/40">
                  <th className="px-5 py-3 text-left font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-medium">Email</th>
                  <th className="px-5 py-3 text-left font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-medium">Name</th>
                  <th className="px-5 py-3 text-left font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-medium">Source</th>
                  <th className="px-5 py-3 text-left font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id} className="border-b border-zinc-50 dark:border-zinc-700/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                    <td className="px-5 py-3.5 font-sans text-sm text-zinc-700 dark:text-zinc-200">{s.email}</td>
                    <td className="px-5 py-3.5 font-sans text-sm text-zinc-500 dark:text-zinc-400">{s.name ?? "—"}</td>
                    <td className="px-5 py-3.5 font-sans text-xs text-zinc-400 dark:text-zinc-500">{s.source ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center font-sans text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${
                        s.unsubscribed
                          ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      }`}>
                        {s.unsubscribed ? "Unsubscribed" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-xs text-zinc-400 dark:text-zinc-500">{fmt(s.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          disabled={busyId === s.id}
                          onClick={() => toggleUnsub(s)}
                          title={s.unsubscribed ? "Re-activate subscriber" : "Mark as unsubscribed"}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          disabled={busyId === s.id}
                          onClick={() => remove(s)}
                          title="Permanently delete"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="font-sans text-xs text-zinc-500 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
