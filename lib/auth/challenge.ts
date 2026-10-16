import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { CHALLENGE_COOKIE, CHALLENGE_SECONDS, sessionCookieOptions } from "./cookies";

// Cognito hands back a short-lived Session string between sign-in steps
// (new password, authenticator set-up, authenticator code). It is kept in an
// httpOnly cookie so the browser never sees or chooses it.

const Challenge = z.object({
  email: z.string().email(),
  session: z.string().min(1),
  step: z.enum(["new-password", "mfa-setup", "mfa-code"]),
});
export type Challenge = z.infer<typeof Challenge>;

export async function saveChallenge(c: Challenge) {
  (await cookies()).set(CHALLENGE_COOKIE, JSON.stringify(c), sessionCookieOptions(CHALLENGE_SECONDS));
}

export async function readChallenge(): Promise<Challenge | null> {
  const raw = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  if (!raw) return null;
  try {
    return Challenge.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function clearChallenge() {
  (await cookies()).delete(CHALLENGE_COOKIE);
}
