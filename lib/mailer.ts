/**
 * Outbound transactional email.
 *
 * Prefers Resend when RESEND_API_KEY is present, and falls back to Gmail SMTP
 * otherwise, so sending keeps working if the key is missing or revoked.
 *
 * Uses Resend's REST API directly rather than their SDK: it is a single POST,
 * it avoids another dependency in the Lambda bundle, and it lets us reuse
 * fetchWithTimeout so a slow provider can't hold a Lambda open for its full
 * 29-second timeout.
 *
 * NOTE: this covers only mail our own code sends — order confirmations, status
 * updates, admin alerts. Cognito sign-up and password-reset codes are sent by
 * Cognito itself and never pass through here; changing those requires a Custom
 * Email Sender Lambda trigger.
 */

import nodemailer from "nodemailer";
import { fetchWithTimeout, FetchTimeoutError } from "./fetch-with-timeout";

const RESEND_KEY  = process.env.RESEND_API_KEY;
const RESEND_URL  = "https://api.resend.com/emails";

// Any address on the verified domain works. Overridable so staging can send
// from a distinct address without a code change.
const MAIL_FROM   = process.env.MAIL_FROM ?? "Vintage Gallery <orders@vintagegallery.store>";
const REPLY_TO    = process.env.MAIL_REPLY_TO ?? "vintagegallerystore@gmail.com";

const gmailUser   = process.env.GMAIL_USER;
const gmailPass   = process.env.GMAIL_APP_PASSWORD;

let _smtp: nodemailer.Transporter | null = null;
function smtp() {
  if (!_smtp) {
    _smtp = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });
  }
  return _smtp;
}

export interface MailArgs {
  to:       string | string[];
  subject:  string;
  html:     string;
  text?:    string;
  replyTo?: string;
}

export interface MailResult {
  ok:       boolean;
  provider: "resend" | "gmail" | "none";
  id?:      string;
  error?:   string;
}

/** True when at least one provider is usable. Callers gate on this rather than
 *  on Gmail specifically, so mail still sends on a Resend-only deployment. */
export function mailerConfigured(): boolean {
  return Boolean(RESEND_KEY || (gmailUser && gmailPass));
}

/**
 * Sends one email. Never throws — callers treat delivery as best-effort and
 * must not fail an order because a notification bounced.
 */
export async function sendMail(args: MailArgs): Promise<MailResult> {
  const to = Array.isArray(args.to) ? args.to : [args.to];
  if (to.length === 0 || !to[0]) return { ok: false, provider: "none", error: "no recipient" };

  if (RESEND_KEY) {
    const viaResend = await sendViaResend(to, args);
    if (viaResend.ok) return viaResend;
    // Fall through to SMTP so a Resend outage doesn't silently drop mail.
    console.warn("mailer: Resend failed, falling back to SMTP —", viaResend.error);
  }

  return sendViaSmtp(to, args);
}

async function sendViaResend(to: string[], args: MailArgs): Promise<MailResult> {
  try {
    const res = await fetchWithTimeout(RESEND_URL, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:     MAIL_FROM,
        to,
        subject:  args.subject,
        html:     args.html,
        ...(args.text ? { text: args.text } : {}),
        reply_to: args.replyTo ?? REPLY_TO,
      }),
      timeoutMs: 8_000,
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, provider: "resend", error: `HTTP ${res.status} ${body?.message ?? ""}`.trim() };
    }
    return { ok: true, provider: "resend", id: body?.id };
  } catch (err) {
    const msg = err instanceof FetchTimeoutError ? "timed out" : (err as Error).message;
    return { ok: false, provider: "resend", error: msg };
  }
}

async function sendViaSmtp(to: string[], args: MailArgs): Promise<MailResult> {
  if (!gmailUser || !gmailPass) {
    return { ok: false, provider: "none", error: "no mail provider configured" };
  }
  try {
    const info = await smtp().sendMail({
      from:    `"Vintage Gallery" <${gmailUser}>`,
      to:      to.join(", "),
      replyTo: args.replyTo ?? REPLY_TO,
      subject: args.subject,
      html:    args.html,
      ...(args.text ? { text: args.text } : {}),
    });
    return { ok: true, provider: "gmail", id: info.messageId };
  } catch (err) {
    return { ok: false, provider: "gmail", error: (err as Error).message };
  }
}
