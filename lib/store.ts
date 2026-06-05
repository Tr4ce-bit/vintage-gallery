"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trackEvent } from "./events";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { productId, size } = item;
        const existing = get().items.find(
          (i) => i.productId === productId && i.size === size
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === productId && i.size === size
                ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: item.quantity ?? 1 }],
          }));
        }
        // Custom-studio products use synthetic ids prefixed with "custom-";
        // send null for productId so analytics doesn't try to join them.
        trackEvent({
          eventType: "CART_ADD",
          productId: productId.startsWith("custom-") ? null : productId,
          metadata:  { size, color: item.color, quantity: item.quantity ?? 1 },
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        }));
        trackEvent({
          eventType: "CART_REMOVE",
          productId: productId.startsWith("custom-") ? null : productId,
          metadata:  { size },
        });
      },

      updateQuantity: (productId, size, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "vg-cart" }
  )
);
