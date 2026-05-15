"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface Props { mobile?: boolean; onDark?: boolean }

function ClerkButtons({ mobile, onDark }: Props) {
  const { isSignedIn, isLoaded } = useUser();

  // Prevent flash of wrong state while Clerk loads
  if (!isLoaded) return <div className="w-16 h-5" />;

  if (isSignedIn) return <UserButton afterSignOutUrl="/" />;

  if (mobile) return (
    <>
      <Link href="/sign-in" className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-light">
        Sign in
      </Link>
      <Link href="/sign-up" className="font-sans text-[11px] tracking-[0.2em] uppercase font-medium bg-zinc-900 text-white px-5 py-2 rounded-full">
        Join
      </Link>
    </>
  );

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        href="/sign-in"
        className={`font-sans text-[10px] tracking-[0.22em] uppercase font-light transition-colors ${
          onDark ? "text-white/55 hover:text-white" : "text-zinc-400 hover:text-zinc-800"
        }`}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className={`font-sans text-[10px] tracking-[0.18em] uppercase font-medium px-4 py-2 rounded-full transition-all ${
          onDark ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-700"
        }`}
      >
        Join
      </Link>
    </div>
  );
}

function FallbackLinks({ mobile, onDark }: Props) {
  if (mobile) return (
    <>
      <Link href="/sign-in" className="font-sans text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-light">Sign in</Link>
      <Link href="/sign-up" className="font-sans text-[11px] tracking-[0.2em] uppercase font-medium bg-zinc-900 text-white px-5 py-2 rounded-full">Join</Link>
    </>
  );
  return (
    <div className="hidden md:flex items-center gap-3">
      <Link href="/sign-in" className={`font-sans text-[10px] tracking-[0.22em] uppercase font-light transition-colors ${onDark ? "text-white/55 hover:text-white" : "text-zinc-400 hover:text-zinc-800"}`}>Sign in</Link>
      <Link href="/sign-up" className={`font-sans text-[10px] tracking-[0.18em] uppercase font-medium px-4 py-2 rounded-full transition-all ${onDark ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-700"}`}>Join</Link>
    </div>
  );
}

export default function NavbarAuth({ mobile = false, onDark = false }: Props) {
  return CLERK_ENABLED
    ? <ClerkButtons mobile={mobile} onDark={onDark} />
    : <FallbackLinks mobile={mobile} onDark={onDark} />;
}
