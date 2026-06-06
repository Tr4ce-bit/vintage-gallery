"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, User, UserPlus, ShoppingBag, CreditCard, Smartphone, Building2, CloudRain, Truck, Zap } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/Skeleton";

type MomoNetwork    = "MTN" | "TELECEL" | "AIRTELTIGO";
type PaymentMethod  = "momo" | "card" | "bank_transfer";
type DeliveryType   = "standard" | "sameday";

interface DeliveryFees {
  standard:           number;
  sameday:            number;
  samedayBase:        number;
  rainSurcharge:      number;
  isRaining:          boolean;
  weatherDescription: string;
  weatherIcon:        string;
}

// ── Real MNO brand logos (SVG) ──────────────────────────────────────────────
function MtnLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="12" fill="#FFCC00" />
      {/* MTN wordmark */}
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif" fontSize="22" fontWeight="900"
        fill="#1A1A1A" letterSpacing="-0.5">
        MTN
      </text>
    </svg>
  );
}

function AirtelTigoLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="12" fill="#E4001B" />
      {/* airtel half */}
      <text x="50%" y="38%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="white">
        airtel
      </text>
      {/* tigo half with blue strip */}
      <rect x="0" y="44" width="80" height="36" rx="0" fill="#003087" />
      <rect x="0" y="44" width="80" height="1" fill="white" opacity="0.3" />
      <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="white">
        tigo
      </text>
    </svg>
  );
}

function TelecelLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="12" fill="#E4002B" />
      {/* Telecel speech-bubble dot */}
      <circle cx="40" cy="26" r="10" fill="white" />
      <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700" fill="white" letterSpacing="0.5">
        telecel
      </text>
    </svg>
  );
}

const NETWORKS: { id: MomoNetwork; label: string; Logo: React.FC<{ size?: number }> }[] = [
  { id: "MTN",        label: "MTN MoMo",   Logo: MtnLogo        },
  { id: "TELECEL",    label: "Telecel",     Logo: TelecelLogo    },
  { id: "AIRTELTIGO", label: "AirtelTigo", Logo: AirtelTigoLogo },
];

// ── Card-scheme logos ───────────────────────────────────────────────────────
function VisaLogo() {
  return (
    <svg width="52" height="32" viewBox="0 0 52 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="32" rx="6" fill="#1A1F71"/>
      <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize="14" fontWeight="900"
        fill="#F7B600" fontStyle="italic" letterSpacing="1">
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="52" height="32" viewBox="0 0 52 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="32" rx="6" fill="#252525"/>
      <circle cx="20" cy="16" r="9" fill="#EB001B"/>
      <circle cx="32" cy="16" r="9" fill="#F79E1B"/>
      <path d="M26 9.3A9 9 0 0 1 31.2 16 9 9 0 0 1 26 22.7 9 9 0 0 1 20.8 16 9 9 0 0 1 26 9.3z" fill="#FF5F00"/>
    </svg>
  );
}

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo",
  "Ahafo", "Bono East", "North East", "Oti", "Savannah", "Western North",
];

// "null" = haven't chosen yet, "guest" = continue without account
type AuthMode = null | "guest";

const inputCls = "w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors";

export default function CheckoutPage() {
  const router                            = useRouter();
  const { items, totalPrice, clearCart }  = useCartStore();
  const { user, isLoaded, isSignedIn }    = useAuth();

  const subtotal = totalPrice();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("standard");
  const [fees, setFees] = useState<DeliveryFees>({
    standard: 30, sameday: 50, samedayBase: 50,
    rainSurcharge: 0, isRaining: false,
    weatherDescription: "", weatherIcon: "01d",
  });
  const [feesLoading, setFeesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/delivery-fee")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setFees(d); })
      .catch(() => {})
      .finally(() => setFeesLoading(false));
  }, []);

  const deliveryFee = deliveryType === "sameday" ? fees.sameday : fees.standard;
  const total       = subtotal + deliveryFee;

  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const [form, setForm] = useState({
    fullName: "",
    email:    "",
    phone:    "",
    region:   "",
    city:     "",
    address:  "",
    notes:    "",
  });

  useEffect(() => {
    if (isSignedIn && user?.email) {
      setForm(f => ({ ...f, email: user.email! }));
    }
  }, [isSignedIn, user]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [network,       setNetwork]       = useState<MomoNetwork | "">("");
  const [momoPhone,     setMomoPhone]     = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCheckout = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.region || !form.city || !form.address) {
      setError("Please fill in all required delivery details (name, email, phone, region, city, address).");
      return;
    }
    if (paymentMethod === "momo" && (!network || !momoPhone)) {
      setError("Please select your MoMo network and enter your MoMo phone number.");
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
          email:         form.email,
          amountGHS:     total,
          deliveryType,
          paymentMethod,
          momoNetwork:   paymentMethod === "momo" ? network   : undefined,
          momoPhone:     paymentMethod === "momo" ? momoPhone : undefined,
          cartItems:     items,
          deliveryInfo: {
            fullName: form.fullName,
            phone:    form.phone,
            region:   form.region,
            city:     form.city,
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
                      + GH₵ {deliveryFee} delivery · Total GH₵ {total.toLocaleString()}
                    </p>
                  </div>
                  <ShoppingBag size={16} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                </div>

                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  How would you like to continue?
                </p>

                <div className="space-y-3">
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

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600">or</span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  </div>

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

            {/* ── Checkout Form ──────────────────────────────────────────────── */}
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

                  {/* ── Delivery Type ──────────────────────────────────── */}
                  <section>
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      01 · Delivery Method
                    </p>

                    {/* Rain alert banner */}
                    {fees.isRaining && !feesLoading && (
                      <div className="mb-4 flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-4 py-3">
                        <CloudRain size={15} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="font-sans text-[11px] text-blue-700 dark:text-blue-300 font-light leading-relaxed">
                          It&apos;s raining in Accra right now ({fees.weatherDescription}). Same-day delivery includes a GH₵ {fees.rainSurcharge} rain surcharge.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {/* Standard */}
                      <button
                        type="button"
                        onClick={() => setDeliveryType("standard")}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                          deliveryType === "standard"
                            ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                        }`}
                      >
                        <Truck size={16} className={`mt-0.5 shrink-0 ${deliveryType === "standard" ? "opacity-100" : "text-zinc-400"}`} />
                        <div>
                          <p className="font-sans text-xs font-medium">Standard Delivery</p>
                          <p className={`font-sans text-[10px] mt-0.5 ${deliveryType === "standard" ? "opacity-70" : "text-zinc-400"}`}>
                            2 – 4 business days
                          </p>
                          <div className="font-sans text-sm font-semibold mt-1.5">
                            {feesLoading
                              ? <Skeleton className="h-4 w-16 inline-block" />
                              : `GH₵ ${fees.standard}`}
                          </div>
                        </div>
                      </button>

                      {/* Same-Day */}
                      <button
                        type="button"
                        onClick={() => setDeliveryType("sameday")}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all relative overflow-hidden ${
                          deliveryType === "sameday"
                            ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                        }`}
                      >
                        <Zap size={16} className={`mt-0.5 shrink-0 ${deliveryType === "sameday" ? "opacity-100" : "text-zinc-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-medium">Same-Day Delivery</p>
                          <p className={`font-sans text-[10px] mt-0.5 ${deliveryType === "sameday" ? "opacity-70" : "text-zinc-400"}`}>
                            Within Accra · Order by 1pm
                          </p>
                          <div className="font-sans text-sm font-semibold mt-1.5">
                            {feesLoading
                              ? <Skeleton className="h-4 w-16 inline-block" />
                              : `GH₵ ${fees.sameday}`}
                            {fees.isRaining && !feesLoading && (
                              <span className={`ml-1.5 font-sans text-[9px] font-normal ${
                                deliveryType === "sameday" ? "opacity-70" : "text-blue-500"
                              }`}>
                                incl. +GH₵ {fees.rainSurcharge} rain
                              </span>
                            )}
                          </div>
                        </div>
                        {fees.isRaining && !feesLoading && (
                          <CloudRain size={12} className={`shrink-0 self-start mt-1 ${deliveryType === "sameday" ? "opacity-60" : "text-blue-400"}`} />
                        )}
                      </button>
                    </div>
                  </section>

                  {/* Delivery section */}
                  <section>
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      02 · Delivery Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Full Name */}
                      <div className="sm:col-span-2">
                        <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input type="text" value={form.fullName} onChange={set("fullName")}
                          placeholder="Kwame Asante" required
                          autoComplete="off" autoCorrect="off" spellCheck={false}
                          className={inputCls} />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input type="email" value={form.email} onChange={set("email")}
                          placeholder="you@email.com" required
                          autoComplete="off" autoCorrect="off" spellCheck={false}
                          className={inputCls} />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                          Phone Number <span className="text-red-400">*</span>
                        </label>
                        <input type="tel" value={form.phone} onChange={set("phone")}
                          placeholder="0241234567" required
                          autoComplete="off"
                          className={inputCls} />
                      </div>

                      {/* Region */}
                      <div>
                        <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                          Region <span className="text-red-400">*</span>
                        </label>
                        <select value={form.region} onChange={set("region")} required
                          className={`${inputCls} appearance-none cursor-pointer`}>
                          <option value="" disabled>Select region…</option>
                          {GHANA_REGIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      {/* City */}
                      <div>
                        <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                          City / Town <span className="text-red-400">*</span>
                        </label>
                        <input type="text" value={form.city} onChange={set("city")}
                          placeholder="Accra" required
                          autoComplete="off" autoCorrect="off" spellCheck={false}
                          className={inputCls} />
                      </div>

                      {/* Address */}
                      <div className="sm:col-span-2">
                        <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                          Street Address <span className="text-red-400">*</span>
                        </label>
                        <input type="text" value={form.address} onChange={set("address")}
                          placeholder="12 Oxford Street, East Legon" required
                          autoComplete="off" autoCorrect="off" spellCheck={false}
                          className={inputCls} />
                      </div>

                      {/* Notes */}
                      <div className="sm:col-span-2">
                        <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                          Delivery Notes <span className="text-zinc-300">(Optional)</span>
                        </label>
                        <textarea value={form.notes} onChange={set("notes")}
                          placeholder="Any instructions for delivery…" rows={2}
                          autoComplete="off" spellCheck={false}
                          className={`${inputCls} resize-none`} />
                      </div>

                      <p className="sm:col-span-2 font-sans text-[9px] text-zinc-300 dark:text-zinc-600 font-light">
                        Fields marked <span className="text-red-400">*</span> are required.
                        You can update your delivery address up to 15 minutes after placing your order.
                      </p>
                    </div>
                  </section>

                  {/* Payment section */}
                  <section>
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      02 · Payment Method
                    </p>

                    {/* Method tabs */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {([
                        { id: "momo",          label: "Mobile Money", Icon: Smartphone   },
                        { id: "card",          label: "Card",         Icon: CreditCard   },
                        { id: "bank_transfer", label: "Bank Transfer", Icon: Building2   },
                      ] as const).map(({ id, label, Icon }) => (
                        <button key={id} type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={`rounded-xl border py-3 px-2 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                            paymentMethod === id
                              ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800 shadow-sm"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                          }`}>
                          <Icon size={18} className={paymentMethod === id ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"} />
                          <span className={`font-sans text-[9px] tracking-[0.05em] font-medium ${paymentMethod === id ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Mobile Money */}
                    <AnimatePresence mode="wait">
                      {paymentMethod === "momo" && (
                        <motion.div key="momo"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}>
                          <div className="grid grid-cols-3 gap-3 mb-5">
                            {NETWORKS.map(({ id, label, Logo }) => (
                              <button key={id} type="button" onClick={() => setNetwork(id)}
                                className={`rounded-2xl border py-4 px-2 flex flex-col items-center gap-2.5 transition-all duration-200 ${
                                  network === id
                                    ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800 shadow-sm"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                                }`}>
                                <Logo size={44} />
                                <span className="font-sans text-[10px] tracking-[0.08em] text-zinc-600 dark:text-zinc-300 font-medium">{label}</span>
                              </button>
                            ))}
                          </div>
                          <div>
                            <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-light block mb-2">
                              MoMo Phone Number
                            </label>
                            <input type="tel" value={momoPhone}
                              onChange={e => setMomoPhone(e.target.value)}
                              placeholder="0241234567"
                              autoComplete="off"
                              className={inputCls} />
                            <p className="font-sans text-[9px] text-zinc-300 dark:text-zinc-600 font-light mt-2">
                              You will receive a push notification on your phone to approve the payment.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Card */}
                      {paymentMethod === "card" && (
                        <motion.div key="card"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}>
                          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                              <VisaLogo />
                              <MastercardLogo />
                            </div>
                            <p className="font-sans text-sm text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
                              Pay securely with your debit or credit card. You will be redirected to
                              Paystack&apos;s secure payment page to enter your card details.
                            </p>
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Lock size={11} />
                              <span className="font-sans text-[10px] tracking-[0.1em] font-light">
                                256-bit SSL encryption · PCI DSS compliant
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Bank Transfer */}
                      {paymentMethod === "bank_transfer" && (
                        <motion.div key="bank_transfer"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}>
                          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4">
                            <p className="font-sans text-sm text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
                              Pay via direct bank transfer. After clicking Pay, you will receive a
                              unique account number to transfer to. Your order is confirmed once
                              payment is received.
                            </p>
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Lock size={11} />
                              <span className="font-sans text-[10px] tracking-[0.1em] font-light">
                                Processed securely by Paystack
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Accepted payments strip */}
                    <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-zinc-300 dark:text-zinc-600 font-light mb-3">
                        We accept
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <MtnLogo size={28} />
                        <TelecelLogo size={28} />
                        <AirtelTigoLogo size={28} />
                        <span className="w-px h-5 bg-zinc-100 dark:bg-zinc-800 mx-1" />
                        <VisaLogo />
                        <MastercardLogo />
                      </div>
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
                      <div className="flex justify-between items-start">
                        <span className="font-sans text-sm text-zinc-400 font-light">
                          {deliveryType === "sameday" ? "Same-Day Delivery" : "Standard Delivery"}
                        </span>
                        <div className="text-right">
                          <span className="font-sans text-sm text-zinc-600 dark:text-zinc-300 font-light">
                            {feesLoading
                              ? <Skeleton className="h-4 w-14 inline-block align-middle" />
                              : `GH₵ ${deliveryFee}`}
                          </span>
                          {fees.isRaining && deliveryType === "sameday" && !feesLoading && (
                            <p className="font-sans text-[9px] text-blue-500 mt-0.5 flex items-center justify-end gap-1">
                              <CloudRain size={9} /> incl. GH₵ {fees.rainSurcharge} rain
                            </p>
                          )}
                        </div>
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
                          Pay GH₵ {total.toLocaleString()}
                          {paymentMethod === "momo"          && " · Mobile Money"}
                          {paymentMethod === "card"          && " · Card"}
                          {paymentMethod === "bank_transfer" && " · Bank Transfer"}
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
