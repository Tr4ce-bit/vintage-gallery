import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between bg-zinc-950 p-12 overflow-hidden">
        {/* Background product photo */}
        <div className="absolute inset-0">
          <Image
            src="/asset/product-hope.jpg"
            alt=""
            fill
            className="object-cover object-center opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex flex-col items-start leading-none">
            <span className="font-serif text-white" style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              VG
            </span>
            <span className="font-serif text-white/50" style={{ fontSize: "0.42rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}>
              Vintage Gallery
            </span>
          </Link>
        </div>

        {/* Quote */}
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
              Welcome Back
            </p>
            <h1 className="font-serif text-zinc-900 leading-none"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300 }}>
              Sign in to your account.
            </h1>
          </div>

          <SignIn
            appearance={{
              variables: {
                colorPrimary:        "#18181b",
                colorText:           "#18181b",
                colorTextSecondary:  "#71717a",
                colorBackground:     "#ffffff",
                colorInputBackground:"#ffffff",
                colorInputText:      "#18181b",
                colorDanger:         "#ef4444",
                borderRadius:        "0.75rem",
                fontFamily:          "var(--font-inter), system-ui, sans-serif",
                fontSize:            "14px",
              },
              elements: {
                card:                      "shadow-none p-0 gap-5",
                headerTitle:               "hidden",
                headerSubtitle:            "hidden",
                header:                    "hidden",
                socialButtonsBlockButton:  "border border-zinc-200 hover:border-zinc-400 rounded-xl font-sans font-light text-zinc-600 hover:text-zinc-900 transition-all",
                socialButtonsBlockButtonText: "font-sans text-sm font-light",
                dividerLine:               "bg-zinc-100",
                dividerText:               "text-zinc-300 font-sans text-xs",
                formFieldLabel:            "font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-light",
                formFieldInput:            "border-zinc-200 rounded-xl font-sans text-sm focus:border-zinc-400 focus:ring-0",
                formButtonPrimary:         "bg-zinc-900 hover:bg-zinc-700 rounded-full font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors h-12",
                footerActionText:          "font-sans text-sm text-zinc-400 font-light",
                footerActionLink:          "font-sans text-sm text-zinc-900 font-medium hover:text-zinc-600",
                footer:                    "pt-4",
                identityPreviewText:       "font-sans text-sm text-zinc-600",
                formResendCodeLink:        "text-zinc-900 font-sans text-sm",
                otpCodeFieldInput:         "border-zinc-200 rounded-xl",
                // Hide "Powered by Clerk" branding
                footerPages:               "hidden",
                "footerPages__signIn":     "hidden",
                internal:                  "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
