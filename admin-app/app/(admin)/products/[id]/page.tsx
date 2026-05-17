"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";
import AdminProductForm from "@/components/AdminProductForm";

interface ProductData {
  id: string; name: string; slug: string; collection: string;
  basePrice: string; imageUrl: string; images: string; color: string;
  sizes: string[]; badge: string; featured: boolean;
  description: string; details: string; stock: string; isActive: boolean;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getAccessToken } = useAuth();
  const [initial,  setInitial]  = useState<ProductData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getAccessToken();
      const res   = await fetch(apiUrl(`/api/admin/products/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      const p    = data.product;
      const additionalImages = (p.images as string[])
        .filter((img: string) => img !== p.imageUrl)
        .join(", ");
      setInitial({
        id:          p.id,
        name:        p.name,
        slug:        p.slug,
        collection:  p.collection,
        basePrice:   String(p.basePrice),
        imageUrl:    p.imageUrl,
        images:      additionalImages,
        color:       p.color,
        sizes:       p.sizes,
        badge:       p.badge ?? "",
        featured:    p.featured,
        description: p.description ?? "",
        details:     Array.isArray(p.details) ? p.details.join("\n") : "",
        stock:       String(p.stock),
        isActive:    p.isActive,
      });
      setLoading(false);
    }
    load();
  }, [id]); // eslint-disable-line

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
    </div>
  );
  if (notFound) return (
    <div className="px-4 py-6 sm:px-8 sm:py-8"><p className="font-sans text-sm text-zinc-400">Product not found.</p></div>
  );

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <Link href="/products" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-300 hover:text-zinc-600 transition-colors mb-8">
        <ArrowLeft size={12} /> Products
      </Link>
      <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Catalog</p>
      <h1 className="font-serif text-zinc-900 mb-8" style={{ fontSize: "2rem", fontWeight: 300 }}>Edit Product</h1>
      <AdminProductForm mode="edit" initial={initial!} />
    </div>
  );
}
