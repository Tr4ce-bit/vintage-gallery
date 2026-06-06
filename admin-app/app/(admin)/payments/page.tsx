"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Wallet, BadgeCheck, Clock, XCircle, RotateCcw, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

interface PaymentRow {
  id:                string;
  provider:          string;
  providerReference: string;
  status:            "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";
  method:            string | null;
  amount:            number;
  currency:          string;
  fee:               number | null;
  channel:           string | null;
  customerEmail:     string | null;
  orderNumber:       string | null;
  customerName:      string | null;
  createdAt:         string;
  paidAt:            string | null;
}

interface Resp {
  totals: {
    successRevenue: number;
    successFees:    number;
    refundedAmount: number;
    counts:         { success: number; pending: number; failed: number };
  };
  payments: PaymentRow[];
  page:     number;
  limit:    number;
  total:    number;
}

const RANGES   = ["7", "30", "90", "all"] as const;
const STATUSES = ["all", "SUCCESS", "PENDING", "FAILED", "REFUNDED", "CANCELLED"] as const;

function fmtMoney(n: number, ccy = "GHS"): string {
  return `${ccy === "GHS" ? "GH₵" : ccy} ${n.toFixed(2)}`;
}
function fmtDateTime(s: string): string {
  return new Date(s).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function statusStyles(s: PaymentRow["status"]): string {
  switch (s) {
    case "SUCCESS":   return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "PENDING":   return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "FAILED":    return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    case "REFUNDED":  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300";
    case "CANCELLED": return "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400";
  }
}

export default function PaymentsPage() {
  const { getAccessToken } = useAuth();
  const [data,     setData]     = useState<Resp | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [days,     setDays]     = useState<typeof RANGES[number]>("30");
  const [status,   setStatus]   = useState<typeof STATUSES[number]>("all");
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const qs = new URLSearchParams({ days, status, search, page: String(page), limit: "50" });
      const res = await fetch(apiUrl(`/api/admin/payments?${qs}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(await res.json());
    } catch { setData(null); }
    finally   { setLoading(false); }
  }, [days, status, search, page, getAccessToken]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [days, status, search]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Money</p>
        <h1 className="font-serif text-zinc-900 dark:text-zinc-50" style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 300 }}>
          Payments
        </h1>
        <p className="font-sans text-xs text-zinc-400 dark:text-zinc-500 font-light mt-1">
          Provider-agnostic — Paystack today, more added automatically as they ship
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Kpi icon={<Wallet size={14} />}     label="Revenue"          value={data ? fmtMoney(data.totals.successRevenue) : "—"} />
        <Kpi icon={<CreditCard size={14} />} label="Provider fees"    value={data ? fmtMoney(data.totals.successFees)    : "—"} />
        <Kpi icon={<BadgeCheck size={14} />} label="Successful"       value={data ? data.totals.counts.success.toLocaleString() : "—"} />
        <Kpi icon={<Clock size={14} />}      label="Pending"          value={data ? data.totals.counts.pending.toLocaleString() : "—"} />
        <Kpi icon={<RotateCcw size={14} />}  label="Refunded amount"  value={data ? fmtMoney(data.totals.refundedAmount) : "—"} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`font-sans text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border transition-all ${
                days === r
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400"
              }`}
            >
              {r === "all" ? "All time" : `${r}d`}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`font-sans text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border transition-all ${
                status === s
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Reference, email, order #"
            className="font-sans text-xs pl-8 pr-3 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 w-56 focus:outline-none focus:border-zinc-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-800 dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : !data || data.payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <XCircle size={20} className="text-zinc-300 dark:text-zinc-600" />
            <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500">No payments match these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 dark:border-zinc-700">
                <tr className="text-zinc-400 dark:text-zinc-500 font-sans text-[10px] tracking-[0.2em] uppercase font-medium">
                  <th className="px-4 py-3 text-left">When</th>
                  <th className="px-4 py-3 text-left">Provider</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-700/60 font-sans">
                {data.payments.map(p => (
                  <tr key={p.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/40">
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(p.paidAt ?? p.createdAt)}</td>
                    <td className="px-4 py-3">{p.provider}</td>
                    <td className="px-4 py-3">{p.method ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="text-zinc-700 dark:text-zinc-200">{p.customerName ?? "Guest"}</div>
                      {p.customerEmail && <div className="text-zinc-400 text-xs">{p.customerEmail}</div>}
                    </td>
                    <td className="px-4 py-3">{p.orderNumber ? `#${p.orderNumber}` : "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{p.providerReference.slice(-12)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium">{fmtMoney(p.amount, p.currency)}</div>
                      {p.fee != null && <div className="text-zinc-400 text-xs">fee {fmtMoney(p.fee, p.currency)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.1em] uppercase ${statusStyles(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > data.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-700">
            <p className="font-sans text-xs text-zinc-400">
              Page {data.page} of {totalPages} · {data.total} payments
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={data.page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="font-sans text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >Prev</button>
              <button
                disabled={data.page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="font-sans text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
        {icon}
        <span className="font-sans text-[9px] tracking-[0.3em] uppercase font-light">{label}</span>
      </div>
      <p className="mt-2 font-serif text-xl text-zinc-900 dark:text-zinc-50" style={{ fontWeight: 300 }}>{value}</p>
    </div>
  );
}
