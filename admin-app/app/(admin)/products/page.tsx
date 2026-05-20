"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface Product {
  id: string; name: string; slug: string; collection: string;
  basePrice: number; imageUrl: string; badge?: string;
  stock: number; isActive: boolean; featured: boolean;
  sizes: string[];
  sizeStock: Record<string, number> | null;
}

/** Colour + label for one size pill */
function sizePillClass(size: string, sizes: string[], sizeStock: Record<string, number> | null) {
  if (!sizes.includes(size)) {
    return { dot: "bg-zinc-100 dark:bg-zinc-700", text: "text-zinc-300 dark:text-zinc-600", title: "Not offered" };
  }
  const qty = sizeStock ? (sizeStock[size] ?? 0) : null;
  if (qty === null) return { dot: "bg-emerald-400", text: "text-zinc-700 dark:text-zinc-200", title: "In stock" };
  if (qty <= 0)  return { dot: "bg-red-400",    text: "text-red-500 dark:text-red-400",     title: "Out of stock (0)" };
  if (qty <= 3)  return { dot: "bg-amber-400",  text: "text-amber-600 dark:text-amber-400", title: `Low stock (${qty})` };
  return { dot: "bg-emerald-400", text: "text-zinc-600 dark:text-zinc-400", title: `${qty} in stock` };
}

export default function ProductsPage() {
  const { getAccessToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function load() {
    const token = await getAccessToken();
    const res   = await fetch(apiUrl("/api/admin/products"), { headers: { Authorization: `Bearer ${token}` } });
    const data  = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    const token = await getAccessToken();
    await fetch(apiUrl(`/api/admin/products/${id}`), {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive: !current }),
    });
    setProducts(p => p.map(x => x.id === id ? { ...x, isActive: !current } : x));
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? If it has orders, it will be deactivated instead.`)) return;
    const token = await getAccessToken();
    const res   = await fetch(apiUrl(`/api/admin/products/${id}`), {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.deleted) {
      setProducts(p => p.filter(x => x.id !== id));
    } else {
      setProducts(p => p.map(x => x.id === id ? { ...x, isActive: false } : x));
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Catalog</p>
          <h1 className="font-serif text-zinc-900 dark:text-zinc-50" style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 300 }}>Products</h1>
        </div>
        <Link href="/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors">
          <Plus size={13} /> Add Product
        </Link>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-light">Size stock key:</p>
        {[
          { dot: "bg-emerald-400", label: "In stock" },
          { dot: "bg-amber-400",   label: "Low (≤3)"  },
          { dot: "bg-red-400",     label: "Out"        },
          { dot: "bg-zinc-200 dark:bg-zinc-700", label: "Not offered"},
        ].map(({ dot, label }) => (
          <span key={label} className="flex items-center gap-1.5 font-sans text-[9px] text-zinc-400 dark:text-zinc-500">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-800 dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-sans text-sm text-zinc-300 dark:text-zinc-600 mb-4">No products yet.</p>
            <Link href="/products/new" className="font-sans text-sm text-zinc-900 dark:text-zinc-100 font-medium hover:underline">Add your first product →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-700">
                  {["", "Name", "Collection", "Price", "Sizes & Stock", "Status", ""].map((h, i) => (
                    <th key={i} className="px-4 md:px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600 font-light">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-zinc-50 dark:border-zinc-700/30 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30 transition-colors">

                    {/* Thumbnail */}
                    <td className="px-4 md:px-5 py-3.5 w-12">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 md:px-5 py-3.5">
                      <p className="font-sans text-sm font-medium text-zinc-800 dark:text-zinc-100">{p.name}</p>
                      {p.badge && (
                        <span className="font-sans text-[9px] tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-500">{p.badge}</span>
                      )}
                    </td>

                    {/* Collection */}
                    <td className="px-4 md:px-5 py-3.5 font-sans text-sm text-zinc-500 dark:text-zinc-400">{p.collection}</td>

                    {/* Price */}
                    <td className="px-4 md:px-5 py-3.5 font-sans text-sm text-zinc-700 dark:text-zinc-200 font-medium whitespace-nowrap">
                      GH₵ {p.basePrice}
                    </td>

                    {/* Per-size stock grid */}
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {ALL_SIZES.map(s => {
                          const { dot, text, title } = sizePillClass(s, p.sizes, p.sizeStock);
                          return (
                            <div key={s} className="flex flex-col items-center gap-0.5" title={`${s}: ${title}`}>
                              <span className={`font-sans text-[8px] tracking-wide ${text}`}>{s}</span>
                              <span className={`w-2 h-2 rounded-full ${dot}`} />
                            </div>
                          );
                        })}
                      </div>
                      <p className={`font-sans text-[9px] mt-1 ${
                        p.stock === 0 ? "text-red-400" : p.stock <= 5 ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500"
                      }`}>
                        {p.stock === 0 ? "All out of stock" : `${p.stock} total`}
                      </p>
                    </td>

                    {/* Active toggle */}
                    <td className="px-4 md:px-5 py-3.5">
                      <button onClick={() => toggleActive(p.id, p.isActive)}
                        className={`font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full transition-colors ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                            : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-600"
                        }`}>
                        {p.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/products/${p.id}`}
                          className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                          title="Edit product">
                          <Pencil size={12} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id, p.name)}
                          className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors"
                          title="Delete product">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
