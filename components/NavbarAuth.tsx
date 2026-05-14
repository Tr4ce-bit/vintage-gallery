"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface Props { mobile?: boolean }

function ClerkButtons({ mobile }: Props) {
  const { isSignedIn } = useUser();
  if (isSignedIn) return <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />;
  if (mobile) return (
    <>
      <SignInButton mode="modal">
        <button className="font-sans text-sm text-white/40 tracking-widest uppercase font-light">Sign In</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="btn-primary !px-5 !py-2.5 !text-[9px]">Join</button>
      </SignUpButton>
    </>
  );
  return (
    <div className="hidden md:flex items-center gap-4">
      <SignInButton mode="modal">
        <button className="font-sans text-[9px] tracking-[0.28em] uppercase text-white/30 hover:text-white transition-colors font-light">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="btn-outline !px-4 !py-2 !text-[9px]">Join</button>
      </SignUpButton>
    </div>
  );
}

function FallbackLinks({ mobile }: Props) {
  if (mobile) return (
    <>
      <a href="/sign-in" className="font-sans text-sm text-white/40 tracking-widest uppercase font-light">Sign In</a>
      <a href="/sign-up" className="btn-primary !px-5 !py-2.5 !text-[9px]">Join</a>
    </>
  );
  return (
    <div className="hidden md:flex items-center gap-4">
      <a href="/sign-in" className="font-sans text-[9px] tracking-[0.28em] uppercase text-white/30 hover:text-white transition-colors font-light">
        Sign In
      </a>
      <a href="/sign-up" className="btn-outline !px-4 !py-2 !text-[9px]">Join</a>
    </div>
  );
}

export default function NavbarAuth({ mobile = false }: Props) {
  return CLERK_ENABLED ? <ClerkButtons mobile={mobile} /> : <FallbackLinks mobile={mobile} />;
}
