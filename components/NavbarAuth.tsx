"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface Props { mobile?: boolean; scrolled?: boolean }

function ClerkButtons({ mobile, scrolled }: Props) {
  const { isSignedIn } = useUser();
  if (isSignedIn) return <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />;
  if (mobile) return (
    <>
      <SignInButton mode="modal">
        <button className="font-sans text-sm text-vg-ink/40 tracking-widest uppercase font-light">Sign In</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="btn-pill !px-5 !py-2 !text-[9px]">Join</button>
      </SignUpButton>
    </>
  );
  return (
    <div className="hidden md:flex items-center gap-3">
      <SignInButton mode="modal">
        <button className={`font-sans text-[9px] tracking-[0.25em] uppercase font-light transition-colors ${scrolled ? "text-vg-ink/35 hover:text-vg-ink" : "text-white/40 hover:text-white"}`}>
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className={`font-sans text-[9px] tracking-[0.2em] uppercase font-medium px-4 py-2 rounded-full border transition-all duration-200 ${scrolled ? "border-vg-ink/20 text-vg-ink hover:bg-vg-ink hover:text-white hover:border-vg-ink" : "border-white/25 text-white hover:bg-white hover:text-vg-ink"}`}>
          Join
        </button>
      </SignUpButton>
    </div>
  );
}

function FallbackLinks({ mobile, scrolled }: Props) {
  if (mobile) return (
    <>
      <a href="/sign-in" className="font-sans text-sm text-vg-ink/40 tracking-widest uppercase font-light">Sign In</a>
      <a href="/sign-up" className="btn-pill !px-5 !py-2 !text-[9px]">Join</a>
    </>
  );
  return (
    <div className="hidden md:flex items-center gap-3">
      <a href="/sign-in" className={`font-sans text-[9px] tracking-[0.25em] uppercase font-light transition-colors ${scrolled ? "text-vg-ink/35 hover:text-vg-ink" : "text-white/40 hover:text-white"}`}>
        Sign In
      </a>
      <a href="/sign-up" className={`font-sans text-[9px] tracking-[0.2em] uppercase font-medium px-4 py-2 rounded-full border transition-all duration-200 ${scrolled ? "border-vg-ink/20 text-vg-ink hover:bg-vg-ink hover:text-white hover:border-vg-ink" : "border-white/25 text-white hover:bg-white hover:text-vg-ink"}`}>
        Join
      </a>
    </div>
  );
}

export default function NavbarAuth({ mobile = false, scrolled = false }: Props) {
  return CLERK_ENABLED ? <ClerkButtons mobile={mobile} scrolled={scrolled} /> : <FallbackLinks mobile={mobile} scrolled={scrolled} />;
}
