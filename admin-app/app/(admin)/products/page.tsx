"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/api";

interface Product {
  id: string; name: string; slug: string; collection: string;
  basePrice: number; imageUrl: string; badge?: string;
  stock: number; isActive: boolean; featured: boolean;
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
    <div className="px-8 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 font-light mb-1">Catalog</p>
          <h1 className="font-serif text-zinc-900" style={{ fontSize: "2rem", fontWeight: 300 }}>Products</h1>
        </div>
        <Link href="/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans text-[11px] tracking-[0.15em] uppercase transition-colors">
          <Plus size={13} /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-sans text-sm text-zinc-300 mb-4">No products yet.</p>
            <Link href="/products/new" className="font-sans text-sm text-zinc-900 font-medium hover:underline">Add your first product →</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {["","Name","Collection","Price","Stock","Status",""].map((h,i) => (
                  <th key={i} className="px-5 py-3 text-left font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-300 font-light">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3.5 w-12">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-100">
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-sans text-sm font-medium text-zinc-800">{p.name}</p>
                    {p.badge && <span className="font-sans text-[9px] tracking-[0.15em] uppercase text-zinc-400">{p.badge}</span>}
                  </td>
                  <td className="px-5 py-3.5 font-sans text-sm text-zinc-500">{p.collection}</td>
                  <td className="px-5 py-3.5 font-sans text-sm text-zinc-700 font-medium">GH₵ {p.basePrice}</td>
                  <td className="px-5 py-3.5 font-sans text-sm text-zinc-500">{p.stock}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActive(p.id, p.isActive)}
                      className={`font-sans text-[10px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full transition-colors ${
                        p.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                      }`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/products/${p.id}`}
                        className="w-7 h-7 rounded-lg bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors">
                        <Pencil size={12} />
                      </Link>
                      <button onClick={() => deleteProduct(p.id, p.name)}
                        className="w-7 h-7 rounded-lg bg-zinc-50 hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
