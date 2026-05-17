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
  momoNetwork?: string; momoNumberMasked?: string;
  user: { fullName: string; email: string };
  items: OrderItem[];
}

const ALL_STATUSES = ["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];
const STATUS_COLOR: Record<string, string> = {
  PENDING:"bg-amber-100 text-amber-700", PAID:"bg-blue-100 text-blue-700",
  PROCESSING:"bg-indigo-100 text-indigo-700", SHIPPED:"bg-violet-100 text-violet-700",
  DELIVERED:"bg-emerald-100 text-emerald-700", CANCELLED:"bg-red-100 text-red-600",
  REFUNDED:"bg-zinc-100 text-zinc-500",
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
      <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
    </div>
  );
  if (!order) return <div className="px-4 md:px-8 py-6 md:py-8 font-sans text-sm text-zinc-400">Order not found.</div>;

  const subtotal = order.items.reduce((s, i) => s + i.subtotal, 0);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      <Link href="/orders" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-300 hover:text-zinc-600 transition-colors mb-8">
        <ArrowLeft size={12} /> Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <p className="font-mono text-sm text-zinc-400 mb-1">{order.paystackReference}</p>
          <h1 className="font-serif text-zinc-900 mb-1" style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 300 }}>Order Detail</h1>
          <p className="font-sans text-sm text-zinc-400">{fmt(order.createdAt)}</p>
        </div>
        <span className={`self-start font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-3 py-1.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-zinc-100 text-zinc-500"}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-zinc-50">
              <h2 className="font-sans text-sm font-medium text-zinc-800">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-zinc-50">
                    {["Product","Size","Qty","Unit","Subtotal"].map(h => (
                      <th key={h} className="px-4 md:px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 font-light">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} className="border-b border-zinc-50 last:border-0">
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-700">{item.product?.name ?? "Deleted"}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400">{item.size}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400">{item.quantity}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400">GH₵ {item.unitPrice}</td>
                      <td className="px-4 md:px-5 py-3 font-sans text-sm font-medium text-zinc-700">GH₵ {item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-zinc-50 space-y-1.5">
              <div className="flex justify-between font-sans text-sm text-zinc-400"><span>Subtotal</span><span>GH₵ {subtotal}</span></div>
              <div className="flex justify-between font-sans text-sm text-zinc-400"><span>Delivery</span><span>GH₵ 30</span></div>
              <div className="flex justify-between font-sans text-sm font-medium text-zinc-900"><span>Total</span><span>GH₵ {order.totalAmount}</span></div>
            </div>
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl px-6 py-5">
            <h2 className="font-sans text-sm font-medium text-zinc-800 mb-4">Update Status</h2>
            <div className="flex items-center gap-3">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="flex-1 border border-zinc-200 rounded-xl px-4 py-2.5 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleUpdateStatus} disabled={saving || newStatus === order.status}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {saved ? <><CheckCircle2 size={13} /> Saved</> : saving ? "Saving…" : "Update"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-5">
            <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 font-light mb-3">Customer</h3>
            <p className="font-sans text-sm font-medium text-zinc-800">{order.user?.fullName ?? order.deliveryFullName}</p>
            <p className="font-sans text-sm text-zinc-400">{order.user?.email ?? "—"}</p>
          </div>
          <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-5 space-y-2">
            <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 font-light mb-3">Delivery</h3>
            <p className="font-sans text-sm font-medium text-zinc-800">{order.deliveryFullName}</p>
            <p className="font-sans text-sm text-zinc-500">{order.deliveryPhone}</p>
            <p className="font-sans text-sm text-zinc-500">{order.deliveryAddress}</p>
            {order.deliveryNotes && <p className="font-sans text-sm text-zinc-400 italic">{order.deliveryNotes}</p>}
          </div>
          {order.momoNetwork && (
            <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-5">
              <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 font-light mb-3">Payment</h3>
              <p className="font-sans text-sm text-zinc-700">{order.momoNetwork} MoMo</p>
              <p className="font-sans text-sm text-zinc-400 font-mono">{order.momoNumberMasked}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
