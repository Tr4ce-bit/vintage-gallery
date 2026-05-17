"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Footer from "@/components/Footer";

type MomoNetwork = "MTN" | "TELECEL" | "AIRTELTIGO";

const NETWORKS: { id: MomoNetwork; label: string; color: string }[] = [
  { id: "MTN",        label: "MTN MoMo",   color: "bg-yellow-400" },
  { id: "TELECEL",    label: "Telecel",     color: "bg-red-500"    },
  { id: "AIRTELTIGO", label: "AirtelTigo", color: "bg-blue-600"   },
];

export default function CheckoutPage() {
  const router                            = useRouter();
  const { items, totalPrice, clearCart }  = useCartStore();
  const DELIVERY_FEE                      = 30;
  const subtotal                          = totalPrice();
  const total                             = subtotal + DELIVERY_FEE;

  // Delivery form
  const [form, setForm] = useState({
    fullName:    "",
    email:       "",
    phone:       "",
    address:     "",
    notes:       "",
  });

  // Payment
  const [network, setNetwork]   = useState<MomoNetwork | "">("");
  const [momoPhone, setMomoPhone] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCheckout = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.address) {
      setError("Please fill in all delivery details.");
      return;
    }
    if (!network || !momoPhone) {
      setError("Please select your MoMo network and enter your phone number.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:       form.email,
          amountGHS:   total,
          momoNetwork: network,
          momoPhone,
          cartItems:   items,
          deliveryInfo: {
            fullName: form.fullName,
            phone:    form.phone,
            address:  form.address,
            notes:    form.notes,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Payment initialisation failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Paystack hosted payment page
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  if (items.length === 0 && typeof window !== "undefined") {
    router.push("/shop");
    return null;
  }

  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">

          {/* Header */}
          <div className="mb-10">
            <Link href="/cart" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors group mb-6">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Cart
            </Link>
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">
              Secure Checkout
            </p>
            <h1
              className="font-serif text-zinc-900 leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300 }}
            >
              Complete Your Order.
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

            {/* ── Left: Forms ── */}
            <div className="lg:col-span-3 space-y-10">

              {/* Delivery section */}
              <section>
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100">
                  01 · Delivery Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name",              key: "fullName",  type: "text",  placeholder: "Kwame Asante",          full: true  },
                    { label: "Email Address",          key: "email",     type: "email", placeholder: "you@email.com",         full: false },
                    { label: "Phone Number",           key: "phone",     type: "tel",   placeholder: "0241234567",            full: false },
                    { label: "Ghana Post / Address",   key: "address",   type: "text",  placeholder: "GA-123-4567 or street", full: true  },
                  ].map(({ label, key, type, placeholder, full }) => (
                    <div key={key} className={full ? "sm:col-span-2" : ""}>
                      <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={set(key as keyof typeof form)}
                        placeholder={placeholder}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={set("notes")}
                      placeholder="Any instructions for delivery..."
                      rows={2}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Payment section */}
              <section>
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100">
                  02 · Mobile Money Payment
                </p>

                {/* Network picker */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {NETWORKS.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setNetwork(n.id)}
                      className={`rounded-xl border py-3 px-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                        network === n.id
                          ? "border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${n.color}`} />
                      <span className="font-sans text-[10px] tracking-[0.1em] text-zinc-600 dark:text-zinc-300 font-light">{n.label}</span>
                    </button>
                  ))}
                </div>

                {/* MoMo phone */}
                <div>
                  <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                    MoMo Phone Number
                  </label>
                  <input
                    type="tel"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="0241234567"
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  />
                  <p className="font-sans text-[9px] text-zinc-300 font-light mt-2">
                    You will receive a push notification to approve the payment on your phone.
                  </p>
                </div>
              </section>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-sans text-sm text-red-500 font-light"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* ── Right: Summary ── */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl bg-zinc-50 border border-zinc-100 p-6">
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-5">
                  Order Summary
                </p>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-200 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-zinc-900 text-white rounded-full text-[8px] flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs text-zinc-600 font-light truncate">{item.name}</p>
                        <p className="font-sans text-[9px] text-zinc-300 font-light">Size {item.size}</p>
                      </div>
                      <span className="font-sans text-sm text-zinc-600 font-light shrink-0">
                        GH₵ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-zinc-200 pt-4 space-y-2 mb-5">
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-zinc-400 font-light">Subtotal</span>
                    <span className="font-sans text-sm text-zinc-600 font-light">GH₵ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-zinc-400 font-light">Delivery</span>
                    <span className="font-sans text-sm text-zinc-600 font-light">GH₵ {DELIVERY_FEE}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-200">
                    <span className="font-sans text-sm text-zinc-700">Total</span>
                    <span className="font-serif text-xl text-zinc-900 font-light">GH₵ {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 text-white font-sans font-medium text-[11px] tracking-[0.18em] uppercase py-4 rounded-full hover:bg-zinc-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock size={12} />
                      Pay GH₵ {total.toLocaleString()} with MoMo
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                <p className="font-sans text-[9px] text-zinc-300 font-light text-center mt-3">
                  Payments processed securely by Paystack
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
