"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormError, Submit } from "@/components/ui/form";
import { shopSignIn, type ShopAuthState } from "../auth-actions";
import { ConfirmStep, Notice } from "../confirm-step";

export function ShopSignInForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<ShopAuthState, FormData>(shopSignIn, { step: "credentials", notice });

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <FormError message={state.error} />
      <Notice message={"notice" in state ? state.notice : undefined} />

      {state.step === "confirm" ? (
        <ConfirmStep email={state.email} pending={pending} />
      ) : (
        <>
          <Field label="Email" name="email" type="email" autoComplete="username" required autoFocus />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          <Submit pending={pending}>Sign in</Submit>
          <div className="flex justify-between text-sm">
            <Link href="/forgot-password" className="underline underline-offset-4">Forgot password?</Link>
            <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">Create an account</Link>
          </div>
        </>
      )}
    </form>
  );
}
