"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import QRCode from "qrcode";
import { z } from "zod";
import { startAdminSession } from "@/lib/auth/admin";
import { assertSite } from "@/lib/auth/host";
import { clearChallenge, readChallenge, saveChallenge } from "@/lib/auth/challenge";
import {
  answerMfaCode,
  answerNewPassword,
  authErrorMessage,
  finishMfaSetup,
  poolConfig,
  signIn,
  startMfaSetup,
  type AuthStep,
} from "@/lib/auth/cognito";

export type AdminSignInState =
  | { step: "credentials"; error?: string }
  | { step: "new-password"; error?: string }
  | { step: "mfa-setup"; error?: string; qrDataUrl: string; secretCode: string }
  | { step: "mfa-code"; error?: string };

const Email = z.string().trim().toLowerCase().email();
const Code = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code");

export async function adminSignIn(_prev: AdminSignInState, form: FormData): Promise<AdminSignInState> {
  await assertSite("admin");
  const cfg = poolConfig("admin");
  const intent = form.get("intent");

  try {
    if (intent === "credentials") {
      const email = Email.safeParse(form.get("email"));
      const password = String(form.get("password") ?? "");
      if (!email.success || !password) return { step: "credentials", error: "Enter your email and password." };
      return await next(email.data, await signIn(cfg, email.data, password));
    }

    const challenge = await readChallenge();
    if (!challenge) return { step: "credentials", error: "That took too long. Please sign in again." };

    if (intent === "new-password" && challenge.step === "new-password") {
      const password = String(form.get("password") ?? "");
      if (password !== String(form.get("confirm") ?? "")) return { step: "new-password", error: "The passwords don't match." };
      return await next(challenge.email, await answerNewPassword(cfg, challenge.email, challenge.session, password));
    }
    if (intent === "mfa-setup" && challenge.step === "mfa-setup") {
      const code = Code.safeParse(form.get("code"));
      if (!code.success) return { ...(await mfaSetupState(challenge.email, challenge.session)), error: "Enter the 6-digit code." };
      return await next(challenge.email, await finishMfaSetup(cfg, challenge.email, challenge.session, code.data));
    }
    if (intent === "mfa-code" && challenge.step === "mfa-code") {
      const code = Code.safeParse(form.get("code"));
      if (!code.success) return { step: "mfa-code", error: "Enter the 6-digit code." };
      return await next(challenge.email, await answerMfaCode(cfg, challenge.email, challenge.session, code.data));
    }
    return { step: "credentials", error: "Please sign in again." };
  } catch (err) {
    unstable_rethrow(err); // let the post-sign-in redirect through
    const challenge = await readChallenge();
    // A bad code keeps you on the same step; anything else starts over.
    const sameStep = ["CodeMismatchException", "EnableSoftwareTokenMFAException", "InvalidPasswordException"].includes(
      (err as { name?: string }).name ?? "",
    );
    if (sameStep && challenge?.step === "mfa-code") return { step: "mfa-code", error: authErrorMessage(err) };
    if (sameStep && challenge?.step === "new-password") return { step: "new-password", error: authErrorMessage(err) };
    if (sameStep && challenge?.step === "mfa-setup") {
      const retry = await mfaSetupState(challenge.email, challenge.session).catch(() => null);
      if (retry) return { ...retry, error: authErrorMessage(err) };
    }
    await clearChallenge();
    return { step: "credentials", error: authErrorMessage(err) };
  }
}

async function next(email: string, result: AuthStep): Promise<AdminSignInState> {
  switch (result.step) {
    case "done": {
      await clearChallenge();
      const session = await startAdminSession(result.tokens);
      if (!session) return { step: "credentials", error: "This account doesn't have admin access." };
      redirect("/");
    }
    case "new-password":
      await saveChallenge({ email, session: result.session, step: "new-password" });
      return { step: "new-password" };
    case "mfa-setup": {
      const setup = await startMfaSetup(result.session);
      await saveChallenge({ email, session: setup.session, step: "mfa-setup" });
      return { step: "mfa-setup", secretCode: setup.secretCode, qrDataUrl: await qr(email, setup.secretCode) };
    }
    case "mfa-code":
      await saveChallenge({ email, session: result.session, step: "mfa-code" });
      return { step: "mfa-code" };
    case "unsupported":
      await clearChallenge();
      return { step: "credentials", error: "This sign-in step isn't supported. Contact the site owner." };
  }
}

// A failed set-up code needs the QR code again, but Cognito only shows the
// secret once per session, so start set-up afresh from the stored session.
async function mfaSetupState(email: string, session: string): Promise<Extract<AdminSignInState, { step: "mfa-setup" }>> {
  const setup = await startMfaSetup(session);
  await saveChallenge({ email, session: setup.session, step: "mfa-setup" });
  return { step: "mfa-setup", secretCode: setup.secretCode, qrDataUrl: await qr(email, setup.secretCode) };
}

function qr(email: string, secret: string) {
  const uri = `otpauth://totp/${encodeURIComponent(`Vintage Gallery admin:${email}`)}?secret=${secret}&issuer=${encodeURIComponent("Vintage Gallery")}`;
  return QRCode.toDataURL(uri, { margin: 1, width: 220 });
}

