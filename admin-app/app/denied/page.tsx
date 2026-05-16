"use client";

import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { ShieldOff } from "lucide-react";

export default function DeniedPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <ShieldOff size={40} strokeWidth={1} className="text-zinc-600 mx-auto mb-6" />
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-600 font-light mb-3">Access Denied</p>
        <h1 className="font-serif text-white mb-2" style={{ fontSize: "1.8rem", fontWeight: 300 }}>
          Not authorised
        </h1>
        <p className="font-sans text-sm text-zinc-500 mb-8">
          Your account does not have admin privileges.
        </p>
        <button
          onClick={async () => { await signOut(); router.replace("/sign-in"); }}
          className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-6 py-2.5 rounded-full transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
