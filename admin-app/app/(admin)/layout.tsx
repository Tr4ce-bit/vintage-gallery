"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, ExternalLink, Menu, X, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "#";

const NAV = [
  { label: "Dashboard", href: "/",         icon: LayoutDashboard },
  { label: "Orders",    href: "/orders",   icon: ShoppingBag     },
  { label: "Products",  href: "/products", icon: Package         },
  { label: "Studio",    href: "/studio",   icon: Settings        },
];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const router   = useRouter();
  const pathname = usePathname();
  const [checked,     setChecked]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in"); return; }
    const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
    if (!isAdmin) { router.replace("/denied"); return; }
    setChecked(true);
  }, [isLoaded, isSignedIn, user, router]);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-800 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="px-6 py-6 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="https://vintage-gallery-products.s3.amazonaws.com/branding/logo-transparent.png"
              alt="Vintage Gallery"
              width={36}
              height={36}
              className="object-contain shrink-0"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-white" style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.1em" }}>VG</span>
              <span className="font-serif text-white/40" style={{ fontSize: "0.38rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "1px" }}>Admin</span>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-600 font-light mt-3">Admin Panel</p>
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

        {/* Dark / Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark"
            ? <Sun  size={15} strokeWidth={1.5} />
            : <Moon size={15} strokeWidth={1.5} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={async () => { await signOut(); router.replace("/sign-in"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 shrink-0 bg-zinc-950 flex-col min-h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 flex flex-col md:hidden transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="https://vintage-gallery-products.s3.amazonaws.com/branding/logo-transparent.png"
              alt="Vintage Gallery"
              width={28}
              height={28}
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span className="font-serif text-white text-sm font-medium tracking-wider">Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900">
          {children}
        </main>
      </div>
    </div>
  );
}
