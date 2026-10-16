"use client";

import { useActionState } from "react";
import { Field, FormError, Submit } from "@/components/ui/form";
import { shopResetPassword, type ShopAuthState } from "../auth-actions";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<ShopAuthState, FormData>(shopResetPassword, { step: "credentials" });

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      {state.step === "reset" ? (
        <>
          <input type="hidden" name="intent" value="reset" />
          <input type="hidden" name="email" value={state.email} />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            If {state.email} has an account, we&apos;ve emailed it a 6-digit code.
          </p>
          <Field label="6-digit code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required autoFocus />
          <Field
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            hint="At least 10 characters, with a lower case letter and a number."
          />
          <Submit pending={pending}>Change password</Submit>
        </>
      ) : (
        <>
          <Field label="Email" name="email" type="email" autoComplete="email" required autoFocus />
          <Submit pending={pending}>Email me a code</Submit>
        </>
      )}
    </form>
  );
}
