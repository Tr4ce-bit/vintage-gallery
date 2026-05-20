"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowLeft, CheckCircle2, Circle, XCircle, Package } from "lucide-react";

interface TrackItem {
  id: string;
  productName: string;
  imageUrl: string | null;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
interface TrackedOrder {
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  deliveryFullName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryRegion: string;
  deliveryNotes?: string;
  items: TrackItem[];
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

const STATUS_MESSAGE: Record<string, string> = {
  PENDING:    "Your order is awaiting payment confirmation.",
  PAID:       "Payment confirmed! We're getting your order ready.",
  PROCESSING: "Your order is being prepared by our team.",
  SHIPPED:    "Your order is on its way to you!",
  DELIVERED:  "Your order has been delivered. Enjoy!",
  CANCELLED:  "This order has been cancelled.",
  REFUNDED:   "This order has been refunded.",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [identifier,  setIdentifier]  = useState("");   // email or phone
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [order,       setOrder]       = useState<TrackedOrder | null>(null);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    const cleaned = orderNumber.trim().replace(/^#/, "").toUpperCase();
    if (!cleaned || cleaned.length < 4) { setError("Please enter a valid Order ID."); setLoading(false); return; }

    const trimmed = identifier.trim();
    // Detect email vs phone
    const isEmail = trimmed.includes("@");
    const params  = new URLSearchParams({ orderNumber: cleaned });
    if (isEmail) params.set("email", trimmed);
    else         params.set("phone", trimmed);

    try {
      const res  = await fetch(`/api/track?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); }
      else         { setOrder(data.order); }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isCancelled   = order?.status === "CANCELLED" || order?.status === "REFUNDED";
  const currentStep   = order ? TIMELINE.indexOf(order.status as typeof TIMELINE[number]) : -1;
  const subtotal      = order ? order.items.reduce((s, i) => s + i.subtotal, 0) : 0;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-12">

        <Link href="/"
          className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-8">
          <ArrowLeft size={12} /> Home
        </Link>

        <div className="mb-8">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-2">
            Vintage Gallery
          </p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none mb-3"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300 }}>
            Track Your Order
          </h1>
          <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Enter your Order ID and the email address or phone number you used at checkout.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack}
          className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-6 mb-8 space-y-4">

          <div>
            <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-light block mb-2">
              Order ID
            </label>
            <input
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="e.g. VG4KX9M2"
              required
              autoComplete="off"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-600 bg-white dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
          </div>

          <div>
            <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-light block mb-2">
              Email Address or Phone Number
            </label>
            <input
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="e.g. you@email.com or 0241234567"
              required
              autoComplete="off"
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-600 bg-white dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-500">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
              : <Search size={13} />}
            {loading ? "Searching…" : "Track Order"}
          </button>
        </form>

        {/* Results */}
        {order && (
          <div className="space-y-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-1">Order</p>
                <p className="font-serif text-zinc-900 dark:text-zinc-50"
                  style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 300, lineHeight: 1 }}>
                  #{order.orderNumber}
                </p>
                <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500 mt-1">{fmt(order.createdAt)}</p>
              </div>
              <span className={`mt-1 self-start font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-3 py-1.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                {order.status}
              </span>
            </div>

            {/* Status message */}
            <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {STATUS_MESSAGE[order.status]}
            </p>

            {/* Timeline */}
            {!isCancelled && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 md:px-6 py-6">
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
                          <div className={`absolute top-3 left-1/2 w-full h-0.5 ${isDone ? "bg-emerald-400" : "bg-zinc-100 dark:bg-zinc-800"}`} />
                        )}
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center mb-2 ${
                          isDone ? "bg-emerald-400" : isCurrent ? "bg-zinc-900 dark:bg-white" : "bg-zinc-100 dark:bg-zinc-800"
                        }`}>
                          {isDone
                            ? <CheckCircle2 size={14} className="text-white" />
                            : <Circle size={10} className={isCurrent ? "text-white dark:text-zinc-900" : "text-zinc-300 dark:text-zinc-600"} />}
                        </div>
                        <p className={`font-sans text-[9px] tracking-[0.05em] uppercase text-center leading-tight ${
                          isDone || isCurrent ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-300 dark:text-zinc-600"
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
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl px-5 py-4">
                <XCircle size={18} className="text-red-400 shrink-0" />
                <p className="font-sans text-sm text-red-600 dark:text-red-400">
                  This order was {order.status.toLowerCase()}. Contact us at{" "}
                  <a href="mailto:vintagegallerystore@gmail.com" className="underline">
                    vintagegallerystore@gmail.com
                  </a>{" "}
                  if you have questions.
                </p>
              </div>
            )}

            {/* Items */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-50 dark:border-zinc-800">
                <h2 className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-200">Items</h2>
              </div>
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    {item.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-50 dark:bg-zinc-800">
                        <Image src={item.imageUrl} alt={item.productName} width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Package size={18} className="text-zinc-300 dark:text-zinc-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.productName}</p>
                      <p className="font-sans text-xs text-zinc-400 dark:text-zinc-500">{item.size} · {item.color} · Qty {item.quantity}</p>
                    </div>
                    <p className="font-sans text-sm font-medium text-zinc-700 dark:text-zinc-200 shrink-0">
                      GH₵ {item.subtotal}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between font-sans text-sm text-zinc-400 dark:text-zinc-500">
                  <span>Subtotal</span><span>GH₵ {subtotal}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-zinc-400 dark:text-zinc-500">
                  <span>Delivery</span><span>GH₵ 30</span>
                </div>
                <div className="flex justify-between font-sans text-sm font-semibold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-50 dark:border-zinc-800">
                  <span>Total</span><span>GH₵ {order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-5 space-y-1.5">
              <h3 className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
                Delivery Info
              </h3>
              <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-200">{order.deliveryFullName}</p>
              <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400">{order.deliveryPhone}</p>
              {(order.deliveryCity || order.deliveryRegion) && (
                <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400">
                  {[order.deliveryCity, order.deliveryRegion].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400">{order.deliveryAddress}</p>
              {order.deliveryNotes && (
                <p className="font-sans text-sm text-zinc-400 dark:text-zinc-500 italic">{order.deliveryNotes}</p>
              )}
            </div>

            {/* Help */}
            <p className="font-sans text-xs text-zinc-400 dark:text-zinc-500 text-center leading-relaxed pt-2">
              Need help?{" "}
              <a href="mailto:vintagegallerystore@gmail.com" className="underline hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                Email us
              </a>{" "}
              or{" "}
              <a href="https://wa.me/233538477072" target="_blank" rel="noopener noreferrer"
                className="underline hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                WhatsApp
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
