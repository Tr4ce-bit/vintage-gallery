"use client";

import { useEffect, useRef, useState } from "react";
import {
  Save, RefreshCw, AlertCircle, CheckCircle2,
  Upload, Trash2, Eye, EyeOff, ImageIcon, Plus,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudioPrices {
  basePriceGHS:   number;
  designAddonGHS: number;
}

interface StudioDesign {
  id:        string;
  name:      string;
  imageUrl:  string;
  category:  string | null;
  isActive:  boolean;
  sortOrder: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudioSettingsPage() {
  const { getAccessToken } = useAuth();

  // ── Pricing state ──
  const [prices,  setPrices]  = useState<StudioPrices>({ basePriceGHS: 150, designAddonGHS: 30 });
  const [base,    setBase]    = useState("");
  const [addon,   setAddon]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState<"" | "saved" | "error">("");

  // ── Designs state ──
  const [designs,     setDesigns]     = useState<StudioDesign[]>([]);
  const [designsLoad, setDesignsLoad] = useState(true);
  const [newName,     setNewName]     = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [uploadErr,   setUploadErr]   = useState("");
  const [addStatus,   setAddStatus]   = useState<"" | "saved" | "error">("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPrices(); loadDesigns(); }, []); // eslint-disable-line

  // ── Pricing loaders ──────────────────────────────────────────────────────────

  async function loadPrices() {
    setLoading(true);
    const token = await getAccessToken();
    const res   = await fetch(apiUrl("/api/admin/studio"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: StudioPrices = await res.json();
      setPrices(data);
      setBase(String(data.basePriceGHS));
      setAddon(String(data.designAddonGHS));
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    const token = await getAccessToken();
    const res   = await fetch(apiUrl("/api/admin/studio"), {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ basePriceGHS: Number(base), designAddonGHS: Number(addon) }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus("saved");
      setPrices({ basePriceGHS: Number(base), designAddonGHS: Number(addon) });
      setTimeout(() => setStatus(""), 3000);
    } else {
      setStatus("error");
    }
  }

  // ── Design loaders ───────────────────────────────────────────────────────────

  async function loadDesigns() {
    setDesignsLoad(true);
    const token = await getAccessToken();
    const res   = await fetch(apiUrl("/api/admin/studio/designs"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setDesigns(data.designs ?? []);
    }
    setDesignsLoad(false);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setUploadErr("Please select an image file."); return; }
    if (!newName.trim()) { setUploadErr("Please enter a design name."); return; }
    setUploadErr("");
    setUploading(true);
    setUploadPct(0);
    setAddStatus("");

    const token = await getAccessToken();

    // XHR for upload progress
    await new Promise<void>((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl("/api/admin/upload"));
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 90));
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { url } = JSON.parse(xhr.responseText);
          setUploadPct(95);

          // Create design record
          const res2 = await fetch(apiUrl("/api/admin/studio/designs"), {
            method:  "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body:    JSON.stringify({
              name:     newName.trim(),
              imageUrl: url,
              category: newCategory.trim() || null,
            }),
          });

          if (res2.ok) {
            setUploadPct(100);
            setAddStatus("saved");
            setNewName("");
            setNewCategory("");
            if (fileRef.current) fileRef.current.value = "";
            await loadDesigns();
            setTimeout(() => setAddStatus(""), 3000);
          } else {
            setAddStatus("error");
          }
          resolve();
        } else {
          setUploadErr("Upload failed — please try again.");
          reject();
        }
      };
      xhr.onerror = () => { setUploadErr("Network error during upload."); reject(); };
      xhr.send(fd);
    }).catch(() => {});

    setUploading(false);
    setUploadPct(0);
  }

  async function toggleDesign(design: StudioDesign) {
    const token = await getAccessToken();
    await fetch(apiUrl(`/api/admin/studio/designs/${design.id}`), {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive: !design.isActive }),
    });
    setDesigns(prev => prev.map(d => d.id === design.id ? { ...d, isActive: !d.isActive } : d));
  }

  async function deleteDesign(design: StudioDesign) {
    if (!confirm(`Delete "${design.name}"? This cannot be undone.`)) return;
    const token = await getAccessToken();
    const res = await fetch(apiUrl(`/api/admin/studio/designs/${design.id}`), {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setDesigns(prev => prev.filter(d => d.id !== design.id));
  }

  // ── Shared styles ─────────────────────────────────────────────────────────────

  const labelCls = "block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5";
  const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-2.5 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors";

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <div className="mb-8">
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Configuration</p>
        <h1 className="font-serif text-zinc-900" style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 300 }}>
          Custom Studio Settings
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-8">

          {/* ── Pricing section ─────────────────────────────────────────────── */}

          {/* Current preview */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-6">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-light mb-4">Live Pricing Preview</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1">Plain Tee</p>
                <p className="font-serif text-zinc-900 text-2xl font-light">GH₵ {prices.basePriceGHS}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1">Custom Tee</p>
                <p className="font-serif text-zinc-900 text-2xl font-light">
                  GH₵ {prices.basePriceGHS + prices.designAddonGHS}
                </p>
                <p className="font-sans text-[9px] text-zinc-400 font-light mt-1">
                  Base + GH₵ {prices.designAddonGHS} design fee
                </p>
              </div>
            </div>
          </div>

          {/* Edit pricing form */}
          <form onSubmit={handleSave} className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-5">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-light">Update Prices</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Base Price (GH₵) *</label>
                <input type="number" min="0" step="1" value={base} onChange={e => setBase(e.target.value)}
                  required className={inputCls} placeholder="150" />
                <p className="font-sans text-[10px] text-zinc-400 font-light mt-1">Plain tee, no customisation</p>
              </div>
              <div>
                <label className={labelCls}>Design Add-on (GH₵) *</label>
                <input type="number" min="0" step="1" value={addon} onChange={e => setAddon(e.target.value)}
                  required className={inputCls} placeholder="30" />
                <p className="font-sans text-[10px] text-zinc-400 font-light mt-1">Added when customer picks Add Text or Add Graphic</p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-amber-700 font-light">
                Changes take effect immediately in the store. Total price shown is <strong className="font-medium">Base + Add-on</strong> when a customisation option is selected.
              </p>
            </div>

            {status === "saved" && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <CheckCircle2 size={14} />
                <p className="font-sans text-sm font-light">Prices updated successfully.</p>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle size={14} />
                <p className="font-sans text-sm font-light">Something went wrong. Please try again.</p>
              </div>
            )}

            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 h-11 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-50">
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving…" : "Save Prices"}
            </button>
          </form>

          {/* ── Studio designs section ───────────────────────────────────────── */}

          <div className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-6">
            <div>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-light mb-1">
                Studio Designs
              </p>
              <p className="font-sans text-xs text-zinc-500 font-light">
                Upload graphic designs (PNG with transparent background recommended). Customers can select them in the Custom Studio and see a live preview on the shirt.
              </p>
            </div>

            {/* Upload form */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 space-y-4">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light">
                <Plus size={10} className="inline mr-1" />
                Add New Design
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Design Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Accra Skyline"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Category (optional)</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="e.g. Minimalist, Vintage"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* File picker */}
              <div>
                <label className={labelCls}>Design Image (PNG recommended) *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-3 border border-dashed border-zinc-300 rounded-xl px-4 py-3 cursor-pointer hover:border-zinc-400 transition-colors"
                >
                  <ImageIcon size={16} className="text-zinc-400 shrink-0" />
                  <span className="font-sans text-xs text-zinc-500 font-light truncate">
                    {fileRef.current?.files?.[0]?.name ?? "Click to select image…"}
                  </span>
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={() => { setUploadErr(""); }} />
                <p className="font-sans text-[10px] text-zinc-400 font-light mt-1">
                  PNG with transparent background · max 8 MB
                </p>
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all duration-200"
                      style={{ width: `${uploadPct}%` }}
                    />
                  </div>
                  <p className="font-sans text-[10px] text-zinc-400 font-light">Uploading… {uploadPct}%</p>
                </div>
              )}

              {uploadErr && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle size={13} />
                  <p className="font-sans text-xs font-light">{uploadErr}</p>
                </div>
              )}

              {addStatus === "saved" && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <CheckCircle2 size={13} />
                  <p className="font-sans text-xs font-light">Design uploaded and live in the store.</p>
                </div>
              )}
              {addStatus === "error" && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle size={13} />
                  <p className="font-sans text-xs font-light">Failed to create design record. Please try again.</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-6 h-10 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
              >
                {uploading
                  ? <><RefreshCw size={12} className="animate-spin" /> Uploading…</>
                  : <><Upload size={12} /> Upload Design</>
                }
              </button>
            </div>

            {/* Designs grid */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-4">
                Uploaded Designs ({designs.length})
              </p>

              {designsLoad ? (
                <div className="flex items-center justify-center h-24">
                  <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
                </div>
              ) : designs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 py-10 text-center">
                  <ImageIcon size={24} className="text-zinc-300 mx-auto mb-2" />
                  <p className="font-sans text-sm text-zinc-400 font-light">No designs yet. Upload your first one above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {designs.map(d => (
                    <div
                      key={d.id}
                      className={`rounded-2xl border overflow-hidden transition-all ${
                        d.isActive ? "border-zinc-100" : "border-zinc-200 opacity-60"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-square bg-zinc-50 flex items-center justify-center">
                        <Image
                          src={d.imageUrl}
                          alt={d.name}
                          fill
                          className="object-contain p-3"
                          unoptimized
                        />
                        {!d.isActive && (
                          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                            <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-zinc-200 text-zinc-500 px-2 py-1 rounded-full">
                              Hidden
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info + actions */}
                      <div className="p-3 bg-white">
                        <p className="font-sans text-xs text-zinc-800 font-medium truncate">{d.name}</p>
                        {d.category && (
                          <p className="font-sans text-[10px] text-zinc-400 font-light truncate">{d.category}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => toggleDesign(d)}
                            title={d.isActive ? "Hide design" : "Show design"}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-[10px] border transition-colors ${
                              d.isActive
                                ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                : "border-zinc-200 text-zinc-500 bg-zinc-50 hover:bg-zinc-100"
                            }`}
                          >
                            {d.isActive
                              ? <><Eye size={10} /> Live</>
                              : <><EyeOff size={10} /> Hidden</>
                            }
                          </button>
                          <button
                            onClick={() => deleteDesign(d)}
                            title="Delete"
                            className="ml-auto p-1.5 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock management note */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-6">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-light mb-3">
              Stock Management
            </p>
            <p className="font-sans text-sm text-zinc-500 font-light leading-relaxed mb-4">
              Product stock levels are managed per-product. Go to <strong className="font-medium text-zinc-700">Products</strong> → click a product → update the <strong className="font-medium text-zinc-700">Stock</strong> field. When stock reaches 0, the product automatically shows &quot;Out of Stock&quot; in the store and customers cannot add it to their cart.
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 font-sans text-sm text-zinc-900 font-medium hover:text-zinc-600 transition-colors underline underline-offset-2"
            >
              Manage Product Stock →
            </a>
          </div>

        </div>
      )}
    </div>
  );
}
