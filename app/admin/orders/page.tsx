"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: string; paystackReference: string; status: string;
  totalAmount: number; createdAt: string;
  user: { fullName: string };
  items: { id: string }[];
}

const STATUSES = ["All","PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];
const STATUS_COLOR: Record<string, string> = {
  PENDING:"bg-amber-100 text-amber-700", PAID:"bg-blue-100 text-blue-700",
  PROCESSING:"bg-indigo-100 text-indigo-700", SHIPPED:"bg-violet-100 text-violet-700",
  DELIVERED:"bg-emerald-100 text-emerald-700", CANCELLED:"bg-red-100 text-red-600",
  REFUNDED:"bg-zinc-100 text-zinc-500",
};
function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

export default function AdminOrdersPage() {
  const { getAccessToken } = useAuth();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [filter,  setFilter]  = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function load() {
    const token = await getAccessToken();
    const res   = await fetch("/api/admin/orders?limit=200", { headers: { Authorization: `Bearer ${token}` } });
    const data  = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  const shown = filter === "All" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Management</p>
        <h1 className="font-serif text-zinc-900" style={{ fontSize: "2rem", fontWeight: 300 }}>Orders</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border transition-all ${
              filter === s ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
            }`}>
            {s}
            {s !== "All" && (
              <span className="ml-1.5 opacity-60">{orders.filter(o => o.status === s).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <p className="px-6 py-12 font-sans text-sm text-zinc-300 text-center">No orders found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {["Reference","Customer","Items","Amount","Status","Date",""].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 font-light">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(o => (
                <tr key={o.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">{o.paystackReference.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3.5 font-sans text-sm text-zinc-700">{o.user?.fullName ?? "—"}</td>
                  <td className="px-5 py-3.5 font-sans text-sm text-zinc-400">{o.items.length}</td>
                  <td className="px-5 py-3.5 font-sans text-sm text-zinc-700 font-medium">GH₵ {o.totalAmount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-sans text-sm text-zinc-400">{fmt(o.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${o.id}`}
                      className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
