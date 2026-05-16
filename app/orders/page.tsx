"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: string;
  paystackReference: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { id: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-700",
  PAID:       "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED:    "bg-violet-100 text-violet-700",
  DELIVERED:  "bg-emerald-100 text-emerald-700",
  CANCELLED:  "bg-red-100 text-red-600",
  REFUNDED:   "bg-zinc-100 text-zinc-500",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getAccessToken } = useAuth();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in"); return; }
    load();
  }, [isSignedIn, isLoaded]); // eslint-disable-line

  async function load() {
    const token = await getAccessToken();
    const res   = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data  = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white pt-[60px]">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">Account</p>
          <h1 className="font-serif text-zinc-900 leading-none"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300 }}>
            My Orders
          </h1>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-sans text-sm text-zinc-300 mb-4">No orders yet.</p>
              <Link href="/shop"
                className="font-sans text-sm text-zinc-900 font-medium hover:underline">
                Shop the collection →
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  {["Order","Date","Items","Total","Status",""].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 font-light">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                      #{o.paystackReference.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 font-sans text-sm text-zinc-400">{fmt(o.createdAt)}</td>
                    <td className="px-5 py-4 font-sans text-sm text-zinc-400">{o.items.length} {o.items.length === 1 ? "item" : "items"}</td>
                    <td className="px-5 py-4 font-sans text-sm font-medium text-zinc-700">GH₵ {o.totalAmount}</td>
                    <td className="px-5 py-4">
                      <span className={`font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/orders/${o.id}`}
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
    </main>
  );
}
