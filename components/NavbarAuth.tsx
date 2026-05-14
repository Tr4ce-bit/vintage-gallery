"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface Props { mobile?: boolean; onDark?: boolean }

function ClerkButtons({ mobile, onDark }: Props) {
  const { isSignedIn } = useUser();
  if (isSignedIn) return <UserButton />;
  if (mobile) return (
    <>
      <SignInButton mode="modal">
        <button className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-light">Sign in</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="font-sans text-[11px] tracking-[0.2em] uppercase font-medium bg-zinc-900 text-white px-5 py-2 rounded-full">Join</button>
      </SignUpButton>
    </>
  );
  return (
    <div className="hidden md:flex items-center gap-3">
      <SignInButton mode="modal">
        <button className={`font-sans text-[10px] tracking-[0.22em] uppercase font-light transition-colors ${onDark ? "text-white/45 hover:text-white" : "text-zinc-400 hover:text-zinc-800"}`}>Sign in</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className={`font-sans text-[10px] tracking-[0.18em] uppercase font-medium px-4 py-2 rounded-full transition-all ${onDark ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-700"}`}>Join</button>
      </SignUpButton>
    </div>
  );
}

function FallbackLinks({ mobile, onDark }: Props) {
  if (mobile) return (
    <>
      <a href="/sign-in" className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-light">Sign in</a>
      <a href="/sign-up" className="font-sans text-[11px] tracking-[0.2em] uppercase font-medium bg-zinc-900 text-white px-5 py-2 rounded-full">Join</a>
    </>
  );
  return (
    <div className="hidden md:flex items-center gap-3">
      <a href="/sign-in" className={`font-sans text-[10px] tracking-[0.22em] uppercase font-light transition-colors ${onDark ? "text-white/45 hover:text-white" : "text-zinc-400 hover:text-zinc-800"}`}>Sign in</a>
      <a href="/sign-up" className={`font-sans text-[10px] tracking-[0.18em] uppercase font-medium px-4 py-2 rounded-full transition-all ${onDark ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-700"}`}>Join</a>
    </div>
  );
}

export default function NavbarAuth({ mobile = false, onDark = false }: Props) {
  return CLERK_ENABLED ? <ClerkButtons mobile={mobile} onDark={onDark} /> : <FallbackLinks mobile={mobile} onDark={onDark} />;
}
