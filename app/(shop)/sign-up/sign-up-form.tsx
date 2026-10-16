"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormError, Submit } from "@/components/ui/form";
import { shopSignUp, type ShopAuthState } from "../auth-actions";
import { ConfirmStep, Notice } from "../confirm-step";

export function ShopSignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ShopAuthState, FormData>(shopSignUp, { step: "credentials" });
  const signInHref = `/sign-in?next=${encodeURIComponent(next)}`;

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <Notice message={"notice" in state ? state.notice : undefined} />

      {state.step === "confirm" ? (
        <ConfirmStep email={state.email} pending={pending} />
      ) : "notice" in state && state.notice ? (
        <Link href={signInHref} className="rounded-md bg-zinc-900 px-4 py-2 text-center font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
          Sign in
        </Link>
      ) : (
        <>
          <Field label="Your name" name="name" autoComplete="name" required maxLength={100} autoFocus />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            hint="At least 10 characters, with a lower case letter and a number."
          />
          <Submit pending={pending}>Create account</Submit>
          <p className="text-sm">
            Already have an account? <Link href={signInHref} className="underline underline-offset-4">Sign in</Link>
          </p>
        </>
      )}
    </form>
  );
}
