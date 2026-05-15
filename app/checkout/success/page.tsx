"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Package } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Footer from "@/components/Footer";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params                    = use(searchParams);
  const reference                 = params.reference ?? params.trxref ?? "";
  const [status, setStatus]       = useState<"verifying" | "success" | "failed">("verifying");
  const [orderRef, setOrderRef]   = useState("");
  const clearCart                 = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (!reference) { setStatus("failed"); return; }

    const verify = async () => {
      try {
        const res  = await fetch(`/api/paystack?reference=${reference}`);
        const data = await res.json();

        if (res.ok && data.verified) {
          setOrderRef(reference);
          setStatus("success");
          clearCart();
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };

    verify();
  }, [reference, clearCart]);

  return (
    <>
      <main className="min-h-screen bg-white pt-[60px] flex items-center justify-center px-5">
        <div className="w-full max-w-lg text-center py-20">
          {status === "verifying" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <span className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
              <p className="font-sans text-sm text-zinc-400 font-light tracking-[0.1em]">Verifying your payment…</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-8"
              >
                <CheckCircle size={36} strokeWidth={1.5} className="text-zinc-900" />
              </motion.div>

              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-3">
                Order Confirmed
              </p>
              <h1
                className="font-serif text-zinc-900 leading-[1.0] mb-4"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300 }}
              >
                You&apos;re all set.
              </h1>
              <p className="font-sans text-sm text-zinc-400 font-light leading-relaxed max-w-sm mb-4">
                Your payment was confirmed and your order is being prepared. You&apos;ll receive an SMS update when it ships.
              </p>

              {orderRef && (
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-6 py-4 mb-10 inline-block">
                  <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-300 font-light mb-1">
                    Reference
                  </p>
                  <p className="font-mono text-sm text-zinc-600">{orderRef}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-zinc-900 text-white font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-700 transition-colors group"
                >
                  Continue Shopping
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <div className="inline-flex items-center gap-2 border border-zinc-200 text-zinc-500 font-sans text-[10px] tracking-[0.15em] uppercase px-6 py-3.5 rounded-full">
                  <Package size={12} />
                  48–72 hr Delivery
                </div>
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-8">
                <span className="text-red-400 text-3xl font-serif font-light">✕</span>
              </div>
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-3">
                Payment Issue
              </p>
              <h1
                className="font-serif text-zinc-900 leading-[1.0] mb-4"
                style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300 }}
              >
                Payment not confirmed.
              </h1>
              <p className="font-sans text-sm text-zinc-400 font-light leading-relaxed max-w-sm mb-10">
                We couldn&apos;t verify your payment. Your cart has been saved — please try again or contact us if the issue persists.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Link href="/checkout" className="inline-flex items-center gap-2 bg-zinc-900 text-white font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-700 transition-colors">
                  Try Again
                </Link>
                <Link href="/#contact" className="inline-flex items-center gap-2 border border-zinc-200 text-zinc-500 font-sans text-[10px] tracking-[0.15em] uppercase px-6 py-3.5 rounded-full hover:border-zinc-400 transition-colors">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
