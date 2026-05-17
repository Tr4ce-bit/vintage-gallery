"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "#";

const NAV = [
  { label: "Dashboard", href: "/",         icon: LayoutDashboard },
  { label: "Orders",    href: "/orders",   icon: ShoppingBag     },
  { label: "Products",  href: "/products", icon: Package         },
];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user, signOut } = useAuth();
  const router      = useRouter();
  const pathname    = usePathname();
  const [checked, setChecked]         = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in"); return; }
    const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
    if (!isAdmin) { router.replace("/denied"); return; }
    setChecked(true);
  }, [isLoaded, isSignedIn, user, router]);

  // Close drawer on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static on desktop */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-zinc-950 flex flex-col transition-transform duration-200 ease-in-out md:static md:z-auto md:translate-x-0 md:shrink-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="px-6 py-6 border-b border-zinc-800 flex items-start justify-between">
          <div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-serif text-white" style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
              <span className="font-serif text-white/40" style={{ fontSize: "0.38rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
            </div>
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-600 font-light mt-3">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-500 hover:text-white transition-colors mt-1">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}>
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-800 space-y-0.5">
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <ExternalLink size={15} strokeWidth={1.5} />
            View Store
          </a>
          <button
            onClick={async () => { await signOut(); router.replace("/sign-in"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={15} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-10 bg-white border-b border-zinc-100 px-4 h-14 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-500 hover:text-zinc-900 transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-serif text-zinc-900" style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
        </header>

        <main className="flex-1 overflow-auto bg-zinc-50">
          {children}
        </main>
      </div>
    </div>
  );
}
