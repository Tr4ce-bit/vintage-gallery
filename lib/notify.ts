/**
 * Admin notifications — fired when a new order is paid.
 * Sends an email via AWS SES and an SMS via AWS SNS.
 *
 * Required env vars:
 *   ADMIN_EMAILS   — comma-separated admin emails (first one is used as FROM + TO)
 *   ADMIN_PHONE    — admin phone in E.164 format, e.g. +233503662903
 *   AWS_SES_REGION — region where your SES identity is verified (e.g. us-east-1)
 *   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY — must have ses:SendEmail + sns:Publish
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SNSClient, PublishCommand }   from "@aws-sdk/client-sns";

// SES client — region must match where you verified your email identity
const ses = new SESClient({
  region: process.env.AWS_SES_REGION ?? "us-east-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// SNS SMS — always us-east-1 for global SMS delivery
const sns = new SNSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;color:#111;font-weight:500;">
        GH₵ ${(i.unitPrice * i.quantity).toFixed(0)}
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
        New Order Received 🛍
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:30px 36px;">

      <!-- Ref -->
      <p style="margin:0 0 3px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Order Reference</p>
      <p style="margin:0 0 26px;font-size:15px;font-weight:600;color:#111;font-family:monospace;">
        ${o.paystackReference}
      </p>

      <!-- Customer -->
      <p style="margin:0 0 3px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Customer</p>
      <p style="margin:0 0 2px;font-size:15px;color:#111;">${o.deliveryFullName}</p>
      <p style="margin:0 0 2px;font-size:13px;color:#666;">${o.deliveryPhone}</p>
      <p style="margin:0 0 26px;font-size:13px;color:#666;">
        ${o.deliveryAddress}, ${o.deliveryCity}, ${o.deliveryRegion}
      </p>

      <!-- Items -->
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

      <!-- Total -->
      <div style="border-top:2px solid #111;padding-top:18px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#aaa;">Total Paid</span>
        <span style="font-size:26px;font-weight:300;color:#111;">GH₵ ${o.totalAmount.toFixed(0)}</span>
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

// ─── Main export ──────────────────────────────────────────────────────────────

export async function notifyAdminNewOrder(order: OrderNotification): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAILS ?? "").split(",")[0]?.trim();
  const adminPhone = process.env.ADMIN_PHONE; // E.164, e.g. +233503662903

  if (!adminEmail && !adminPhone) {
    console.warn("notifyAdminNewOrder: ADMIN_EMAILS and ADMIN_PHONE are both unset — skipping");
    return;
  }

  const shortRef = order.paystackReference.slice(-8).toUpperCase();

  // ── Email via SES ────────────────────────────────────────────────────────────
  if (adminEmail) {
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
      `Full ref: ${order.paystackReference}`,
    ].join("\n");

    try {
      await ses.send(new SendEmailCommand({
        Source:      `Vintage Gallery <${adminEmail}>`,
        Destination: { ToAddresses: [adminEmail] },
        Message: {
          Subject: { Data: `🛍 New Order · GH₵${order.totalAmount.toFixed(0)} · ${order.deliveryFullName}`, Charset: "UTF-8" },
          Body: {
            Text: { Data: textBody,        Charset: "UTF-8" },
            Html: { Data: buildHtml(order), Charset: "UTF-8" },
          },
        },
      }));
      console.log(`Admin email sent → ${adminEmail}`);
    } catch (err) {
      console.error("Admin email (SES) failed:", err);
    }
  }

  // ── SMS via SNS ──────────────────────────────────────────────────────────────
  if (adminPhone) {
    const sms = `VG Order! ${order.deliveryFullName} · GH₵${order.totalAmount.toFixed(0)} · ${order.items.length} item(s) · ...${shortRef}`;
    try {
      await sns.send(new PublishCommand({
        PhoneNumber: adminPhone,
        Message:     sms,
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType":  { DataType: "String", StringValue: "Transactional" },
          "AWS.SNS.SMS.SenderID": { DataType: "String", StringValue: "VintageGal" },
        },
      }));
      console.log(`Admin SMS sent → ${adminPhone}`);
    } catch (err) {
      console.error("Admin SMS (SNS) failed:", err);
    }
  }
}
