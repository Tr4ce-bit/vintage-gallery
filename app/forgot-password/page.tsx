"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";

type Step = "request" | "confirm" | "done";

function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return "Something went wrong. Please try again.";
  const msg = err.message;
  if (msg.includes("Username/client id combination not found") || msg.includes("UserNotFoundException"))
    return "No account found with that email.";
  if (msg.includes("Attempt limit exceeded"))
    return "Too many attempts. Please wait a few minutes.";
  if (msg.includes("Invalid verification code"))
    return "Incorrect code. Please check your email and try again.";
  if (msg.includes("expired"))
    return "This code has expired. Please request a new one.";
  if (msg.includes("Password did not conform"))
    return "Password must be at least 8 characters with an uppercase letter and a number.";
  return msg;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step,        setStep]        = useState<Step>("request");
  const [email,       setEmail]       = useState("");
  const [code,        setCode]        = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword({ username: email });
      setStep("confirm");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmResetPassword({
        username:         email,
        confirmationCode: code.trim(),
        newPassword,
      });
      setStep("done");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-serif text-zinc-900" style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-zinc-400" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        {/* ── Step 1: Enter email ── */}
        {step === "request" && (
          <>
            <div className="mb-8">
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">Reset Password</p>
              <h1 className="font-serif text-zinc-900 leading-none mb-3"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
                Forgot your password?
              </h1>
              <p className="font-sans text-sm text-zinc-400 font-light">
                Enter the email you used to sign up and we&apos;ll send a reset code.
              </p>
            </div>

            <form onSubmit={handleRequest} className="space-y-5">
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
                  autoFocus
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                  placeholder="you@example.com"
                />
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
                {loading ? "Sending…" : "Send Reset Code"}
              </button>
            </form>

            <p className="mt-6 font-sans text-sm text-zinc-400 font-light text-center">
              <Link href="/sign-in" className="text-zinc-900 font-medium hover:text-zinc-600">
                ← Back to Sign In
              </Link>
            </p>
          </>
        )}

        {/* ── Step 2: Enter code + new password ── */}
        {step === "confirm" && (
          <>
            <div className="mb-8">
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">Check Your Email</p>
              <h1 className="font-serif text-zinc-900 leading-none mb-3"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
                Create new password.
              </h1>
              <p className="font-sans text-sm text-zinc-400 font-light">
                We sent a 6-digit code to <span className="text-zinc-700 font-medium">{email}</span>.
                Enter it below with your new password.
              </p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-5">
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
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 tracking-[0.5em] text-center focus:outline-none focus:border-zinc-400 transition-colors"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                />
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
                {loading ? "Updating…" : "Set New Password"}
              </button>
            </form>

            <p className="mt-4 font-sans text-sm text-zinc-400 font-light text-center">
              Didn&apos;t get the code?{" "}
              <button onClick={() => { setStep("request"); setCode(""); setError(""); }}
                className="text-zinc-900 font-medium hover:text-zinc-600 underline underline-offset-2">
                Resend
              </button>
            </p>
          </>
        )}

        {/* ── Step 3: Done ── */}
        {step === "done" && (
          <div className="text-center space-y-6">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto" strokeWidth={1.5} />
            <div>
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">All Set</p>
              <h1 className="font-serif text-zinc-900 leading-none"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
                Password updated.
              </h1>
            </div>
            <p className="font-sans text-sm text-zinc-400 font-light">
              Your password has been reset successfully. Sign in with your new password.
            </p>
            <button
              onClick={() => router.push("/sign-in")}
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
