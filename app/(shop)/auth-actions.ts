"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import {
  authErrorMessage,
  confirmForgotPassword,
  confirmSignUp,
  forgotPassword,
  poolConfig,
  resendCode,
  signIn,
  signUp,
} from "@/lib/auth/cognito";
import { assertSite } from "@/lib/auth/host";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { endShopSession, startShopSession } from "@/lib/auth/shop";

// Shopper accounts: sign-in, sign-up with an emailed code, and password
// reset. All of it runs on the server against the shop user pool.

export type ShopAuthState =
  | { step: "credentials"; error?: string; notice?: string }
  | { step: "confirm"; email: string; error?: string; notice?: string }
  | { step: "reset"; email: string; error?: string };

const Email = z.string().trim().toLowerCase().email();
const Code = z.string().trim().regex(/^\d{6}$/);

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}

export async function shopSignIn(_prev: ShopAuthState, form: FormData): Promise<ShopAuthState> {
  await assertSite("shop");
  const cfg = poolConfig("shop");
  const next = safeRedirectPath(text(form, "next"), "/account");

  if (text(form, "intent") === "confirm") return confirm(form, { step: "credentials", notice: "Email confirmed. Sign in to continue." });

  const email = Email.safeParse(form.get("email"));
  const password = text(form, "password");
  if (!email.success || !password) return { step: "credentials", error: "Enter your email and password." };
  try {
    const result = await signIn(cfg, email.data, password);
    // The shop pool has no MFA, so anything but "done" is unexpected.
    if (result.step !== "done") return { step: "credentials", error: "This account can't sign in here. Contact us for help." };
    if (!(await startShopSession(result.tokens))) return { step: "credentials", error: authErrorMessage(null) };
  } catch (err) {
    if ((err as { name?: string }).name === "UserNotConfirmedException") {
      await resendCode(cfg, email.data).catch(() => undefined);
      return { step: "confirm", email: email.data, notice: "Your email isn't confirmed yet. We've sent you a new code." };
    }
    return { step: "credentials", error: authErrorMessage(err) };
  }
  redirect(next);
}

export async function shopSignUp(_prev: ShopAuthState, form: FormData): Promise<ShopAuthState> {
  await assertSite("shop");
  const cfg = poolConfig("shop");

  if (text(form, "intent") === "confirm") return confirm(form, { step: "credentials", notice: "Email confirmed. Sign in to continue." });

  const email = Email.safeParse(form.get("email"));
  const name = text(form, "name").trim().slice(0, 100);
  const password = text(form, "password");
  if (!email.success || !name || !password) return { step: "credentials", error: "Fill in your name, email and a password." };
  try {
    await signUp(cfg, email.data, password, name);
  } catch (err) {
    return { step: "credentials", error: authErrorMessage(err) };
  }
  return { step: "confirm", email: email.data, notice: `We've sent a 6-digit code to ${email.data}.` };
}

/** Shared by sign-in and sign-up: checks the emailed code, then asks the person to sign in. */
async function confirm(form: FormData, onDone: ShopAuthState): Promise<ShopAuthState> {
  const cfg = poolConfig("shop");
  const email = Email.safeParse(form.get("email"));
  if (!email.success) return { step: "credentials", error: "Please start again." };
  if (text(form, "resend")) {
    await resendCode(cfg, email.data).catch(() => undefined);
    return { step: "confirm", email: email.data, notice: "We've sent a new code." };
  }
  const code = Code.safeParse(form.get("code"));
  if (!code.success) return { step: "confirm", email: email.data, error: "Enter the 6-digit code from the email." };
  try {
    await confirmSignUp(cfg, email.data, code.data);
  } catch (err) {
    return { step: "confirm", email: email.data, error: authErrorMessage(err) };
  }
  return onDone;
}

export async function shopResetPassword(_prev: ShopAuthState, form: FormData): Promise<ShopAuthState> {
  await assertSite("shop");
  const cfg = poolConfig("shop");
  const email = Email.safeParse(form.get("email"));
  if (!email.success) return { step: "credentials", error: "Enter your email address." };

  if (text(form, "intent") !== "reset") {
    try {
      await forgotPassword(cfg, email.data);
    } catch (err) {
      // Cognito hides whether the account exists; so do we, apart from rate limits.
      const name = (err as { name?: string }).name ?? "";
      if (/LimitExceeded|TooMany/.test(name)) return { step: "credentials", error: authErrorMessage(err) };
    }
    return { step: "reset", email: email.data };
  }

  const code = Code.safeParse(form.get("code"));
  const password = text(form, "password");
  if (!code.success || !password) return { step: "reset", email: email.data, error: "Enter the code and a new password." };
  try {
    await confirmForgotPassword(cfg, email.data, code.data, password);
  } catch (err) {
    unstable_rethrow(err);
    return { step: "reset", email: email.data, error: authErrorMessage(err) };
  }
  redirect("/sign-in?reset=1");
}

export async function shopSignOut() {
  await assertSite("shop");
  await endShopSession();
  redirect("/");
}
