"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Props { mobile?: boolean; onDark?: boolean }

export default function NavbarAuth({ mobile = false, onDark = false }: Props) {
  const { isSignedIn, isLoaded, user, signOut } = useAuth();
  const router = useRouter();

  // Prevent flash of wrong state while auth loads
  if (!isLoaded) return <div className="w-16 h-5" />;

  if (isSignedIn) {
    /* ── Signed-in: show initial avatar + sign-out ─────────────────────── */
    const initial = (user?.email?.[0] ?? user?.username?.[0] ?? "U").toUpperCase();

    if (mobile) {
      return (
        <button
          onClick={async () => { await signOut(); router.push("/"); }}
          className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-light"
        >
          Sign out
        </button>
      );
    }

    return (
      <div className="hidden md:flex items-center gap-3">
        <span
          className={`font-sans text-[10px] tracking-[0.15em] uppercase font-light ${
            onDark ? "text-white/60" : "text-zinc-500"
          }`}
        >
          {user?.email ?? user?.username}
        </span>
        <button
          onClick={async () => { await signOut(); router.push("/"); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-opacity hover:opacity-75 ${
            onDark
              ? "bg-white text-zinc-900"
              : "bg-zinc-900 text-white"
          }`}
          title="Sign out"
        >
          {initial}
        </button>
      </div>
    );
  }

  /* ── Signed-out: Sign in / Join links ─────────────────────────────────── */
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
