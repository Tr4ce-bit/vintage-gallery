"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Smartphone, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import {
  setUpTOTP,
  verifyTOTPSetup,
  updateMFAPreference,
  fetchMFAPreference,
} from "aws-amplify/auth";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

type MfaStep = "idle" | "setup" | "verify" | "done";

export default function SecurityPage() {
  const { isSignedIn, isLoaded, user } = useAuth();
  const router = useRouter();

  const [mfaEnabled, setMfaEnabled]   = useState(false);
  const [mfaStep,    setMfaStep]      = useState<MfaStep>("idle");
  const [qrUri,      setQrUri]        = useState("");
  const [secretKey,  setSecretKey]    = useState("");
  const [totpCode,   setTotpCode]     = useState("");
  const [error,      setError]        = useState("");
  const [loading,    setLoading]      = useState(false);
  const [prefLoaded, setPrefLoaded]   = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push("/sign-in"); return; }
    loadMfaPref();
  }, [isLoaded, isSignedIn]); // eslint-disable-line

  async function loadMfaPref() {
    try {
      const pref = await fetchMFAPreference();
      setMfaEnabled(pref.preferred === "TOTP" || (pref.enabled?.includes("TOTP") ?? false));
    } catch { /* ignore */ } finally {
      setPrefLoaded(true);
    }
  }

  async function startSetup() {
    setError("");
    setLoading(true);
    try {
      const output = await setUpTOTP();
      const uri    = output.getSetupUri("Vintage Gallery", user?.email ?? "");
      setQrUri(uri.toString());
      setSecretKey(output.sharedSecret);
      setMfaStep("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start MFA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndEnable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyTOTPSetup({ code: totpCode.trim() });
      await updateMFAPreference({ totp: "PREFERRED" });
      setMfaEnabled(true);
      setMfaStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function disableMfa() {
    setLoading(true);
    try {
      await updateMFAPreference({ totp: "DISABLED" });
      setMfaEnabled(false);
      setMfaStep("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not disable MFA.");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded || !prefLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[60px]">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-14">

        {/* Back */}
        <Link href="/"
          className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-300 hover:text-zinc-600 transition-colors mb-10">
          <ArrowLeft size={12} />
          Back to store
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} strokeWidth={1.5} className="text-zinc-400" />
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light">Account Security</p>
          </div>
          <h1 className="font-serif text-zinc-900 leading-none"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300 }}>
            Security settings.
          </h1>
          <p className="font-sans text-sm text-zinc-400 font-light mt-2">
            Signed in as <span className="text-zinc-700">{user?.email}</span>
          </p>
        </div>

        {/* ── MFA card ── */}
        <div className="border border-zinc-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone size={16} strokeWidth={1.5} className="text-zinc-500" />
              </div>
              <div>
                <p className="font-sans text-sm text-zinc-900 font-medium mb-0.5">
                  Two-factor authentication
                </p>
                <p className="font-sans text-sm text-zinc-400 font-light">
                  Add an extra layer of security using an authenticator app like Google Authenticator or Authy.
                </p>
                {mfaEnabled && mfaStep !== "done" && (
                  <span className="inline-flex items-center gap-1.5 mt-2 font-sans text-[10px] tracking-[0.15em] uppercase text-emerald-600 font-medium">
                    <CheckCircle2 size={11} /> Enabled
                  </span>
                )}
              </div>
            </div>

            {mfaStep === "idle" && (
              mfaEnabled
                ? <button
                    onClick={disableMfa}
                    disabled={loading}
                    className="shrink-0 font-sans text-[10px] tracking-[0.15em] uppercase text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-40"
                  >
                    {loading ? "…" : "Remove"}
                  </button>
                : <button
                    onClick={startSetup}
                    disabled={loading}
                    className="shrink-0 font-sans text-[10px] tracking-[0.18em] uppercase font-medium bg-zinc-900 text-white px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors disabled:opacity-40"
                  >
                    {loading ? "…" : "Set up"}
                  </button>
            )}
          </div>

          {/* ── Setup: show QR ── */}
          {mfaStep === "setup" && (
            <div className="border-t border-zinc-100 px-6 py-6 space-y-5">
              <p className="font-sans text-sm text-zinc-600 font-light">
                <span className="font-medium text-zinc-900">Step 1:</span> Scan this QR code with your authenticator app.
              </p>

              {/* QR code via Google Charts API */}
              <div className="flex justify-center">
                <div className="bg-white border border-zinc-100 rounded-2xl p-4 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(qrUri)}`}
                    alt="Authenticator QR code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Manual secret */}
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-300 font-light mb-2">
                  Or enter this key manually
                </p>
                <div className="bg-zinc-50 rounded-xl px-4 py-3 font-mono text-sm text-zinc-600 tracking-widest break-all select-all">
                  {secretKey}
                </div>
              </div>

              <button
                onClick={() => setMfaStep("verify")}
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors"
              >
                I&apos;ve scanned it — Continue
              </button>
            </div>
          )}

          {/* ── Verify code ── */}
          {mfaStep === "verify" && (
            <div className="border-t border-zinc-100 px-6 py-6 space-y-5">
              <p className="font-sans text-sm text-zinc-600 font-light">
                <span className="font-medium text-zinc-900">Step 2:</span> Enter the 6-digit code from your authenticator app to confirm setup.
              </p>

              <form onSubmit={verifyAndEnable} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 font-sans text-sm text-zinc-900 tracking-[0.5em] text-center focus:outline-none focus:border-zinc-400 transition-colors"
                  placeholder="000000"
                />

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="font-sans text-sm text-red-600 font-light">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full h-11 bg-zinc-900 hover:bg-zinc-700 text-white rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying…" : "Enable Two-Factor Auth"}
                </button>

                <button
                  type="button"
                  onClick={() => { setMfaStep("setup"); setTotpCode(""); setError(""); }}
                  className="w-full font-sans text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  ← Back to QR code
                </button>
              </form>
            </div>
          )}

          {/* ── Done ── */}
          {mfaStep === "done" && (
            <div className="border-t border-zinc-100 px-6 py-5 flex items-center gap-3 bg-emerald-50/50">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" strokeWidth={1.5} />
              <p className="font-sans text-sm text-emerald-700 font-light">
                Two-factor authentication is now <span className="font-medium">active</span>. Your account is better protected.
              </p>
            </div>
          )}
        </div>

        {/* Security status summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Breach detection",  desc: "Blocks compromised passwords",       on: true },
            { label: "Threat protection", desc: "Flags suspicious sign-in patterns",  on: true },
            { label: "Token revocation",  desc: "Invalidates sessions on sign-out",   on: true },
            { label: "Two-factor auth",   desc: "Authenticator app verification",     on: mfaEnabled },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-3 border border-zinc-100 rounded-xl px-4 py-3.5">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${f.on ? "bg-emerald-400" : "bg-zinc-200"}`} />
              <div>
                <p className={`font-sans text-sm font-medium ${f.on ? "text-zinc-800" : "text-zinc-400"}`}>{f.label}</p>
                <p className="font-sans text-[11px] text-zinc-300 font-light">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
