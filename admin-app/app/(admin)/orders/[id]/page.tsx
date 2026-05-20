"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

interface OrderItem {
  id: string; size: string; color: string; quantity: number;
  unitPrice: number; subtotal: number;
  product: { name: string } | null;
}
interface Order {
  id: string; paystackReference: string; status: string;
  totalAmount: number; createdAt: string; updatedAt: string;
  deliveryFullName: string; deliveryPhone: string;
  deliveryAddress: string; deliveryNotes?: string;
  guestEmail?: string;
  momoNetwork?: string; momoNumberMasked?: string;
  user: { fullName: string; email: string } | null;
  items: OrderItem[];
}

const ALL_STATUSES = ["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];
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
  return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getAccessToken } = useAuth();
  const [order,     setOrder]     = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  async function load() {
    const token = await getAccessToken();
    const res   = await fetch(apiUrl(`/api/admin/orders/${id}`), { headers: { Authorization: `Bearer ${token}` } });
    const data  = await res.json();
    setOrder(data.order);
    setNewStatus(data.order?.status ?? "");
    setLoading(false);
  }

  async function handleUpdateStatus() {
    if (!order || newStatus === order.status) return;
    setSaving(true);
    const token = await getAccessToken();
    const res   = await fetch(apiUrl(`/api/admin/orders/${id}`), {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    setOrder(data.order);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-800 dark:border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!order) return <div className="px-4 md:px-8 py-6 md:py-8 font-sans text-sm text-zinc-400">Order not found.</div>;

  const subtotal = order.items.reduce((s, i) => s + i.subtotal, 0);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      <Link href="/orders" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-8">
        <ArrowLeft size={12} /> Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <p className="font-mono text-sm text-zinc-400 dark:text-zinc-500 mb-1">{order.paystackReference}</p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 mb-1" style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 300 }}>Order Detail</h1>
          <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500">{fmt(order.createdAt)}</p>
        </div>
        <span className={`self-start font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-3 py-1.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-zinc-50 dark:border-zinc-700/50">
              <h2 className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-zinc-50 dark:border-zinc-700/50">
                    {["Product","Size","Qty","Unit","Subtotal"].map(h => (
                      <th key={h} className="px-4 md:px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600 font-light">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} className="border-b border-zinc-50 dark:border-zinc-700/30 last:border-0">
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-700 dark:text-zinc-200">{item.product?.name ?? "Deleted"}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400 dark:text-zinc-500">{item.size}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400 dark:text-zinc-500">{item.quantity}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400 dark:text-zinc-500">GH₵ {item.unitPrice}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm font-medium text-zinc-700 dark:text-zinc-200">GH₵ {item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-zinc-50 dark:border-zinc-700/50 space-y-1.5">
              <div className="flex justify-between font-sans text-sm text-zinc-400 dark:text-zinc-500"><span>Subtotal</span><span>GH₵ {subtotal}</span></div>
              <div className="flex justify-between font-sans text-sm text-zinc-400 dark:text-zinc-500"><span>Delivery</span><span>GH₵ 30</span></div>
              <div className="flex justify-between font-sans text-sm font-medium text-zinc-900 dark:text-zinc-50"><span>Total</span><span>GH₵ {order.totalAmount}</span></div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-5">
            <h2 className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-4">Update Status</h2>
            <div className="flex items-center gap-3">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="flex-1 border border-zinc-200 dark:border-zinc-600 rounded-xl px-4 py-2.5 font-sans text-sm text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-400 transition-colors">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleUpdateStatus} disabled={saving || newStatus === order.status}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {saved ? <><CheckCircle2 size={13} /> Saved</> : saving ? "Saving…" : "Update"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar cards */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 py-5">
            <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 dark:text-zinc-600 font-light mb-3">Customer</h3>
            <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100">{order.user?.fullName ?? order.deliveryFullName}</p>
            <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500">{order.user?.email ?? order.guestEmail ?? "—"}</p>
            {!order.user && (
              <span className="font-sans text-[9px] tracking-[0.15em] uppercase text-zinc-300 dark:text-zinc-600 font-light">Guest order</span>
            )}
          </div>
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 py-5 space-y-2">
            <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 dark:text-zinc-600 font-light mb-3">Delivery</h3>
            <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100">{order.deliveryFullName}</p>
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400">{order.deliveryPhone}</p>
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400">{order.deliveryAddress}</p>
            {order.deliveryNotes && <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500 italic">{order.deliveryNotes}</p>}
          </div>
          {order.momoNetwork && (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 py-5">
              <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 dark:text-zinc-600 font-light mb-3">Payment</h3>
              <p className="font-sans text-sm text-zinc-700 dark:text-zinc-200">{order.momoNetwork} MoMo</p>
              <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500 font-mono">{order.momoNumberMasked}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
