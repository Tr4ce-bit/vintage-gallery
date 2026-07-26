"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, XCircle, Pencil, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface OrderItem {
  id: string; size: string; color: string; quantity: number;
  unitPrice: number; subtotal: number;
  product: { name: string; imageUrl: string } | null;
}
interface Order {
  id: string; orderNumber: string; paystackReference: string; status: string;
  totalAmount: number; createdAt: string;
  deliveryFullName: string; deliveryPhone: string;
  deliveryAddress: string; deliveryCity: string; deliveryRegion: string;
  deliveryNotes?: string;
  items: OrderItem[];
}

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo",
  "Ahafo", "Bono East", "North East", "Oti", "Savannah", "Western North",
];

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-700",
  PAID:       "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED:    "bg-violet-100 text-violet-700",
  DELIVERED:  "bg-emerald-100 text-emerald-700",
  CANCELLED:  "bg-red-100 text-red-600",
  REFUNDED:   "bg-zinc-100 text-zinc-500",
};

const TIMELINE = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const TIMELINE_LABELS: Record<string, string> = {
  PENDING:    "Order Placed",
  PAID:       "Payment Confirmed",
  PROCESSING: "Being Prepared",
  SHIPPED:    "Out for Delivery",
  DELIVERED:  "Delivered",
};

const CUSTOMER_CANCELLABLE = ["PENDING", "PAID"];
const ADDRESS_EDITABLE      = ["PENDING", "PAID"];
const EDIT_WINDOW_MINUTES   = 15;

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function minutesRemaining(createdAt: string) {
  return Math.max(0, EDIT_WINDOW_MINUTES - (Date.now() - new Date(createdAt).getTime()) / 60_000);
}

const inputCls = "w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 font-sans text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 bg-white dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { isSignedIn, isLoaded, getAccessToken } = useAuth();

  const [order,       setOrder]       = useState<Order | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [cancelling,  setCancelling]  = useState(false);
  const [cancelErr,   setCancelErr]   = useState("");

  // Address edit state
  const [editOpen,    setEditOpen]    = useState(false);
  const [editSaving,  setEditSaving]  = useState(false);
  const [editErr,     setEditErr]     = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [editForm,    setEditForm]    = useState({
    fullName: "", phone: "", region: "", city: "", address: "", notes: "",
  });
  // Live countdown (minutes)
  const [minsLeft, setMinsLeft] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in"); return; }
    load();
  }, [isSignedIn, isLoaded]); // eslint-disable-line

  // Tick countdown every 30 s
  useEffect(() => {
    if (!order) return;
    setMinsLeft(minutesRemaining(order.createdAt));
    const t = setInterval(() => setMinsLeft(minutesRemaining(order.createdAt)), 30_000);
    return () => clearInterval(t);
  }, [order]);

  const load = useCallback(async () => {
    const token = await getAccessToken();
    const res   = await fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { setLoading(false); return; }
    const data  = await res.json();
    setOrder(data.order);
    setLoading(false);
  }, [id, getAccessToken]);

  function openEdit(o: Order) {
    setEditForm({
      fullName: o.deliveryFullName,
      phone:    o.deliveryPhone,
      region:   o.deliveryRegion ?? "",
      city:     o.deliveryCity   ?? "",
      address:  o.deliveryAddress,
      notes:    o.deliveryNotes  ?? "",
    });
    setEditErr("");
    setEditSuccess(false);
    setEditOpen(true);
  }

  async function handleCancel() {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelErr("");
    setCancelling(true);
    const token = await getAccessToken();
    const res   = await fetch(`/api/orders/${id}`, {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    setCancelling(false);
    if (!res.ok) {
      setCancelErr(data.error ?? "Could not cancel order.");
    } else {
      setOrder(prev => prev ? { ...prev, status: "CANCELLED" } : prev);
    }
  }

  async function handleAddressSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.fullName || !editForm.phone || !editForm.region || !editForm.city || !editForm.address) {
      setEditErr("All fields except notes are required.");
      return;
    }
    setEditSaving(true);
    setEditErr("");
    const token = await getAccessToken();
    const res   = await fetch(`/api/orders/${id}`, {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "update-address", deliveryInfo: editForm }),
    });
    const data = await res.json();
    setEditSaving(false);
    if (!res.ok) {
      setEditErr(data.error ?? "Could not update address.");
    } else {
      setEditSuccess(true);
      setOrder(prev => prev ? {
        ...prev,
        deliveryFullName: editForm.fullName,
        deliveryPhone:    editForm.phone,
        deliveryRegion:   editForm.region,
        deliveryCity:     editForm.city,
        deliveryAddress:  editForm.address,
        deliveryNotes:    editForm.notes || undefined,
      } : prev);
      setTimeout(() => { setEditOpen(false); setEditSuccess(false); }, 1200);
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-white pt-[60px]">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 space-y-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-3">
          <div className="animate-pulse h-3 w-24 rounded-md bg-zinc-100" />
          <div className="animate-pulse h-8 w-1/2 rounded-md bg-zinc-100" />
          <div className="animate-pulse h-3 w-3/4 rounded-md bg-zinc-100" />
          <div className="animate-pulse h-3 w-full rounded-md bg-zinc-100" />
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-3 w-full rounded-md bg-zinc-100" />
          ))}
        </div>
      </div>
    </main>
  );
  if (!order) return (
    <main className="min-h-screen bg-white pt-[60px]">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
        <p className="font-sans text-sm text-zinc-400">Order not found.</p>
      </div>
    </main>
  );

  const subtotal      = order.items.reduce((s, i) => s + i.subtotal, 0);
  const currentStep   = TIMELINE.indexOf(order.status as typeof TIMELINE[number]);
  const isCancelled   = order.status === "CANCELLED" || order.status === "REFUNDED";
  const canCancel     = CUSTOMER_CANCELLABLE.includes(order.status);
  const lockedByAdmin = !canCancel && !isCancelled;
  const canEditAddr   = ADDRESS_EDITABLE.includes(order.status) && minsLeft > 0;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">

        <Link href="/orders"
          className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-8">
          <ArrowLeft size={12} /> My Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
          <div>
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-1">Order</p>
            <h1 className="font-serif text-zinc-900 dark:text-zinc-50 mb-1"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}>
              #{order.orderNumber}
            </h1>
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400">{fmt(order.createdAt)}</p>
          </div>
          <span className={`self-start font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-3 py-1.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-zinc-100 text-zinc-500"}`}>
            {order.status}
          </span>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 md:px-6 py-6 mb-6">
            <h2 className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-5">
              Order Progress
            </h2>
            <div className="flex items-start gap-0">
              {TIMELINE.map((step, i) => {
                const isDone    = i < currentStep;
                const isCurrent = i === currentStep;
                const isLast    = i === TIMELINE.length - 1;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative">
                    {!isLast && (
                      <div className={`absolute top-3 left-1/2 w-full h-0.5 ${isDone ? "bg-emerald-400" : "bg-zinc-100"}`} />
                    )}
                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center mb-2 ${
                      isDone ? "bg-emerald-400" : isCurrent ? "bg-zinc-900" : "bg-zinc-100"
                    }`}>
                      {isDone
                        ? <CheckCircle2 size={14} className="text-white" />
                        : <Circle size={10} className={isCurrent ? "text-white" : "text-zinc-300"} />
                      }
                    </div>
                    <p className={`font-sans text-[9px] tracking-[0.1em] uppercase text-center leading-tight ${
                      isDone || isCurrent ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"
                    }`}>
                      {TIMELINE_LABELS[step]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6">
            <XCircle size={18} className="text-red-400 shrink-0" />
            <p className="font-sans text-sm text-red-600">
              This order was {order.status.toLowerCase()}. If you have any questions, please contact us.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items + totals */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-50 dark:border-zinc-800">
                <h2 className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-200">Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[380px]">
                  <thead>
                    <tr className="border-b border-zinc-50 dark:border-zinc-800">
                      {["Product","Size","Qty","Price","Subtotal"].map(h => (
                        <th key={h} className="px-4 md:px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 font-light">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-700 dark:text-zinc-200">{item.product?.name ?? "Product deleted"}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-500 dark:text-zinc-400">{item.size}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-500 dark:text-zinc-400">{item.quantity}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-500 dark:text-zinc-400">GH₵ {item.unitPrice}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm font-medium text-zinc-700 dark:text-zinc-200">GH₵ {item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-zinc-50 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between font-sans text-sm text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal</span><span>GH₵ {subtotal}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-zinc-500 dark:text-zinc-400">
                  <span>Delivery</span><span>GH₵ 30</span>
                </div>
                <div className="flex justify-between font-sans text-sm font-semibold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-50 dark:border-zinc-800">
                  <span>Total</span><span>GH₵ {order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Delivery info card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-light">Delivery Info</h3>
                {canEditAddr && !editOpen && (
                  <button onClick={() => openEdit(order)}
                    className="flex items-center gap-1.5 font-sans text-[9px] tracking-[0.1em] uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    <Pencil size={10} />
                    Edit · {Math.ceil(minsLeft)} min left
                  </button>
                )}
                {editOpen && (
                  <button onClick={() => setEditOpen(false)}
                    className="text-zinc-400 hover:text-zinc-700 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {!editOpen ? (
                <div className="space-y-1.5">
                  <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-200">{order.deliveryFullName}</p>
                  <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400">{order.deliveryPhone}</p>
                  {(order.deliveryCity || order.deliveryRegion) && (
                    <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400">
                      {[order.deliveryCity, order.deliveryRegion].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400">{order.deliveryAddress}</p>
                  {order.deliveryNotes && (
                    <p className="font-sans text-sm text-zinc-500 dark:text-zinc-500 italic">{order.deliveryNotes}</p>
                  )}
                </div>
              ) : (
                /* Edit form */
                <form onSubmit={handleAddressSave} className="space-y-3">
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light block mb-1">Full Name *</label>
                    <input value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                      placeholder="Kwame Asante" required autoComplete="off" className={inputCls} />
                  </div>
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light block mb-1">Phone *</label>
                    <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="0241234567" required autoComplete="off" className={inputCls} />
                  </div>
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light block mb-1">Region *</label>
                    <select value={editForm.region} onChange={e => setEditForm(f => ({ ...f, region: e.target.value }))}
                      required className={`${inputCls} appearance-none cursor-pointer`}>
                      <option value="" disabled>Select region…</option>
                      {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light block mb-1">City / Town *</label>
                    <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="Accra" required autoComplete="off" className={inputCls} />
                  </div>
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light block mb-1">Street Address *</label>
                    <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="12 Oxford Street, East Legon" required autoComplete="off" className={inputCls} />
                  </div>
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light block mb-1">Notes</label>
                    <input value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Optional instructions" autoComplete="off" className={inputCls} />
                  </div>
                  {editErr && <p className="font-sans text-xs text-red-500">{editErr}</p>}
                  {editSuccess && <p className="font-sans text-xs text-emerald-600">Address updated!</p>}
                  <button type="submit" disabled={editSaving}
                    className="w-full py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans text-[10px] tracking-[0.15em] uppercase font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors disabled:opacity-40">
                    {editSaving ? "Saving…" : "Save Address"}
                  </button>
                </form>
              )}
            </div>

            {/* Cancel section */}
            {!isCancelled && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-5">
                {canCancel ? (
                  <>
                    <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">Cancel Order</h3>
                    <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                      You can cancel before our team starts preparing your order. Once confirmed, cancellation is no longer available.
                    </p>
                    {cancelErr && (
                      <p className="font-sans text-xs text-red-500 mb-3">{cancelErr}</p>
                    )}
                    <button onClick={handleCancel} disabled={cancelling}
                      className="w-full py-2.5 rounded-full border border-red-200 dark:border-red-900 font-sans text-[11px] tracking-[0.15em] uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40">
                      {cancelling ? "Cancelling…" : "Cancel Order"}
                    </button>
                  </>
                ) : lockedByAdmin ? (
                  <>
                    <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-2">Cancel Order</h3>
                    <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Your order is being prepared and can no longer be cancelled. Please contact us if you need assistance.
                    </p>
                  </>
                ) : null}
              </div>
            )}

            <Link href="/shop"
              className="block w-full text-center font-sans text-[11px] tracking-[0.18em] uppercase py-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
