"use client";

import AdminProductForm from "@/components/AdminProductForm";

export default function NewProductPage() {
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Catalog</p>
      <h1 className="font-serif text-zinc-900 mb-8" style={{ fontSize: "2rem", fontWeight: 300 }}>Add Product</h1>
      <AdminProductForm mode="create" />
    </div>
  );
}
