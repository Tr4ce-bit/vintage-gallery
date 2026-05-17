"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface OrderItem {
  id: string; size: string; color: string; quantity: number;
  unitPrice: number; subtotal: number;
  product: { name: string; imageUrl: string } | null;
}
interface Order {
  id: string; paystackReference: string; status: string;
  totalAmount: number; createdAt: string;
  deliveryFullName: string; deliveryPhone: string;
  deliveryAddress: string; deliveryNotes?: string;
  items: OrderItem[];
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

const TIMELINE = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const TIMELINE_LABELS: Record<string, string> = {
  PENDING:    "Order Placed",
  PAID:       "Payment Confirmed",
  PROCESSING: "Being Prepared",
  SHIPPED:    "Out for Delivery",
  DELIVERED:  "Delivered",
};

// Customer can only cancel before admin confirms (PROCESSING)
const CUSTOMER_CANCELLABLE = ["PENDING", "PAID"];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { isSignedIn, isLoaded, getAccessToken } = useAuth();
  const [order,      setOrder]      = useState<Order | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelErr,  setCancelErr]  = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in"); return; }
    load();
  }, [isSignedIn, isLoaded]); // eslint-disable-line

  async function load() {
    const token = await getAccessToken();
    const res   = await fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { setLoading(false); return; }
    const data  = await res.json();
    setOrder(data.order);
    setLoading(false);
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
      // Refresh order state
      setOrder(prev => prev ? { ...prev, status: "CANCELLED" } : prev);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
    </div>
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

  return (
    <main className="min-h-screen bg-white pt-[60px]">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">

        <Link href="/orders"
          className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-300 hover:text-zinc-600 transition-colors mb-8">
          <ArrowLeft size={12} /> My Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
          <div>
            <p className="font-mono text-sm text-zinc-400 mb-1">
              #{order.paystackReference.slice(-8).toUpperCase()}
            </p>
            <h1 className="font-serif text-zinc-900 mb-1"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}>
              Order Detail
            </h1>
            <p className="font-sans text-sm text-zinc-400">{fmt(order.createdAt)}</p>
          </div>
          <span className={`self-start font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-3 py-1.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-zinc-100 text-zinc-500"}`}>
            {order.status}
          </span>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="bg-white border border-zinc-100 rounded-2xl px-4 md:px-6 py-6 mb-6">
            <h2 className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-300 font-light mb-5">
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
                      isDone || isCurrent ? "text-zinc-700" : "text-zinc-300"
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
            <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-50">
                <h2 className="font-sans text-sm font-medium text-zinc-800">Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[380px]">
                  <thead>
                    <tr className="border-b border-zinc-50">
                      {["Product","Size","Qty","Price","Subtotal"].map(h => (
                        <th key={h} className="px-4 md:px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 font-light">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="border-b border-zinc-50 last:border-0">
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-700">{item.product?.name ?? "Product deleted"}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400">{item.size}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400">{item.quantity}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm text-zinc-400">GH₵ {item.unitPrice}</td>
                        <td className="px-4 md:px-5 py-3 font-sans text-sm font-medium text-zinc-700">GH₵ {item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-zinc-50 space-y-2">
                <div className="flex justify-between font-sans text-sm text-zinc-400">
                  <span>Subtotal</span><span>GH₵ {subtotal}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-zinc-400">
                  <span>Delivery</span><span>GH₵ 30</span>
                </div>
                <div className="flex justify-between font-sans text-sm font-semibold text-zinc-900 pt-1 border-t border-zinc-50">
                  <span>Total</span><span>GH₵ {order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: delivery + cancel */}
          <div className="space-y-4">
            <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-5 space-y-2">
              <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 font-light mb-3">Delivery Info</h3>
              <p className="font-sans text-sm font-medium text-zinc-800">{order.deliveryFullName}</p>
              <p className="font-sans text-sm text-zinc-500">{order.deliveryPhone}</p>
              <p className="font-sans text-sm text-zinc-500">{order.deliveryAddress}</p>
              {order.deliveryNotes && (
                <p className="font-sans text-sm text-zinc-400 italic">{order.deliveryNotes}</p>
              )}
            </div>

            {/* Cancel section */}
            {!isCancelled && (
              <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-5">
                {canCancel ? (
                  <>
                    <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 font-light mb-3">Cancel Order</h3>
                    <p className="font-sans text-xs text-zinc-400 mb-4 leading-relaxed">
                      You can cancel before our team starts preparing your order. Once confirmed, cancellation is no longer available.
                    </p>
                    {cancelErr && (
                      <p className="font-sans text-xs text-red-500 mb-3">{cancelErr}</p>
                    )}
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="w-full py-2.5 rounded-full border border-red-200 font-sans text-[11px] tracking-[0.15em] uppercase text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {cancelling ? "Cancelling…" : "Cancel Order"}
                    </button>
                  </>
                ) : lockedByAdmin ? (
                  <>
                    <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-300 font-light mb-2">Cancel Order</h3>
                    <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                      Your order is being prepared and can no longer be cancelled. Please contact us if you need assistance.
                    </p>
                  </>
                ) : null}
              </div>
            )}

            <Link href="/shop"
              className="block w-full text-center font-sans text-[11px] tracking-[0.18em] uppercase py-3 rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 transition-all duration-200">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
