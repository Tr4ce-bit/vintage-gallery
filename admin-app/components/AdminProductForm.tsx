"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

const ALL_SIZES = ["XS","S","M","L","XL","XXL"];
const BADGES    = ["","Featured","New","Limited","Sold Out"];

interface ProductData {
  id?: string; name: string; slug: string; collection: string;
  basePrice: string; imageUrl: string; images: string; color: string;
  sizes: string[]; badge: string; featured: boolean;
  description: string; details: string; stock: string; isActive: boolean;
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Props {
  initial?: Partial<ProductData> & { id?: string };
  mode: "create" | "edit";
}

export default function AdminProductForm({ initial, mode }: Props) {
  const router = useRouter();
  const { getAccessToken } = useAuth();
  const [form, setForm] = useState<ProductData>({
    name: "", slug: "", collection: "", basePrice: "",
    imageUrl: "", images: "", color: "White", sizes: ALL_SIZES,
    badge: "", featured: false, description: "", details: "", stock: "100", isActive: true,
    ...initial,
  });
  const [error,    setError]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (mode === "create" && form.name) {
      setForm(f => ({ ...f, slug: toSlug(f.name) }));
    }
  }, [form.name, mode]);

  function set(key: keyof ProductData, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function toggleSize(s: string) {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);

    const token   = await getAccessToken();
    const payload = {
      name:        form.name,
      slug:        form.slug,
      collection:  form.collection,
      basePrice:   Number(form.basePrice),
      imageUrl:    form.imageUrl,
      images:      [form.imageUrl, ...form.images.split(",").map(s => s.trim()).filter(Boolean)],
      color:       form.color,
      sizes:       form.sizes,
      badge:       form.badge || null,
      featured:    form.featured,
      description: form.description,
      details:     form.details.split("\n").map(s => s.trim()).filter(Boolean),
      stock:       Number(form.stock),
      isActive:    form.isActive,
    };

    const url    = mode === "create" ? apiUrl("/api/admin/products") : apiUrl(`/api/admin/products/${initial?.id}`);
    const method = mode === "create" ? "POST" : "PATCH";

    const res  = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? "Failed to save product"); return; }
    router.push("/products");
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    const token = await getAccessToken();
    await fetch(apiUrl(`/api/admin/products/${initial.id}`), {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push("/products");
  }

  const labelCls = "block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5";
  const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-2.5 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Product Name *</label>
          <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} required placeholder="All Eyez On Me" />
        </div>
        <div>
          <label className={labelCls}>Slug *</label>
          <input className={inputCls} value={form.slug} onChange={e => set("slug", toSlug(e.target.value))} required placeholder="all-eyez-tee" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Collection *</label>
          <input className={inputCls} value={form.collection} onChange={e => set("collection", e.target.value)} required placeholder="Icons Series" />
        </div>
        <div>
          <label className={labelCls}>Price (GHS) *</label>
          <input className={inputCls} type="number" min="0" step="0.01" value={form.basePrice} onChange={e => set("basePrice", e.target.value)} required placeholder="300" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Primary Image URL *</label>
        <input className={inputCls} value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} required placeholder="/asset/product-tupac.jpg" />
      </div>

      <div>
        <label className={labelCls}>Additional Image URLs (comma-separated)</label>
        <input className={inputCls} value={form.images} onChange={e => set("images", e.target.value)} placeholder="/asset/product-tupac-back.jpg, ..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Base Color</label>
          <input className={inputCls} value={form.color} onChange={e => set("color", e.target.value)} placeholder="White" />
        </div>
        <div>
          <label className={labelCls}>Stock</label>
          <input className={inputCls} type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Available Sizes</label>
        <div className="flex gap-2 flex-wrap">
          {ALL_SIZES.map(s => (
            <button key={s} type="button" onClick={() => toggleSize(s)}
              className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-all ${
                form.sizes.includes(s)
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Badge</label>
          <select className={inputCls} value={form.badge} onChange={e => set("badge", e.target.value)}>
            {BADGES.map(b => <option key={b} value={b}>{b || "None"}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className={labelCls}>Featured</label>
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="w-4 h-4 rounded border-zinc-300 accent-zinc-900" />
            <span className="font-sans text-sm text-zinc-600">Show as featured</span>
          </label>
        </div>
        <div className="flex flex-col">
          <label className={labelCls}>Active</label>
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-zinc-300 accent-zinc-900" />
            <span className="font-sans text-sm text-zinc-600">Visible in store</span>
          </label>
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea className={`${inputCls} h-24 resize-none`} value={form.description} onChange={e => set("description", e.target.value)} placeholder="The story behind this piece…" />
      </div>

      <div>
        <label className={labelCls}>Product Details (one per line)</label>
        <textarea className={`${inputCls} h-28 resize-none`} value={form.details} onChange={e => set("details", e.target.value)}
          placeholder={"100% heavyweight cotton (250gsm)\nOversized unisex cut\nMade in Ghana"} />
      </div>

      {error && (
        <p className="font-sans text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        {mode === "edit" && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="px-5 h-11 border border-red-200 text-red-400 hover:bg-red-50 rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-40">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
