"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, LogOut, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const NAV = [
  { label: "Dashboard", href: "/admin",          icon: LayoutDashboard },
  { label: "Orders",    href: "/admin/orders",   icon: ShoppingBag     },
  { label: "Products",  href: "/admin/products", icon: Package         },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user, signOut } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const isAdmin = isSignedIn && !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
    if (!isAdmin) { router.replace("/"); return; }
    setChecked(true);
  }, [isLoaded, isSignedIn, user, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-zinc-950 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-zinc-800">
          <Link href="/" className="flex flex-col items-start leading-none">
            <span className="font-serif text-white" style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-white/40" style={{ fontSize: "0.38rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
          <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-600 font-light mt-3">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-zinc-800 space-y-0.5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <Store size={15} strokeWidth={1.5} />
            View Store
          </Link>
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={15} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
