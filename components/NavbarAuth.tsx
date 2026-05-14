"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

// NEXT_PUBLIC_* vars are inlined at build time.
// Build 1 (no key set) → CLERK_ENABLED = false → plain links, no hook calls, no crash.
// Build 2 (key added in Amplify) → CLERK_ENABLED = true → full Clerk UI.
const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface Props { mobile?: boolean }

// Only rendered when CLERK_ENABLED = true (i.e., inside ClerkProvider)
function ClerkButtons({ mobile }: Props) {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
    );
  }

  if (mobile) {
    return (
      <>
        <SignInButton mode="modal">
          <button className="text-sm text-brand-cream/50">Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="btn-gold !px-6 !py-2 text-xs">Join</button>
        </SignUpButton>
      </>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <SignInButton mode="modal">
        <button className="text-xs tracking-widest uppercase text-brand-cream/50 hover:text-brand-gold transition-colors">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="btn-outline-gold !px-4 !py-2 text-xs">Join</button>
      </SignUpButton>
    </div>
  );
}

// Plain links — shown when Clerk isn't configured yet
function FallbackLinks({ mobile }: Props) {
  if (mobile) {
    return (
      <>
        <a href="/sign-in" className="text-sm text-brand-cream/50">Sign In</a>
        <a href="/sign-up" className="btn-gold !px-6 !py-2 text-xs">Join</a>
      </>
    );
  }
  return (
    <div className="hidden md:flex items-center gap-3">
      <a href="/sign-in" className="text-xs tracking-widest uppercase text-brand-cream/50 hover:text-brand-gold transition-colors">
        Sign In
      </a>
      <a href="/sign-up" className="btn-outline-gold !px-4 !py-2 text-xs">Join</a>
    </div>
  );
}

export default function NavbarAuth({ mobile = false }: Props) {
  return CLERK_ENABLED ? <ClerkButtons mobile={mobile} /> : <FallbackLinks mobile={mobile} />;
}
