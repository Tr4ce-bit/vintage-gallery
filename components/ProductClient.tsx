"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowLeft, Check, ChevronDown, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store";
import { trackEvent } from "@/lib/events";
import Footer from "@/components/Footer";
import type { Product } from "@/lib/products";

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductClient({ product, related }: Props) {
  const { isSignedIn }                  = useAuth();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty]                   = useState(1);
  const [added, setAdded]               = useState(false);
  const [wishlisted, setWishlisted]     = useState(false);
  const [sizeError, setSizeError]       = useState(false);
  const [detailsOpen, setDetailsOpen]   = useState(false);
  const [authToast, setAuthToast]       = useState(false);
  const addItem                         = useCartStore((s) => s.addItem);

  // Per-size stock helpers
  const hasSizeStock = !!(product.sizeStock && Object.keys(product.sizeStock).length > 0);
  const isSizeOutOfStock = (s: string): boolean => {
    if (hasSizeStock) return (product.sizeStock![s] ?? 0) <= 0;
    return !!(product.stock !== undefined && product.stock <= 0);
  };
  const isProductOutOfStock = hasSizeStock
    ? product.sizes.every(s => isSizeOutOfStock(s))
    : (product.stock !== undefined && product.stock <= 0);
  const sizeStockLabel = (s: string): string | null => {
    if (!hasSizeStock) return null;
    const n = product.sizeStock![s] ?? 0;
    if (n <= 0)  return "Out of stock";
    if (n <= 3)  return `Only ${n} left`;
    if (n <= 10) return "Low stock";
    return null;
  };

  // VIEW event on mount; TIME_SPENT (via sendBeacon) when the page is left.
  useEffect(() => {
    trackEvent({ eventType: "VIEW", productId: product.id });
    const start = Date.now();
    return () => {
      const durationSec = Math.round((Date.now() - start) / 1000);
      if (durationSec > 0 && durationSec < 7200) {
        trackEvent(
          { eventType: "TIME_SPENT", productId: product.id, durationSec },
          { beacon: true },
        );
      }
    };
  }, [product.id]);

  const handleWishlist = () => {
    if (!isSignedIn) {
      setAuthToast(true);
      setTimeout(() => setAuthToast(false), 3000);
      return;
    }
    setWishlisted((w) => {
      const next = !w;
      trackEvent({
        eventType: next ? "WISHLIST_ADD" : "WISHLIST_REMOVE",
        productId: product.id,
      });
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addItem({
      productId:  product.id,
      slug:       product.slug,
      name:       product.name,
      collection: product.collection,
      price:      product.price,
      image:      product.image,
      size:       selectedSize,
      color:      product.color,
      quantity:   qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
        {/* Back */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-8 pb-0">
          <Link href="/shop"
            className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Shop
          </Link>
        </div>

        {/* Product layout */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 font-sans text-[9px] tracking-[0.15em] uppercase font-medium bg-white text-zinc-900 px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
            {isProductOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="font-sans text-[11px] tracking-[0.25em] uppercase font-medium bg-white text-zinc-900 px-5 py-2 rounded-full">
                  Sold Out
                </span>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
              {product.collection}
            </p>
            <h1
              className="font-serif text-zinc-900 dark:text-zinc-50 leading-[1.0] mb-4"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", fontWeight: 300 }}
            >
              {product.name}
            </h1>
            <p className="font-serif text-zinc-400 text-2xl font-light mb-8">
              GH₵ {product.price}
            </p>

            <p className="font-sans text-sm text-zinc-500 font-light leading-relaxed mb-10 max-w-sm">
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className={`font-sans text-[10px] tracking-[0.25em] uppercase font-light ${sizeError ? "text-red-400" : "text-zinc-400"}`}>
                  {sizeError ? "Please select a size" : "Select Size"}
                </p>
                <button className="font-sans text-[9px] tracking-[0.15em] uppercase text-zinc-300 hover:text-zinc-600 transition-colors underline underline-offset-2">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const oos   = isSizeOutOfStock(s);
                  const label = sizeStockLabel(s);
                  return (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <button
                        disabled={oos}
                        onClick={() => { if (!oos) { setSelectedSize(s); setSizeError(false); } }}
                        title={oos ? "Out of stock" : label ?? s}
                        className={`font-sans text-[11px] w-11 h-11 rounded-full border transition-all duration-200 relative ${
                          oos
                            ? "border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-not-allowed line-through"
                            : selectedSize === s
                              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        {s}
                      </button>
                      {label && !oos && (
                        <span className="font-sans text-[8px] text-amber-500 tracking-tight whitespace-nowrap">{label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Qty + Add to cart */}
            {isProductOutOfStock ? (
              <div className="mb-6">
                <div className="w-full flex items-center justify-center gap-2.5 font-sans font-medium text-[11px] tracking-[0.18em] uppercase py-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed mb-3">
                  Out of Stock
                </div>
                <p className="font-sans text-[10px] text-zinc-400 dark:text-zinc-500 font-light text-center">
                  This item is currently unavailable. Check back soon or{" "}
                  <a href="https://wa.me/233503662903" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                    message us on WhatsApp
                  </a>{" "}
                  to be notified.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-full overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-11 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-light text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-sans text-sm text-zinc-700 dark:text-zinc-200">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="w-10 h-11 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-light text-lg"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2.5 font-sans font-medium text-[11px] tracking-[0.18em] uppercase py-3.5 rounded-full transition-all duration-300 bg-zinc-900 text-white hover:bg-zinc-700"
                  >
                    {added ? (
                      <><Check size={14} /> Added to Cart</>
                    ) : (
                      <><ShoppingBag size={14} /> Add to Cart</>
                    )}
                  </button>
                </div>

                {/* Checkout shortcut */}
                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-2 font-sans text-[11px] tracking-[0.18em] uppercase py-3.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 mb-8"
                >
                  View Cart &amp; Checkout
                </Link>
              </>
            )}

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className="flex items-center justify-center gap-2 font-sans text-[11px] tracking-[0.18em] uppercase py-3.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 mb-4 w-full"
            >
              <Heart size={13} className={wishlisted ? "fill-zinc-900 text-zinc-900" : ""} />
              {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>

            {/* Delivery note */}
            <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-300 font-light mb-8">
              🚚 Delivery across Accra &amp; Greater Accra · 48–72 hrs
            </p>

            {/* Product details accordion */}
            <div className="border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setDetailsOpen((o) => !o)}
                className="w-full flex items-center justify-between py-4 font-sans text-[10px] tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Product Details
                <ChevronDown size={14} className={`transition-transform duration-300 ${detailsOpen ? "rotate-180" : ""}`} />
              </button>
              {detailsOpen && (
                <ul className="pb-4 space-y-2">
                  {product.details.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-zinc-100 dark:border-zinc-800 py-16 px-5 md:px-8">
            <div className="max-w-7xl mx-auto">
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-8">
                You Might Also Like
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((p) => (
                  <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4" style={{ aspectRatio: "4/3" }}>
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-1">{p.collection}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-zinc-900 dark:text-zinc-100 text-xl font-light">{p.name}</span>
                      <span className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light">GH₵ {p.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />

      {/* Auth toast */}
      <AnimatePresence>
        {authToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 shadow-xl whitespace-nowrap"
          >
            <span className="font-sans text-sm text-zinc-300 font-light">Sign in to save to wishlist</span>
            <Link href="/sign-in"
              className="font-sans text-[10px] tracking-[0.15em] uppercase bg-white text-zinc-900 px-4 py-1.5 rounded-full font-medium hover:bg-zinc-100 transition-colors">
              Sign In
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
