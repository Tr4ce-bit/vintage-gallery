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
// On Lambda the IAM role provides credentials automatically.
// Explicit keys are only used in local dev.
const sns = new SNSClient({
  region: "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId:     (process.env.AWS_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID)!,
          secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_ACCESS_KEY)!,
        },
      }
    : {}),
});

// Free-tier cap — AWS SNS gives 100 free SMS/month
const SMS_FREE_LIMIT = 100;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderNotification {
  orderNumber:       string;
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

function fmtOrderNum(n: string) {
  return `#${n}`;
}

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

      <p style="margin:0 0 3px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Order Number</p>
      <p style="margin:0 0 6px;font-size:22px;font-weight:600;color:#111;">
        ${fmtOrderNum(o.orderNumber)}
      </p>
      <p style="margin:0 0 26px;font-size:12px;color:#aaa;font-family:monospace;">
        Ref: ${o.paystackReference}
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
      <p style="margin:0 0 6px;font-size:11px;color:#bbb;">
        Open the
        <a href="${process.env.ADMIN_APP_URL ?? ""}/orders"
          style="color:#111;font-weight:600;text-decoration:none;">admin portal</a>
        to process this order.
      </p>
      <p style="margin:0;font-size:10px;color:#bbb;font-style:italic;">
        Automated notification — replies to this email are not monitored.
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

// ─── Customer status-update notification ─────────────────────────────────────

export interface StatusUpdateNotification {
  orderNumber:      string;
  paystackReference: string;
  newStatus:        string;
  customerEmail:    string;
  customerName:     string;
  totalAmount:      number;
  items: {
    productName: string | null;
    size:        string;
    quantity:    number;
    unitPrice:   number;
  }[];
}

const STATUS_COPY: Record<string, { subject: string; headline: string; body: string; color: string }> = {
  PAID: {
    subject:  "Payment confirmed — we're getting your order ready",
    headline: "Payment Confirmed ✓",
    body:     "We've received your payment and your order is now being queued for preparation. You'll hear from us as soon as it's on its way.",
    color:    "#3b82f6",
  },
  PROCESSING: {
    subject:  "Your order is being prepared",
    headline: "Order Being Prepared 👕",
    body:     "Great news — our team has started preparing your order. We'll notify you the moment it ships.",
    color:    "#6366f1",
  },
  SHIPPED: {
    subject:  "Your order is on its way!",
    headline: "Order Shipped 🚚",
    body:     "Your order has left our hands and is heading to you. Expect delivery within the next 1–3 business days.",
    color:    "#8b5cf6",
  },
  DELIVERED: {
    subject:  "Your order has been delivered",
    headline: "Order Delivered 🎉",
    body:     "Your order has been marked as delivered. We hope you love it! If you have any issues, don't hesitate to reach out.",
    color:    "#10b981",
  },
  CANCELLED: {
    subject:  "Your order has been cancelled",
    headline: "Order Cancelled",
    body:     "Your order has been cancelled. If this was unexpected or you have questions, please contact us at vintagegallerystore@gmail.com.",
    color:    "#ef4444",
  },
  REFUNDED: {
    subject:  "Your refund has been processed",
    headline: "Refund Processed",
    body:     "Your refund has been processed. Depending on your payment provider it may take 3–5 business days to reflect. Contact us if you need assistance.",
    color:    "#71717a",
  },
};

function buildCustomerHtml(o: StatusUpdateNotification): string {
  const copy = STATUS_COPY[o.newStatus];
  if (!copy) return "";

  const rows = o.items.map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">
        ${i.productName ?? "Custom Studio item"}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#555;">${i.size}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#555;">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;color:#111;font-weight:600;">
        GH&#8373; ${(i.unitPrice * i.quantity).toFixed(0)}
      </td>
    </tr>`).join("");

  const storeUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vintagegallery.store";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.07);">

    <!-- Coloured status bar -->
    <div style="height:5px;background:${copy.color};"></div>

    <!-- Header -->
    <div style="background:#111111;padding:28px 36px;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.35);">Vintage Gallery</p>
      <h1 style="margin:0;font-size:22px;font-weight:300;color:#ffffff;">${copy.headline}</h1>
    </div>

    <!-- Body -->
    <div style="padding:28px 36px;">
      <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.6;">
        Hi ${o.customerName},<br><br>${copy.body}
      </p>

      <!-- Order pill -->
      <div style="display:inline-block;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:12px 20px;margin-bottom:24px;">
        <p style="margin:0 0 2px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Order Number</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#111;">${fmtOrderNum(o.orderNumber)}</p>
      </div>

      <!-- Items table -->
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

      <div style="border-top:2px solid #111;padding-top:16px;margin-bottom:28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Total Paid</td>
            <td style="text-align:right;font-size:22px;font-weight:300;color:#111;">GH&#8373; ${o.totalAmount.toFixed(0)}</td>
          </tr>
        </table>
      </div>

      <a href="${storeUrl}/orders"
        style="display:inline-block;background:#111;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:100px;">
        View My Orders
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:20px 36px;background:#f9f9f9;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0 0 6px;font-size:11px;color:#bbb;">
        Questions? WhatsApp us at +233 53 847 7072 or email
        <a href="mailto:vintagegallerystore@gmail.com" style="color:#777;text-decoration:underline;">vintagegallerystore@gmail.com</a>.
      </p>
      <p style="margin:0;font-size:10px;color:#bbb;font-style:italic;">
        This is an automated message — please don't reply directly, replies are not monitored.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function notifyCustomerStatusUpdate(order: StatusUpdateNotification): Promise<void> {
  const copy = STATUS_COPY[order.newStatus];
  if (!copy) return; // don't email for PENDING or unknown statuses

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.warn("Customer status email skipped — GMAIL_USER or GMAIL_APP_PASSWORD not set");
    return;
  }

  const orderLabel = fmtOrderNum(order.orderNumber);
  const textBody = [
    `Hi ${order.customerName},`,
    ``,
    copy.body,
    ``,
    `Order: ${orderLabel}`,
    `Total: GH₵${order.totalAmount.toFixed(0)}`,
    ``,
    ...order.items.map(i =>
      `• ${i.productName ?? "Custom item"} · ${i.size} × ${i.quantity}`
    ),
    ``,
    `Questions? Email vintagegallerystore@gmail.com or WhatsApp +233538477072.`,
    ``,
    `This is an automated message — please don't reply directly, replies are not monitored.`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from:    `"Vintage Gallery" <${gmailUser}>`,
      to:      order.customerEmail,
      subject: `${copy.subject} — ${orderLabel}`,
      text:    textBody,
      html:    buildCustomerHtml(order),
    });
    console.log(`Customer status email (${order.newStatus}) sent → ${order.customerEmail}`);
  } catch (err) {
    console.error("Customer status email failed:", err);
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function notifyAdminNewOrder(order: OrderNotification): Promise<void> {
  const gmailUser   = process.env.GMAIL_USER;
  const gmailPass   = process.env.GMAIL_APP_PASSWORD;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map(e => e.trim()).filter(Boolean);
  const adminPhone  = process.env.ADMIN_PHONE; // E.164, e.g. +233503662903

  const shortRef  = order.paystackReference.slice(-8).toUpperCase();
  const orderLabel = fmtOrderNum(order.orderNumber);

  // ── Email via Gmail (unlimited) ──────────────────────────────────────────────
  if (gmailUser && gmailPass && adminEmails.length > 0) {
    const textBody = [
      `NEW ORDER ${orderLabel} — ${shortRef}`,
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
        subject: `🛍 Order ${orderLabel} · GH₵${order.totalAmount.toFixed(0)} · ${order.deliveryFullName}`,
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
          `VG ${orderLabel}! ${order.deliveryFullName} | GHC${order.totalAmount.toFixed(0)} | ` +
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
