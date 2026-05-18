"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, User, UserPlus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";

type MomoNetwork = "MTN" | "TELECEL" | "AIRTELTIGO";

const NETWORKS: { id: MomoNetwork; label: string; color: string }[] = [
  { id: "MTN",        label: "MTN MoMo",   color: "bg-yellow-400" },
  { id: "TELECEL",    label: "Telecel",     color: "bg-red-500"    },
  { id: "AIRTELTIGO", label: "AirtelTigo", color: "bg-blue-600"   },
];

// "null" = haven't chosen yet, "guest" = continue without account
type AuthMode = null | "guest";

export default function CheckoutPage() {
  const router                            = useRouter();
  const { items, totalPrice, clearCart }  = useCartStore();
  const { user, isLoaded, isSignedIn }    = useAuth();

  const DELIVERY_FEE = 30;
  const subtotal     = totalPrice();
  const total        = subtotal + DELIVERY_FEE;

  // Auth gate — null until user makes a choice (or is already signed in)
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  // Delivery form
  const [form, setForm] = useState({
    fullName: "",
    email:    "",
    phone:    "",
    address:  "",
    notes:    "",
  });

  // Pre-fill email once we know the signed-in user
  useEffect(() => {
    if (isSignedIn && user?.email) {
      setForm(f => ({ ...f, email: user.email! }));
    }
  }, [isSignedIn, user]);

  // Payment
  const [network,   setNetwork]   = useState<MomoNetwork | "">("");
  const [momoPhone, setMomoPhone] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

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
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:        form.email,
          amountGHS:    total,
          momoNetwork:  network,
          momoPhone,
          cartItems:    items,
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

  // Show auth gate if:
  //  • auth state has resolved
  //  • user is NOT signed in
  //  • they haven't chosen guest yet
  const showGate = isLoaded && !isSignedIn && authMode === null;

  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">

          {/* Header */}
          <div className="mb-10">
            <Link href="/cart"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors group mb-6">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Cart
            </Link>
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">
              Secure Checkout
            </p>
            <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300 }}>
              Complete Your Order.
            </h1>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Auth Gate ─────────────────────────────────────────────────── */}
            {showGate && (
              <motion.div
                key="gate"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="max-w-md mx-auto"
              >
                {/* Mini cart summary */}
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 mb-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {items.slice(0, 3).map(item => (
                      <div key={`${item.productId}-${item.size}`}
                        className="relative w-10 h-12 rounded-lg overflow-hidden border-2 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 font-light">
                      {items.length} item{items.length !== 1 ? "s" : ""} · GH₵ {subtotal.toLocaleString()}
                    </p>
                    <p className="font-sans text-[9px] text-zinc-300 dark:text-zinc-600 font-light mt-0.5">
                      + GH₵ {DELIVERY_FEE} delivery · Total GH₵ {total.toLocaleString()}
                    </p>
                  </div>
                  <ShoppingBag size={16} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                </div>

                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  How would you like to continue?
                </p>

                <div className="space-y-3">

                  {/* Sign In */}
                  <Link href="/sign-in?redirect=/checkout"
                    className="group flex items-center gap-4 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 hover:border-zinc-900 dark:hover:border-zinc-300 transition-all duration-200">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0">
                      <User size={16} className="text-white dark:text-zinc-900" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-0.5">Sign In</p>
                      <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-light">
                        Faster checkout · order history · wishlist
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  {/* Create Account */}
                  <Link href="/sign-up?redirect=/checkout"
                    className="group flex items-center gap-4 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 hover:border-zinc-900 dark:hover:border-zinc-300 transition-all duration-200">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <UserPlus size={16} className="text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-0.5">Create Account</p>
                      <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-light">
                        Save your details for next time
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600">or</span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  </div>

                  {/* Guest */}
                  <button
                    onClick={() => setAuthMode("guest")}
                    className="group flex items-center gap-4 w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                      <ShoppingBag size={15} className="text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-0.5">Continue as Guest</p>
                      <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-light">
                        No account needed · just enter your details
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-zinc-200 dark:text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                <p className="font-sans text-[9px] text-zinc-300 dark:text-zinc-600 font-light text-center mt-6">
                  Payments processed securely by Paystack
                </p>
              </motion.div>
            )}

            {/* ── Checkout Form (signed in OR guest chosen) ──────────────────── */}
            {!showGate && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16"
              >
                {/* ── Left: Forms ── */}
                <div className="lg:col-span-3 space-y-10">

                  {/* Signed-in badge / guest note */}
                  {isSignedIn ? (
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 w-fit">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 font-light">
                        Signed in as {user?.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <span className="font-sans text-[10px] tracking-[0.1em] text-zinc-400 dark:text-zinc-500 font-light">
                        Checking out as guest
                      </span>
                      <button
                        onClick={() => setAuthMode(null)}
                        className="font-sans text-[10px] tracking-[0.1em] uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Delivery section */}
                  <section>
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      01 · Delivery Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Full Name",            key: "fullName", type: "text",  placeholder: "Kwame Asante",          full: true  },
                        { label: "Email Address",        key: "email",    type: "email", placeholder: "you@email.com",         full: false },
                        { label: "Phone Number",         key: "phone",    type: "tel",   placeholder: "0241234567",            full: false },
                        { label: "Ghana Post / Address", key: "address",  type: "text",  placeholder: "GA-123-4567 or street", full: true  },
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
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      02 · Mobile Money Payment
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {NETWORKS.map(n => (
                        <button key={n.id} onClick={() => setNetwork(n.id)}
                          className={`rounded-xl border py-3 px-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                            network === n.id
                              ? "border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500"
                          }`}>
                          <span className={`w-3 h-3 rounded-full ${n.color}`} />
                          <span className="font-sans text-[10px] tracking-[0.1em] text-zinc-600 dark:text-zinc-300 font-light">{n.label}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                        MoMo Phone Number
                      </label>
                      <input
                        type="tel"
                        value={momoPhone}
                        onChange={e => setMomoPhone(e.target.value)}
                        placeholder="0241234567"
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                      />
                      <p className="font-sans text-[9px] text-zinc-300 font-light mt-2">
                        You will receive a push notification to approve the payment.
                      </p>
                    </div>
                  </section>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="font-sans text-sm text-red-500 font-light">
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* ── Right: Summary ── */}
                <div className="lg:col-span-2">
                  <div className="sticky top-24 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-5">
                      Order Summary
                    </p>

                    <div className="space-y-3 mb-5">
                      {items.map(item => (
                        <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-[8px] flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-xs text-zinc-600 dark:text-zinc-300 font-light truncate">{item.name}</p>
                            <p className="font-sans text-[9px] text-zinc-300 dark:text-zinc-600 font-light">Size {item.size}</p>
                          </div>
                          <span className="font-sans text-sm text-zinc-600 dark:text-zinc-300 font-light shrink-0">
                            GH₵ {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-2 mb-5">
                      <div className="flex justify-between">
                        <span className="font-sans text-sm text-zinc-400 font-light">Subtotal</span>
                        <span className="font-sans text-sm text-zinc-600 dark:text-zinc-300 font-light">GH₵ {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans text-sm text-zinc-400 font-light">Delivery</span>
                        <span className="font-sans text-sm text-zinc-600 dark:text-zinc-300 font-light">GH₵ {DELIVERY_FEE}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <span className="font-sans text-sm text-zinc-700 dark:text-zinc-200">Total</span>
                        <span className="font-serif text-xl text-zinc-900 dark:text-zinc-50 font-light">GH₵ {total.toLocaleString()}</span>
                      </div>
                    </div>

                    <button onClick={handleCheckout} disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans font-medium text-[11px] tracking-[0.18em] uppercase py-4 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed group">
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock size={12} />
                          Pay GH₵ {total.toLocaleString()} with MoMo
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>

                    <p className="font-sans text-[9px] text-zinc-300 dark:text-zinc-600 font-light text-center mt-3">
                      Payments processed securely by Paystack
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
