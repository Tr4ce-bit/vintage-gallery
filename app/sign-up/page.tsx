"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signUp } from "aws-amplify/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
          autoSignIn: true,
        },
      });

      // Redirect to verify page so user enters the code
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between bg-zinc-950 p-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/asset/product-tupac.jpg" alt="" fill
            className="object-cover object-center opacity-25" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex flex-col items-start leading-none">
            <span className="font-serif text-white" style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-white/50" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        {/* Perks */}
        <div className="relative z-10 space-y-5">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/40 font-light">
            Member Benefits
          </p>
          {[
            { title: "Early Drop Access",    desc: "Be first to shop every new release" },
            { title: "Wishlist & Saves",      desc: "Save pieces and come back anytime" },
            { title: "Order Tracking",        desc: "Follow every order from studio to door" },
            { title: "Members-only Pricing",  desc: "Exclusive discounts for VG members" },
          ].map((perk) => (
            <div key={perk.title} className="flex items-start gap-3">
              <span className="w-1 h-1 rounded-full bg-white/30 mt-2 shrink-0" />
              <div>
                <p className="font-sans text-sm text-white/80 font-light">{perk.title}</p>
                <p className="font-sans text-[11px] text-white/35 font-light">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-serif text-zinc-900" style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-zinc-400" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">
              Create Account
            </p>
            <h1 className="font-serif text-zinc-900 leading-none"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
              Join Vintage Gallery.
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="Kofi Mensah"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            {error && (
              <p className="font-sans text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 font-sans text-sm text-zinc-400 font-light text-center">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-zinc-900 font-medium hover:text-zinc-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
