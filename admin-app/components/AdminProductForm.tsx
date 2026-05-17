"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, X, ImagePlus } from "lucide-react";
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

// ─── Image Uploader ───────────────────────────────────────────────────────────

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
  size?: "large" | "small";
  getToken: () => Promise<string | null>;
}

function ImageUploader({ value, onChange, label, required, size = "large", getToken }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);   // 0-100
  const [error,     setError]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setProgress(0);
    setUploading(true);

    const token = await getToken();
    const form  = new FormData();
    form.append("file", file);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress (0 → 100)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            setProgress(100);
            onChange(data.url);
            resolve();
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error ?? "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error — please try again"));

        xhr.open("POST", apiUrl("/api/admin/upload"));
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(form);
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const isLarge = size === "large";

  return (
    <div>
      {label && (
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-2">
          {label}{required && " *"}
        </p>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 transition-all overflow-hidden
          ${value
            ? "border-zinc-200 hover:border-zinc-400"
            : "border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100"
          }
          ${isLarge ? "w-full aspect-[4/3]" : "w-full aspect-square"}
        `}
      >
        {/* Preview */}
        {value && (
          <Image
            src={value}
            alt="Product photo"
            fill
            className="object-cover object-center"
            unoptimized
          />
        )}

        {/* Upload overlay with progress bar */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 gap-3 px-5">
            {isLarge ? (
              <>
                {/* Percentage */}
                <p className="font-sans text-2xl font-light text-zinc-700 tabular-nums">
                  {progress}%
                </p>
                {/* Bar track */}
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400">
                  Uploading…
                </p>
              </>
            ) : (
              <>
                {/* Compact bar for small slots */}
                <p className="font-sans text-xs text-zinc-500 tabular-nums">{progress}%</p>
                <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!value && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-300">
            <Camera size={isLarge ? 36 : 22} strokeWidth={1.2} />
            {isLarge && (
              <p className="font-sans text-xs text-zinc-400 text-center px-4">
                Tap to add photo
              </p>
            )}
          </div>
        )}

        {/* Hover overlay for existing image */}
        {value && !uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all z-10">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
              <Camera size={isLarge ? 24 : 18} className="text-white" />
              {isLarge && (
                <p className="font-sans text-[10px] text-white uppercase tracking-widest">Change</p>
              )}
            </div>
          </div>
        )}

        {/* Remove button */}
        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <X size={12} className="text-white" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="font-sans text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

// ─── Multi-image uploader (additional photos) ──────────────────────────────────

interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  getToken: () => Promise<string | null>;
}

function MultiImageUploader({ values, onChange, max = 4, getToken }: MultiImageUploaderProps) {
  function handleChange(index: number, url: string) {
    const next = [...values];
    if (url === "") {
      next.splice(index, 1);
    } else {
      next[index] = url;
    }
    onChange(next);
  }

  // Slots: existing images + one empty slot (if under max)
  const slots = values.length < max
    ? [...values, ""]
    : values;

  return (
    <div>
      <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-2">
        Additional Photos <span className="normal-case tracking-normal text-zinc-300">(optional)</span>
      </p>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((url, i) => (
          <ImageUploader
            key={i}
            value={url}
            onChange={(newUrl) => handleChange(i, newUrl)}
            label=""
            size="small"
            getToken={getToken}
          />
        ))}
        {/* Fill remaining empty slots to always show 4 boxes */}
        {Array.from({ length: Math.max(0, 4 - slots.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50 flex items-center justify-center"
          >
            <ImagePlus size={16} className="text-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function AdminProductForm({ initial, mode }: Props) {
  const router = useRouter();
  const { getAccessToken } = useAuth();
  const [form, setForm] = useState<ProductData>({
    name: "", slug: "", collection: "", basePrice: "",
    imageUrl: "", images: "", color: "White", sizes: ALL_SIZES,
    badge: "", featured: false, description: "", details: "", stock: "100", isActive: true,
    ...initial,
  });
  const [additionalImages, setAdditionalImages] = useState<string[]>(() => {
    if (initial?.images) {
      return initial.images.split(",").map(s => s.trim()).filter(Boolean);
    }
    return [];
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

    if (!form.imageUrl) {
      setError("Please add a primary product photo");
      setSaving(false);
      return;
    }

    const token   = await getAccessToken();
    const allImages = [form.imageUrl, ...additionalImages.filter(Boolean)];
    const payload = {
      name:        form.name,
      slug:        form.slug,
      collection:  form.collection,
      basePrice:   Number(form.basePrice),
      imageUrl:    form.imageUrl,
      images:      allImages,
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

      {/* ── Photos ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50 rounded-2xl p-4 space-y-4">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-light">
          Product Photos
        </p>
        <ImageUploader
          value={form.imageUrl}
          onChange={(url) => set("imageUrl", url)}
          label="Main Photo"
          required
          size="large"
          getToken={getAccessToken}
        />
        <MultiImageUploader
          values={additionalImages}
          onChange={setAdditionalImages}
          max={4}
          getToken={getAccessToken}
        />
      </div>

      {/* ── Core details ───────────────────────────────────────────── */}
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

      {/* ── Sizes ─────────────────────────────────────────────────── */}
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

      {/* ── Flags ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

      {/* ── Description & Details ─────────────────────────────────── */}
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
          className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "Saving…" : mode === "create" ? "Add Product" : "Save Changes"}
        </button>
        {mode === "edit" && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="px-5 h-12 border border-red-200 text-red-400 hover:bg-red-50 rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-40">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
