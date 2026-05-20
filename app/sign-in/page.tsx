"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { signIn, confirmSignIn, rememberDevice } from "aws-amplify/auth";

type Step = "credentials" | "mfa";

// Translate Cognito/Amplify error codes into plain English
function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return "Sign in failed. Please try again.";
  const msg = err.message;
  if (msg.includes("Incorrect username or password"))
    return "Incorrect email or password.";
  if (msg.includes("Password attempts exceeded"))
    return "Too many failed attempts. Please wait a few minutes and try again.";
  if (msg.includes("User is disabled"))
    return "This account has been disabled. Please contact support.";
  if (msg.includes("not confirmed"))
    return "Please verify your email first.";
  if (msg.includes("Password is compromised") || msg.includes("compromised"))
    return "This password was found in a data breach. Please use a different password for your safety.";
  if (msg.includes("blocked") || msg.includes("high risk"))
    return "This sign-in was blocked due to unusual activity. Please reset your password.";
  return msg;
}

function SignInForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  // safeRedirect: only allow relative paths — blocks open-redirect attacks
  const rawRedirect  = searchParams.get("redirect") || "/";
  const redirect     = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";

  // Step 1 — credentials
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [rememberMe,    setRememberMe]    = useState(false);

  // Step 2 — MFA
  const [step,     setStep]     = useState<Step>("credentials");
  const [mfaCode,  setMfaCode]  = useState("");

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });

      if (isSignedIn) {
        if (rememberMe) await rememberDevice();
        router.push(redirect);
        return;
      }

      switch (nextStep.signInStep) {
        case "CONFIRM_SIGN_UP":
          router.push(`/verify?email=${encodeURIComponent(email)}`);
          return;
        case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
          setStep("mfa");
          return;
        case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
          return;
        default:
          setError("Sign in could not be completed. Please try again.");
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { isSignedIn } = await confirmSignIn({ challengeResponse: mfaCode.trim() });
      if (isSignedIn) {
        if (rememberMe) await rememberDevice();
        router.push(redirect);
      } else {
        setError("Code not accepted. Please try again.");
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between bg-zinc-950 p-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/asset/product-hope.jpg" alt="" fill
            className="object-cover object-center opacity-25" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex flex-col items-start leading-none">
            <span className="font-serif text-white" style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-white/50" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        <div className="relative z-10">
          <p className="font-serif text-white leading-snug mb-4"
            style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)", fontWeight: 300 }}>
            Wear the<br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>Culture.</em>
          </p>
          <p className="font-sans text-white/40 text-sm font-light">
            Ghana&apos;s premier streetwear destination.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 px-6 py-12">

        <div className="lg:hidden mb-10">
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-serif text-zinc-900 dark:text-zinc-100" style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.08em" }}>VG</span>
            <span className="font-serif text-zinc-400 dark:text-zinc-500" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>Vintage Gallery</span>
          </Link>
        </div>

        <div className="w-full max-w-md">

          {/* ── Step 1: Credentials ── */}
          {step === "credentials" && (
            <>
              <div className="mb-8">
                <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">Welcome Back</p>
                <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
                  Sign in to your account.
                </h1>
              </div>

              <form onSubmit={handleCredentials} className="space-y-5">
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light">
                      Password
                    </label>
                    <Link href="/forgot-password"
                      className="font-sans text-[10px] text-zinc-400 hover:text-zinc-700 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 pr-11 font-sans text-sm text-zinc-900 dark:text-zinc-100 bg-transparent dark:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember this device */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 accent-zinc-900"
                  />
                  <span className="font-sans text-sm text-zinc-400 font-light">
                    Remember this device
                  </span>
                </label>

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
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <p className="mt-6 font-sans text-sm text-zinc-400 font-light text-center">
                Don&apos;t have an account?{" "}
                <Link href={`/sign-up${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                  className="text-zinc-900 font-medium hover:text-zinc-600">
                  Join Vintage Gallery
                </Link>
              </p>
            </>
          )}

          {/* ── Step 2: MFA code ── */}
          {step === "mfa" && (
            <>
              <div className="mb-8">
                <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-2">Two-Factor Auth</p>
                <h1 className="font-serif text-zinc-900 leading-none mb-3"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
                  Enter your code.
                </h1>
                <p className="font-sans text-sm text-zinc-400 font-light">
                  Open your authenticator app and enter the 6-digit code.
                </p>
              </div>

              <form onSubmit={handleMfa} className="space-y-5">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 tracking-[0.5em] text-center focus:outline-none focus:border-zinc-400 transition-colors"
                  placeholder="000000"
                />

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="font-sans text-sm text-red-600 font-light">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || mfaCode.length < 6}
                  className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying…" : "Verify"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setMfaCode(""); setError(""); }}
                  className="w-full font-sans text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  ← Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
