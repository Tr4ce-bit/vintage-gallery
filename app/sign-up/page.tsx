"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ShieldAlert, CheckCircle2, Circle } from "lucide-react";
import { signUp } from "aws-amplify/auth";

// Password rules that match the Cognito Plus policy
const RULES = [
  { id: "length",    label: "At least 8 characters",      test: (p: string) => p.length >= 8 },
  { id: "upper",     label: "One uppercase letter (A–Z)",  test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",     label: "One lowercase letter (a–z)",  test: (p: string) => /[a-z]/.test(p) },
  { id: "number",    label: "One number (0–9)",            test: (p: string) => /[0-9]/.test(p) },
];

function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return "Sign up failed. Please try again.";
  const msg = err.message;
  if (msg.includes("email already exists") || msg.includes("already exists") || msg.includes("UsernameExistsException"))
    return "An account with this email already exists.";
  if (msg.includes("Password did not conform") || msg.includes("password"))
    return "Password doesn't meet the requirements below.";
  if (msg.includes("Invalid email"))
    return "Please enter a valid email address.";
  return msg;
}

function SignUpForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  // safeRedirect: only allow relative paths — blocks open-redirect attacks
  const rawRedirect  = searchParams.get("redirect") || "/";
  const redirect     = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";
  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [touched,       setTouched]       = useState(false);

  const checks = useMemo(() => RULES.map(r => ({ ...r, passed: r.test(password) })), [password]);
  const allPass = checks.every(c => c.passed);
  const strength = checks.filter(c => c.passed).length; // 0–4

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-amber-300", "bg-emerald-500"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!allPass) return;
    setError("");
    setLoading(true);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email, name },
          autoSignIn: true,
        },
      });
      const verifyUrl = `/verify?email=${encodeURIComponent(email)}${redirect !== "/" ? `&redirect=${encodeURIComponent(redirect)}` : ""}`;
      router.push(verifyUrl);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between bg-zinc-950 p-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/asset/product-tupac.jpg" alt="" fill
            className="object-cover object-center opacity-25" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex flex-col items-start leading-none">
            <span className="font-serif text-white" style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-white/50" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-5">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/40 font-light">Member Benefits</p>
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

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 px-6 py-12">

        <div className="lg:hidden mb-10">
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-serif text-zinc-900" style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-zinc-400" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">Create Account</p>
            <h1 className="font-serif text-zinc-900 leading-none"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
              Join Vintage Gallery.
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 dark:text-zinc-100 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                placeholder="Kofi Mensah"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 dark:text-zinc-100 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password + strength */}
            <div>
              <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
                  required
                  autoComplete="new-password"
                  className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 pr-11 font-sans text-sm text-zinc-900 dark:text-zinc-100 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`font-sans text-[10px] font-medium ${
                      strength <= 1 ? "text-red-400" :
                      strength <= 2 ? "text-amber-500" :
                      strength === 3 ? "text-amber-400" :
                      "text-emerald-500"
                    }`}>
                      {strengthLabel}
                    </span>
                  </div>

                  {/* Rule checklist — only show if not all passing */}
                  {(!allPass || touched) && (
                    <ul className="space-y-1">
                      {checks.map(c => (
                        <li key={c.id} className="flex items-center gap-2">
                          {c.passed
                            ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                            : <Circle size={12} className="text-zinc-200 shrink-0" />}
                          <span className={`font-sans text-[11px] ${c.passed ? "text-zinc-400" : "text-zinc-300"}`}>
                            {c.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="font-sans text-sm text-red-600 font-light">{error}</p>
              </div>
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
            <Link href={`/sign-in${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="text-zinc-900 font-medium hover:text-zinc-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
