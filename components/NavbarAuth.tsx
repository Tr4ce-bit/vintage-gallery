"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ShoppingBag, Shield, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props { mobile?: boolean; onDark?: boolean }

export default function NavbarAuth({ mobile = false, onDark = false }: Props) {
  const { isSignedIn, isLoaded, user, signOut } = useAuth();
  const router  = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Prevent flash of wrong state while auth loads
  if (!isLoaded) return <div className="w-8 h-8" />;

  /* ── Signed-in ─────────────────────────────────────────────────────────── */
  if (isSignedIn) {
    const displayName = user?.email ?? user?.username ?? "Account";

    if (mobile) {
      return (
        <div className="flex flex-col gap-3">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light">
            {displayName}
          </span>
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-light text-left"
          >
            Sign out
          </button>
        </div>
      );
    }

    return (
      <div className="hidden md:flex items-center" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
            onDark
              ? "hover:bg-white/10 text-white/70 hover:text-white"
              : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <User size={15} strokeWidth={1.5} />
          <ChevronDown
            size={11}
            strokeWidth={2}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-900/8 overflow-hidden z-50">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-zinc-50">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-300 font-light mb-0.5">
                Signed in as
              </p>
              <p className="font-sans text-sm text-zinc-800 font-medium truncate">
                {displayName}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                <ShoppingBag size={13} strokeWidth={1.5} />
                My Orders
              </Link>
              <Link
                href="/account/security"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                <Shield size={13} strokeWidth={1.5} />
                Security
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-zinc-50 py-1.5">
              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  router.push("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={13} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Signed-out ────────────────────────────────────────────────────────── */
  if (mobile) {
    return (
      <>
        <Link
          href="/sign-in"
          className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-light"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="font-sans text-[11px] tracking-[0.2em] uppercase font-medium bg-zinc-900 text-white px-5 py-2 rounded-full"
        >
          Join
        </Link>
      </>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        href="/sign-in"
        className={`font-sans text-[10px] tracking-[0.22em] uppercase font-light transition-colors ${
          onDark ? "text-white/55 hover:text-white" : "text-zinc-400 hover:text-zinc-800"
        }`}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className={`font-sans text-[10px] tracking-[0.18em] uppercase font-medium px-4 py-2 rounded-full transition-all ${
          onDark
            ? "bg-white text-zinc-900 hover:bg-zinc-100"
            : "bg-zinc-900 text-white hover:bg-zinc-700"
        }`}
      >
        Join
      </Link>
    </div>
  );
}
