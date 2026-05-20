"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Clock, CheckCircle2, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

interface Order {
  id: string; orderNumber: number; paystackReference: string; status: string;
  totalAmount: number; createdAt: string;
  deliveryFullName: string;
  user: { fullName: string; email: string } | null;
}

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
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const { getAccessToken } = useAuth();
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [products, setProducts] = useState<{ id: string; isActive: boolean }[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function load() {
    const token   = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const [oRes, pRes] = await Promise.all([
      fetch(apiUrl("/api/admin/orders?limit=100"), { headers }),
      fetch(apiUrl("/api/admin/products"),         { headers }),
    ]);
    const oData = await oRes.json();
    const pData = await pRes.json();
    setOrders(oData.orders ?? []);
    setProducts(pData.products ?? []);
    setLoading(false);
  }

  const paidStatuses   = ["PAID","PROCESSING","SHIPPED","DELIVERED"];
  const revenue        = orders.filter(o => paidStatuses.includes(o.status)).reduce((s, o) => s + o.totalAmount, 0);
  const pending        = orders.filter(o => o.status === "PENDING").length;
  const activeProducts = products.filter(p => p.isActive).length;
  const recent         = orders.slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-800 dark:border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Overview</p>
        <h1 className="font-serif text-zinc-900 dark:text-zinc-50" style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 300 }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
        {[
          { label: "Total Revenue",   value: `GH₵ ${revenue.toLocaleString()}`, icon: TrendingUp,   color: "text-emerald-500" },
          { label: "Pending Orders",  value: pending,                            icon: Clock,        color: "text-amber-500"   },
          { label: "Total Orders",    value: orders.length,                      icon: CheckCircle2, color: "text-blue-500"    },
          { label: "Active Products", value: activeProducts,                     icon: Package,      color: "text-violet-500"  },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-4 py-4 md:px-5 md:py-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-light">{label}</p>
              <Icon size={15} strokeWidth={1.5} className={color} />
            </div>
            <p className="font-serif text-zinc-900 dark:text-zinc-50" style={{ fontSize: "1.6rem", fontWeight: 300 }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50 dark:border-zinc-700/50">
          <h2 className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100">Recent Orders</h2>
          <Link href="/orders" className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            View all →
          </Link>
        </div>
        {recent.length === 0
          ? <p className="px-6 py-8 font-sans text-sm text-zinc-300 dark:text-zinc-600 text-center">No orders yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-zinc-50 dark:border-zinc-700/50">
                    {["Order ID","Customer","Amount","Status","Date"].map(h => (
                      <th key={h} className="px-4 md:px-6 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600 font-light">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(o => (
                    <tr key={o.id} className="border-b border-zinc-50 dark:border-zinc-700/30 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                      <td className="px-4 md:px-6 py-3.5">
                        <Link href={`/orders/${o.id}`} className="font-mono text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                          #{String(o.orderNumber).padStart(4, "0")}
                        </Link>
                      </td>
                      <td className="px-4 md:px-6 py-3.5 font-sans text-sm text-zinc-700 dark:text-zinc-200">{o.user?.fullName ?? o.deliveryFullName}</td>
                      <td className="px-4 md:px-6 py-3.5 font-sans text-sm text-zinc-700 dark:text-zinc-200">GH₵ {o.totalAmount}</td>
                      <td className="px-4 md:px-6 py-3.5">
                        <span className={`font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3.5 font-sans text-sm text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{fmt(o.createdAt)}</td>
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
