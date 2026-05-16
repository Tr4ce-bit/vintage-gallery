"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, confirmSignIn } from "aws-amplify/auth";
import { Eye, EyeOff } from "lucide-react";

export default function AdminSignInPage() {
  const router = useRouter();
  const [step,      setStep]      = useState<"credentials" | "totp">("credentials");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [totpCode,  setTotpCode]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors";

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const result = await signIn({ username: email.trim(), password });
      if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        setStep("totp");
      } else if (result.isSignedIn) {
        router.replace("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotAuthorizedException") || msg.includes("Incorrect"))
        setError("Incorrect email or password.");
      else if (msg.includes("UserNotFoundException"))
        setError("No account found with this email.");
      else if (msg.includes("LimitExceededException"))
        setError("Too many attempts. Please wait a few minutes.");
      else
        setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const result = await confirmSignIn({ challengeResponse: totpCode.trim() });
      if (result.isSignedIn) router.replace("/");
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-serif text-white" style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "0.1em" }}>VG</span>
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-500 font-light mt-1">Admin Access</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">Email</label>
                <input type="email" required autoFocus value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  className={inputCls} />
              </div>
              <div>
                <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <p className="font-sans text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 mt-2">
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTotp} className="space-y-4">
              <p className="font-sans text-sm text-zinc-400 text-center mb-2">
                Enter the 6-digit code from your authenticator app.
              </p>
              <input type="text" inputMode="numeric" maxLength={6} required autoFocus
                value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={`${inputCls} text-center tracking-[0.4em] text-lg`} />
              {error && <p className="font-sans text-sm text-red-400 text-center">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50">
                {loading ? "Verifying…" : "Verify"}
              </button>
              <button type="button" onClick={() => { setStep("credentials"); setError(""); }}
                className="w-full font-sans text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                ← Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
