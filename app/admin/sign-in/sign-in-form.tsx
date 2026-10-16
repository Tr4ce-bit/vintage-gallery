"use client";

import { useActionState } from "react";
import { Field, FormError, Submit } from "@/components/ui/form";
import { adminSignIn, type AdminSignInState } from "./actions";

export function AdminSignInForm() {
  const [state, action, pending] = useActionState<AdminSignInState, FormData>(adminSignIn, { step: "credentials" });

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="intent" value={state.step} />
      <FormError message={state.error} />

      {state.step === "credentials" && (
        <>
          <Field label="Email" name="email" type="email" autoComplete="username" required autoFocus />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          <Submit pending={pending}>Sign in</Submit>
        </>
      )}

      {state.step === "new-password" && (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Choose a new password for your admin account.</p>
          <Field
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={14}
            hint="At least 14 characters, with upper and lower case letters, a number and a symbol."
          />
          <Field label="Repeat it" name="confirm" type="password" autoComplete="new-password" required minLength={14} />
          <Submit pending={pending}>Save password</Submit>
        </>
      )}

      {state.step === "mfa-setup" && (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Admin accounts need an authenticator app (Google Authenticator, Microsoft Authenticator or 1Password). Scan
            this code with it, then enter the 6-digit code it shows.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL made on the server */}
          <img src={state.qrDataUrl} alt="Authenticator set-up code" width={220} height={220} className="self-center rounded bg-white p-2" />
          <p className="break-all text-center font-mono text-xs text-zinc-500">{state.secretCode}</p>
          <Field label="6-digit code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required autoFocus />
          <Submit pending={pending}>Turn on and sign in</Submit>
        </>
      )}

      {state.step === "mfa-code" && (
        <>
          <Field label="Authenticator code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required autoFocus />
          <Submit pending={pending}>Sign in</Submit>
        </>
      )}
    </form>
  );
}
