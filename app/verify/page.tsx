"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmSignUp, resendSignUpCode, autoSignIn } from "aws-amplify/auth";

function VerifyForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [code,     setCode]     = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [resent,   setResent]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username:         email,
        confirmationCode: code.trim(),
      });

      if (isSignUpComplete) {
        // Try auto sign-in (only works if autoSignIn was enabled at sign-up)
        try { await autoSignIn(); } catch { /* ignore — user can sign in manually */ }
        router.push("/");
        return;
      }

      // Handle unexpected next steps
      console.log("Verify next step:", nextStep);
      router.push("/sign-in");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendSignUpCode({ username: email });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not resend code.";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center leading-none">
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-serif text-zinc-900" style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-zinc-400" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        <div className="mb-8">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">
            Verify Email
          </p>
          <h1 className="font-serif text-zinc-900 leading-none mb-3"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
            Check your inbox.
          </h1>
          <p className="font-sans text-sm text-zinc-400 font-light">
            We sent a 6-digit code to{" "}
            <span className="text-zinc-700 font-medium">{email}</span>.
            Enter it below to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 dark:text-zinc-100 bg-transparent dark:bg-zinc-900 tracking-[0.5em] text-center focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              placeholder="000000"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying…" : "Verify Account"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="font-sans text-sm text-zinc-400 font-light">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              className="text-zinc-900 font-medium hover:text-zinc-600 underline underline-offset-2"
            >
              Resend
            </button>
          </p>
          {resent && (
            <p className="font-sans text-sm text-emerald-600">Code sent! Check your inbox.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
