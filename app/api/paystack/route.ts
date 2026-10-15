import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { generateOrderId } from "@/lib/order-id";
import { resolveRain } from "@/lib/delivery";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/fetch-with-timeout";
import { isSamedayRegionAllowed, samedayRegions } from "@/lib/sameday";
import { verifyPaystack, markOrderPaid } from "@/lib/orders";
import { randomUUID } from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE   = "https://api.paystack.co";

/** Resolve delivery fee from DB settings + live weather. Never throws. */
async function resolveDeliveryFee(deliveryType: "standard" | "sameday" = "standard"): Promise<number> {
  try {
    const rows = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "delivery_standard",
            "delivery_sameday",
            "delivery_sameday_rain_surcharge",
            "delivery_rain_enabled",
            "delivery_rain_mode",
          ],
        },
      },
    });
    const cfg: Record<string, string> = {};
    for (const r of rows) cfg[r.key] = r.value;

    if (deliveryType === "sameday") {
      const base      = Number(cfg.delivery_sameday                ?? 50);
      const surcharge = Number(cfg.delivery_sameday_rain_surcharge ?? 20);
      // Same resolver the display endpoint uses — charge matches what's shown.
      const rain = await resolveRain(cfg);
      return rain.isRaining ? base + surcharge : base;
    }

    return Number(cfg.delivery_standard ?? 30);
  } catch {
    // Fallback to safe default so payment never fails
    return deliveryType === "sameday" ? 50 : 30;
  }
}

// Hard limits — prevent DoS via oversized payloads / inventory abuse
const MAX_CART_ITEMS  = 20;   // max distinct line items per order
const MAX_QTY_PER_ITEM = 99;  // max quantity for a single item

// Valid payment methods
const VALID_PAYMENT_METHODS = new Set(["momo", "card", "bank_transfer"]);

// Valid MoMo networks accepted by Paystack Ghana
const VALID_MOMO_NETWORKS = new Set(["MTN", "TELECEL", "AIRTELTIGO"]);

// Size enum values the DB accepts
const VALID_SIZES = new Set(["XS", "S", "M", "L", "XL", "XXL"]);

// ── POST /api/paystack  — initialise a transaction + create pending order ────
export async function POST(req: NextRequest) {
  // 10 checkout attempts per IP per minute — prevents spam order creation
  const rl = rateLimit(`checkout:${clientIp(req)}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  // Reject obviously oversized payloads before JSON parsing
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 32_768) { // 32 KB is more than enough for a cart
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  try {
    const body = await req.json();
    const { email, paymentMethod, momoNetwork, momoPhone, cartItems, deliveryInfo, deliveryType } = body;
    const validDeliveryType: "standard" | "sameday" =
      deliveryType === "sameday" ? "sameday" : "standard";

    // ── Strict input validation ───────────────────────────────────────────────
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (cartItems.length > MAX_CART_ITEMS) {
      return NextResponse.json({ error: `Cart cannot exceed ${MAX_CART_ITEMS} items.` }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const method: string = VALID_PAYMENT_METHODS.has(paymentMethod) ? paymentMethod : "momo";

    // Same-day region rule: only Greater Accra (always) and Ashanti (before 12:30
    // Ghana time) qualify. We validate the *server's* current time so a client
    // can't lie about which region is allowed.
    if (validDeliveryType === "sameday") {
      const region = (deliveryInfo?.region ?? "").toString();
      if (!isSamedayRegionAllowed(region)) {
        const allowed = samedayRegions();
        return NextResponse.json(
          { error: `Same-day delivery is currently available only in ${allowed.join(" and ")}. Please pick a same-day-eligible region or switch to standard delivery.` },
          { status: 400 },
        );
      }
    }

    // MoMo-specific validation only when method is momo
    if (method === "momo") {
      if (!VALID_MOMO_NETWORKS.has(momoNetwork)) {
        return NextResponse.json({ error: "Invalid MoMo network." }, { status: 400 });
      }
      if (!isValidPhone(momoPhone)) {
        return NextResponse.json({ error: "Invalid MoMo phone number." }, { status: 400 });
      }
    }

    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Payment service not configured." }, { status: 500 });
    }

    // ── 1. Server-side price recalculation ───────────────────────────────────
    // NEVER trust the client-supplied amount — look up every item from DB.
    let subtotalGHS = 0;

    // Resolve prices for all items
    const resolvedItems: Array<{
      productId:   string | null;
      productName: string;
      size:        string;
      color:       string;
      quantity:    number;
      unitPrice:   number;
      isCustom:    boolean;
    }> = [];

    // Units requested per product+size across all cart lines, for the stock check.
    const requested = new Map<string, number>();

    for (const item of cartItems) {
      const { productId, quantity, name, color } = item;
      const size = String(item.size ?? "M");
      if (!VALID_SIZES.has(size)) {
        return NextResponse.json({ error: "Invalid size in cart." }, { status: 400 });
      }
      if (
        typeof productId !== "string" ||
        !productId ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_QTY_PER_ITEM
      ) {
        return NextResponse.json({ error: "Invalid cart item quantity." }, { status: 400 });
      }

      if (productId.startsWith("custom-")) {
        // Custom studio tee — price from settings table
        const rows = await prisma.settings.findMany({
          where: { key: { in: ["studio_base_price", "studio_design_addon"] } },
        });
        const map: Record<string, number> = { studio_base_price: 150, studio_design_addon: 30 };
        for (const r of rows) map[r.key] = Number(r.value);

        const hasDesign = typeof name === "string" && name.includes("·");
        const unitPrice = map.studio_base_price + (hasDesign ? map.studio_design_addon : 0);
        subtotalGHS += unitPrice * quantity;

        resolvedItems.push({
          productId:   null,
          productName: typeof name === "string" ? name.slice(0, 120) : "Custom Studio Tee",
          size,
          color:       color ?? "",
          quantity,
          unitPrice,
          isCustom:    true,
        });
      } else {
        // Regular product — authoritative price from DB
        const product = await prisma.product.findUnique({
          where:  { id: productId },
          select: { basePrice: true, isActive: true, name: true, stock: true, sizeStock: true },
        });
        if (!product || !product.isActive) {
          return NextResponse.json({ error: `Product ${productId} is unavailable.` }, { status: 400 });
        }

        // Stock check — per size when the product tracks sizes, else global.
        const key   = `${productId}:${size}`;
        const want  = (requested.get(key) ?? 0) + quantity;
        requested.set(key, want);
        const sizes = product.sizeStock as Record<string, number> | null;
        const available = sizes && Object.keys(sizes).length > 0 ? (sizes[size] ?? 0) : product.stock;
        if (want > available) {
          return NextResponse.json(
            { error: available > 0
                ? `Only ${available} left of ${product.name} in size ${size}.`
                : `${product.name} in size ${size} is out of stock.` },
            { status: 409 },
          );
        }

        subtotalGHS += product.basePrice * quantity;

        resolvedItems.push({
          productId,
          productName: product.name,
          size,
          color:       color ?? "",
          quantity,
          unitPrice:   product.basePrice,
          isCustom:    false,
        });
      }
    }

    const deliveryFee   = await resolveDeliveryFee(validDeliveryType);
    const totalGHS      = subtotalGHS + deliveryFee;
    const amountPesewas = Math.round(totalGHS * 100);

    // ── 2. Save the pending order BEFORE sending the customer to pay ─────────
    // We pick the Paystack reference ourselves so the order exists first. If
    // this write fails the customer is never charged — previously the order
    // was saved after initialisation and a failed write was ignored, so a
    // payment could land with no order behind it.
    const reference = `vg_${randomUUID().replace(/-/g, "")}`;
    let orderId: string;
    try {
      const authUser = await getAuthUser(req);

      // Signed-in users: link the order to their profile.
      let profileId: string | null = null;
      if (authUser) {
        const profile = await prisma.userProfile.findUnique({
          where: { cognitoId: authUser.userId },
        });
        if (profile) {
          profileId = profile.id;
        } else {
          try {
            const created = await prisma.userProfile.create({
              data: {
                cognitoId: authUser.userId,
                fullName:  String(deliveryInfo?.fullName ?? "").slice(0, 120),
                email:     (authUser.email ?? email).toLowerCase(),
              },
            });
            profileId = created.id;
          } catch (err) {
            // Email already on another profile (unique) — save as a guest order
            // rather than failing the checkout.
            console.warn("Profile create failed; saving order as guest:", err);
          }
        }
      }

      // Mask MoMo phone number (only for MoMo payments)
      const masked = method === "momo" && momoPhone
        ? (momoPhone.length >= 4
            ? momoPhone.slice(0, 3) + "****" + momoPhone.slice(-3)
            : momoPhone)
        : null;

      const order = await prisma.order.create({
        data: {
          orderNumber:        generateOrderId(),
          userId:             profileId,           // null for guests
          guestEmail:         profileId ? null : email, // store email for guest orders
          paystackReference:  reference,
          totalAmount:        totalGHS,
          deliveryFullName:   String(deliveryInfo?.fullName ?? "").slice(0, 120),
          deliveryPhone:      String(deliveryInfo?.phone    ?? "").slice(0, 20),
          deliveryAddress:    String(deliveryInfo?.address  ?? "").slice(0, 300),
          deliveryCity:       String(deliveryInfo?.city     ?? "").slice(0, 100),
          deliveryRegion:     String(deliveryInfo?.region   ?? "").slice(0, 100),
          deliveryNotes:      deliveryInfo?.notes ? String(deliveryInfo.notes).slice(0, 500) : null,
          momoNetwork:        method === "momo" ? momoNetwork as "MTN" | "TELECEL" | "AIRTELTIGO" : null,
          momoNumberMasked:   masked,
          status:             "PENDING",
          items: {
            create: resolvedItems.map(i => ({
              productId:   i.productId,
              productName: i.productName,
              size:        i.size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
              color:       String(i.color).slice(0, 40),
              quantity:    i.quantity,
              unitPrice:   i.unitPrice,
              subtotal:    i.unitPrice * i.quantity,
            })),
          },
          // PENDING Payment row so the admin Payments page sees the attempt
          // immediately. markOrderPaid() flips it to SUCCESS.
          payments: {
            create: {
              provider:          "PAYSTACK",
              providerReference: reference,
              status:            "PENDING",
              method:            method === "momo"
                ? "MOMO"
                : method === "card"
                  ? "CARD"
                  : "BANK_TRANSFER",
              amount:            totalGHS,
              currency:          "GHS",
              customerEmail:     email,
            },
          },
        },
      });
      orderId = order.id;
    } catch (dbErr) {
      console.error("Order DB creation failed — checkout stopped before payment:", dbErr);
      return NextResponse.json(
        { error: "We couldn't save your order. You have not been charged — please try again." },
        { status: 500 },
      );
    }

    // ── 3. Initialise Paystack transaction ───────────────────────────────────
    // Map our method names to Paystack channel names
    const channelsMap: Record<string, string[]> = {
      momo:          ["mobile_money"],
      card:          ["card"],
      bank_transfer: ["bank_transfer"],
    };

    const paystackPayload: Record<string, unknown> = {
      email,
      reference,
      amount:       amountPesewas,
      currency:     "GHS",
      channels:     channelsMap[method] ?? ["mobile_money"],
      metadata: {
        cartItems,
        deliveryInfo,
        paymentMethod: method,
        serverCalculatedTotal: totalGHS,
        custom_fields: [
          { display_name: "Payment Method", variable_name: "payment_method", value: method },
          { display_name: "Delivery Addr",  variable_name: "gh_address",     value: deliveryInfo?.address },
          ...(method === "momo" ? [
            { display_name: "Network", variable_name: "network", value: momoNetwork },
            { display_name: "Phone",   variable_name: "phone",   value: momoPhone   },
          ] : []),
        ],
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    };

    // MoMo requires the mobile_money object
    if (method === "momo") {
      paystackPayload.mobile_money = {
        phone:    momoPhone,
        provider: momoNetworkToPaystackProvider(momoNetwork),
      };
    }

    // Paystack never took the order — close it so it doesn't sit in PENDING.
    const abandonOrder = () =>
      prisma.order.update({
        where: { id: orderId },
        data:  {
          status:   "CANCELLED",
          payments: { updateMany: { where: { providerReference: reference }, data: { status: "FAILED" } } },
        },
      }).catch(err => console.error("Could not close abandoned order:", err));

    // 10s timeout: payment init can be slow but we never want to hold a
    // customer's spinner for the full Lambda 29s if Paystack is degraded.
    let psRes: Response;
    try {
      psRes = await fetchWithTimeout(`${PAYSTACK_BASE}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body:      JSON.stringify(paystackPayload),
        timeoutMs: 10_000,
      });
    } catch (err) {
      await abandonOrder();
      if (err instanceof FetchTimeoutError) {
        console.warn("paystack init timed out", { url: err.target });
        return NextResponse.json(
          { error: "Payment service is slow right now. Please try again in a moment." },
          { status: 503 },
        );
      }
      throw err;
    }

    const psData = await psRes.json();

    if (!psData.status) {
      await abandonOrder();
      return NextResponse.json(
        { error: psData.message ?? "Paystack declined the request." },
        { status: 400 }
      );
    }

    const { authorization_url, access_code } = psData.data;

    await prisma.order.update({
      where: { id: orderId },
      data:  { paystackAccessCode: access_code },
    }).catch(err => console.error("Could not store Paystack access code:", err));

    return NextResponse.json({
      authorizationUrl: authorization_url,
      accessCode:       access_code,
      reference,
      totalGHS,
    });
  } catch (err) {
    console.error("Paystack init error:", err);
    return NextResponse.json({ error: "Payment initialisation failed." }, { status: 500 });
  }
}

// ── GET /api/paystack?reference=xxx  — verify a transaction ──────────────────
export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference || !/^[a-zA-Z0-9_-]{8,64}$/.test(reference)) {
      return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
    }

    // 5s timeout: the success page polls this; failing fast lets the UI retry
    // rather than locking up for 29s on a slow Paystack response.
    const v = await verifyPaystack(reference);

    if (!v.ok) {
      return NextResponse.json(
        { verified: false, message: v.gatewayResponse ?? "Verification failed" },
        { status: 400 }
      );
    }

    // Backstop for the webhook: if it hasn't arrived (or failed), mark the
    // order paid here. markOrderPaid is idempotent, so whichever runs first wins.
    try {
      await markOrderPaid(reference, v);
    } catch (err) {
      console.error(`Verify: could not mark ${reference} paid (webhook will retry):`, err);
    }

    // Only return safe fields — never forward the raw Paystack response to the client
    return NextResponse.json({
      verified:  true,
      reference,
      amount:    v.amount,
      currency:  v.currency,
      status:    v.status,
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function momoNetworkToPaystackProvider(network: string): string {
  const map: Record<string, string> = {
    MTN:        "mtn",
    TELECEL:    "vod",
    AIRTELTIGO: "tgo",
  };
  return map[network] ?? "mtn";
}
