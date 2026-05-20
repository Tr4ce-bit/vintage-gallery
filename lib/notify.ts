/**
 * Admin notifications — fired when a new order is paid.
 *
 * EMAIL  → Gmail SMTP via nodemailer (unlimited, free)
 * SMS    → AWS SNS (100 free SMS/month; hard-stops at 100 and resumes next month)
 *
 * Required env vars:
 *   GMAIL_USER         — vintagegallerystore@gmail.com
 *   GMAIL_APP_PASSWORD — 16-char App Password (Google Account → Security → App Passwords)
 *   ADMIN_EMAILS       — comma-separated admin emails
 *   ADMIN_PHONE        — E.164 format, e.g. +233503662903
 *   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY — already set for S3; must also have sns:Publish
 */

import nodemailer              from "nodemailer";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { prisma }              from "@/lib/db";

// ── Gmail SMTP transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── SNS client (us-east-1 handles global SMS) ────────────────────────────────
// Falls back to S3_* keys since those are what's set in Amplify env vars
const sns = new SNSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId:     (process.env.AWS_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_ACCESS_KEY)!,
  },
});

// Free-tier cap — AWS SNS gives 100 free SMS/month
const SMS_FREE_LIMIT = 100;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderNotification {
  paystackReference: string;
  totalAmount:       number;
  deliveryFullName:  string;
  deliveryPhone:     string;
  deliveryAddress:   string;
  deliveryCity:      string;
  deliveryRegion:    string;
  items: {
    productName: string | null;
    size:        string;
    quantity:    number;
    unitPrice:   number;
  }[];
}

// ─── HTML email template ──────────────────────────────────────────────────────

function buildHtml(o: OrderNotification): string {
  const rows = o.items.map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">
        ${i.productName ?? "Custom Studio item"}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#555;">
        ${i.size}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#555;">
        ${i.quantity}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;color:#111;font-weight:600;">
        GH&#8373; ${(i.unitPrice * i.quantity).toFixed(0)}
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.07);">

    <!-- Header -->
    <div style="background:#111111;padding:30px 36px;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.35);">
        Vintage Gallery
      </p>
      <h1 style="margin:0;font-size:24px;font-weight:300;color:#ffffff;">
        New Order Received &#128717;
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:30px 36px;">

      <p style="margin:0 0 3px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Order Reference</p>
      <p style="margin:0 0 26px;font-size:15px;font-weight:600;color:#111;font-family:monospace;">
        ${o.paystackReference}
      </p>

      <p style="margin:0 0 3px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Customer</p>
      <p style="margin:0 0 2px;font-size:15px;color:#111;">${o.deliveryFullName}</p>
      <p style="margin:0 0 2px;font-size:13px;color:#666;">${o.deliveryPhone}</p>
      <p style="margin:0 0 26px;font-size:13px;color:#666;">
        ${o.deliveryAddress}, ${o.deliveryCity}, ${o.deliveryRegion}
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="border-collapse:collapse;margin-bottom:20px;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f9f9f9;">
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:500;">Item</th>
            <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:500;">Size</th>
            <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:500;">Qty</th>
            <th style="padding:10px 14px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:500;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="border-top:2px solid #111;padding-top:18px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Total Paid</td>
            <td style="text-align:right;font-size:26px;font-weight:300;color:#111;">GH&#8373; ${o.totalAmount.toFixed(0)}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 36px;background:#f9f9f9;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:11px;color:#bbb;">
        Open the
        <a href="https://master.d3ic7vfcs7q16g.amplifyapp.com/orders"
          style="color:#111;font-weight:600;text-decoration:none;">admin portal</a>
        to process this order.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── SMS monthly counter (uses existing Settings table) ───────────────────────

/** Returns current month key, e.g. "sms_count_2025-05" */
function monthKey(): string {
  return `sms_count_${new Date().toISOString().slice(0, 7)}`;
}

/** Reads this month's SMS count from the DB. Returns 0 if no record yet. */
async function getSmsCount(): Promise<number> {
  const row = await prisma.settings.findUnique({ where: { key: monthKey() } });
  return parseInt(row?.value ?? "0", 10);
}

/** Atomically increments this month's SMS count. */
async function incrementSmsCount(): Promise<void> {
  const key     = monthKey();
  const current = await getSmsCount();
  await prisma.settings.upsert({
    where:  { key },
    create: { key, value: "1" },
    update: { value: String(current + 1) },
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function notifyAdminNewOrder(order: OrderNotification): Promise<void> {
  const gmailUser   = process.env.GMAIL_USER;
  const gmailPass   = process.env.GMAIL_APP_PASSWORD;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map(e => e.trim()).filter(Boolean);
  const adminPhone  = process.env.ADMIN_PHONE; // E.164, e.g. +233503662903

  const shortRef = order.paystackReference.slice(-8).toUpperCase();

  // ── Email via Gmail (unlimited) ──────────────────────────────────────────────
  if (gmailUser && gmailPass && adminEmails.length > 0) {
    const textBody = [
      `NEW ORDER — ${shortRef}`,
      `Customer : ${order.deliveryFullName} (${order.deliveryPhone})`,
      `Address  : ${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryRegion}`,
      ``,
      ...order.items.map(i =>
        `• ${i.productName ?? "Custom item"} · ${i.size} × ${i.quantity} · GH₵${(i.unitPrice * i.quantity).toFixed(0)}`
      ),
      ``,
      `TOTAL: GH₵${order.totalAmount.toFixed(0)}`,
      `Ref: ${order.paystackReference}`,
    ].join("\n");

    try {
      await transporter.sendMail({
        from:    `"Vintage Gallery" <${gmailUser}>`,
        to:      adminEmails.join(", "),
        subject: `🛍 New Order · GH₵${order.totalAmount.toFixed(0)} · ${order.deliveryFullName}`,
        text:    textBody,
        html:    buildHtml(order),
      });
      console.log(`Admin email sent → ${adminEmails.join(", ")}`);
    } catch (err) {
      console.error("Admin email (Gmail) failed:", err);
    }
  } else {
    console.warn("Admin email skipped — GMAIL_USER or GMAIL_APP_PASSWORD not set");
  }

  // ── SMS via AWS SNS — stops at 100/month (free tier) ────────────────────────
  if (adminPhone) {
    try {
      const used = await getSmsCount();

      if (used >= SMS_FREE_LIMIT) {
        console.log(`Admin SMS skipped — monthly free limit reached (${used}/${SMS_FREE_LIMIT}). Resets next month.`);
      } else {
        const smsText =
          `VG Order! ${order.deliveryFullName} | GHC${order.totalAmount.toFixed(0)} | ` +
          `${order.items.length} item(s) | ${order.deliveryCity} | Ref:${shortRef}`;

        await sns.send(new PublishCommand({
          PhoneNumber: adminPhone,
          Message:     smsText,
          MessageAttributes: {
            "AWS.SNS.SMS.SMSType": { DataType: "String", StringValue: "Transactional" },
          },
        }));

        await incrementSmsCount();
        console.log(`Admin SMS sent → ${adminPhone} (${used + 1}/${SMS_FREE_LIMIT} this month)`);
      }
    } catch (err) {
      console.error("Admin SMS (SNS) failed:", err);
    }
  } else {
    console.warn("Admin SMS skipped — ADMIN_PHONE not set");
  }
}
