"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();

  const DELIVERY_FEE = 30; // GHS
  const subtotal     = totalPrice();
  const total        = subtotal + (subtotal > 0 ? DELIVERY_FEE : 0);

  return (
    <>
      <main className="min-h-screen bg-white pt-[60px]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-10 border-b border-zinc-100 pb-8">
            <div>
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">
                {totalItems()} {totalItems() === 1 ? "Item" : "Items"}
              </p>
              <h1
                className="font-serif text-zinc-900 leading-none"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}
              >
                Your Cart.
              </h1>
            </div>
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          {items.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <ShoppingBag size={40} strokeWidth={1} className="text-zinc-200 mb-6" />
              <p className="font-serif text-zinc-400 text-2xl font-light mb-2">Your cart is empty.</p>
              <p className="font-sans text-sm text-zinc-300 font-light mb-8">Looks like you haven&apos;t added anything yet.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-zinc-900 text-white font-sans text-[10px] tracking-[0.2em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-700 transition-colors"
              >
                Shop the Drop <ArrowRight size={12} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-0">
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.div
                      key={`${item.productId}-${item.size}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
                      className="flex gap-5 py-6 border-b border-zinc-100 last:border-b-0"
                    >
                      {/* Image */}
                      <Link href={`/product/${item.slug}`} className="relative w-24 h-28 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover object-center" />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-300 font-light mb-1">{item.collection}</p>
                        <Link href={`/product/${item.slug}`} className="font-serif text-zinc-900 text-lg font-light hover:text-zinc-600 transition-colors block leading-tight mb-1">
                          {item.name}
                        </Link>
                        <p className="font-sans text-[10px] text-zinc-400 font-light mb-4">
                          Size: {item.size} · Color: {item.color}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Qty control */}
                          <div className="flex items-center border border-zinc-200 rounded-full overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-sans text-xs text-zinc-700">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-sans text-sm text-zinc-700 font-light">
                              GH₵ {(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeItem(item.productId, item.size)}
                              className="text-zinc-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl bg-zinc-50 border border-zinc-100 p-6">
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium mb-6">
                    Order Summary
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="font-sans text-sm text-zinc-400 font-light">Subtotal ({totalItems()} items)</span>
                      <span className="font-sans text-sm text-zinc-700 font-light">GH₵ {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-sm text-zinc-400 font-light">Delivery (Accra)</span>
                      <span className="font-sans text-sm text-zinc-700 font-light">GH₵ {DELIVERY_FEE}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-sans text-sm text-zinc-700">Total</span>
                      <span className="font-serif text-xl text-zinc-900 font-light">GH₵ {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2.5 bg-zinc-900 text-white font-sans font-medium text-[11px] tracking-[0.18em] uppercase w-full py-4 rounded-full hover:bg-zinc-700 transition-colors group"
                  >
                    Proceed to Checkout
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <p className="font-sans text-[9px] text-zinc-300 font-light text-center mt-4">
                    Secured by Paystack · MTN MoMo · Telecel · AirtelTigo
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
