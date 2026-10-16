import { Field, Submit } from "@/components/ui/form";

// The "enter the code we emailed you" step, used by sign-in and sign-up.
export function ConfirmStep({ email, pending }: { email: string; pending: boolean }) {
  return (
    <>
      <input type="hidden" name="intent" value="confirm" />
      <input type="hidden" name="email" value={email} />
      <Field label="6-digit code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" autoFocus />
      <Submit pending={pending}>Confirm email</Submit>
      <button type="submit" name="resend" value="1" formNoValidate className="text-sm underline underline-offset-4">
        Send a new code
      </button>
    </>
  );
}

export function Notice({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">{message}</p>;
}
