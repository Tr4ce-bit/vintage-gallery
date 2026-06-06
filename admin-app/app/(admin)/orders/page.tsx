"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";
import { SkeletonRow } from "@/components/Skeleton";

interface Order {
  id: string; orderNumber: string; paystackReference: string; status: string;
  totalAmount: number; createdAt: string;
  deliveryFullName: string;
  user: { fullName: string } | null;
  items: { id: string }[];
}

const STATUSES = ["All","PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];
const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  PAID:       "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  PROCESSING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  SHIPPED:    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  DELIVERED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  CANCELLED:  "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  REFUNDED:   "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
};
function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

export default function OrdersPage() {
  const { getAccessToken } = useAuth();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [filter,  setFilter]  = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function load() {
    const token = await getAccessToken();
    const res   = await fetch(apiUrl("/api/admin/orders?limit=200"), { headers: { Authorization: `Bearer ${token}` } });
    const data  = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  const shown = filter === "All" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6">
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Management</p>
        <h1 className="font-serif text-zinc-900 dark:text-zinc-50" style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 300 }}>Orders</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border transition-all ${
              filter === s
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}>
            {s}
            {s !== "All" && <span className="ml-1.5 opacity-60">{orders.filter(o => o.status === s).length}</span>}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div>{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}</div>
        ) : shown.length === 0 ? (
          <p className="px-6 py-12 font-sans text-sm text-zinc-300 dark:text-zinc-600 text-center">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-700">
                  {["Order ID","Customer","Items","Amount","Status","Date",""].map((h, i) => (
                    <th key={i} className="px-4 md:px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600 font-light">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map(o => (
                  <tr key={o.id} className="border-b border-zinc-50 dark:border-zinc-700/30 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                    <td className="px-4 md:px-5 py-3.5 font-mono text-xs text-zinc-400 dark:text-zinc-500">#{o.orderNumber}</td>
                    <td className="px-4 md:px-5 py-3.5 font-sans text-sm text-zinc-700 dark:text-zinc-200">{o.user?.fullName ?? o.deliveryFullName}</td>
                    <td className="px-4 md:px-5 py-3.5 font-sans text-sm text-zinc-400 dark:text-zinc-500">{o.items.length}</td>
                    <td className="px-4 md:px-5 py-3.5 font-sans text-sm text-zinc-700 dark:text-zinc-200 font-medium">GH₵ {o.totalAmount}</td>
                    <td className="px-4 md:px-5 py-3.5">
                      <span className={`font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-5 py-3.5 font-sans text-sm text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{fmt(o.createdAt)}</td>
                    <td className="px-4 md:px-5 py-3.5">
                      <Link href={`/orders/${o.id}`} className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
