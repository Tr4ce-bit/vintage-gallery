"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

interface StudioPrices {
  basePriceGHS:   number;
  designAddonGHS: number;
}

export default function StudioSettingsPage() {
  const { getAccessToken } = useAuth();

  const [prices,  setPrices]  = useState<StudioPrices>({ basePriceGHS: 150, designAddonGHS: 30 });
  const [base,    setBase]    = useState("");
  const [addon,   setAddon]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState<"" | "saved" | "error">("");

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function load() {
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
      body:    JSON.stringify({
        basePriceGHS:   Number(base),
        designAddonGHS: Number(addon),
      }),
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

  const labelCls = "block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5";
  const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-2.5 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors";

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
        <div className="max-w-xl space-y-6">

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

          {/* Edit form */}
          <form onSubmit={handleSave} className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-5">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-light">Update Prices</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Base Price (GH₵) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={base}
                  onChange={e => setBase(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="150"
                />
                <p className="font-sans text-[10px] text-zinc-400 font-light mt-1">Plain tee, no customisation</p>
              </div>
              <div>
                <label className={labelCls}>Design Add-on (GH₵) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={addon}
                  onChange={e => setAddon(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="30"
                />
                <p className="font-sans text-[10px] text-zinc-400 font-light mt-1">Added when customer picks Add Text or Add Graphic</p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-amber-700 font-light">
                Changes take effect immediately in the store. The total price shown to customers will be <strong className="font-medium">Base + Add-on</strong> when they select a customisation option.
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

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 h-11 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
              >
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? "Saving…" : "Save Prices"}
              </button>
            </div>
          </form>

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
