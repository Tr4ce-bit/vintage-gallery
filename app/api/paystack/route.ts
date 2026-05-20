import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { generateOrderId } from "@/lib/order-id";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE   = "https://api.paystack.co";
const DELIVERY_FEE    = 30; // GHS — must match checkout UI

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
  // Reject obviously oversized payloads before JSON parsing
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 32_768) { // 32 KB is more than enough for a cart
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  try {
    const body = await req.json();
    const { email, paymentMethod, momoNetwork, momoPhone, cartItems, deliveryInfo } = body;

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

    for (const item of cartItems) {
      const { productId, quantity, name, size, color } = item;
      if (
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
          productName: name ?? "Custom Studio Tee",
          size:        size ?? "M",
          color:       color ?? "",
          quantity,
          unitPrice,
          isCustom:    true,
        });
      } else {
        // Regular product — authoritative price from DB
        const product = await prisma.product.findUnique({
          where:  { id: productId },
          select: { basePrice: true, isActive: true, name: true },
        });
        if (!product || !product.isActive) {
          return NextResponse.json({ error: `Product ${productId} is unavailable.` }, { status: 400 });
        }
        subtotalGHS += product.basePrice * quantity;

        resolvedItems.push({
          productId,
          productName: product.name,
          size:        size ?? "M",
          color:       color ?? "",
          quantity,
          unitPrice:   product.basePrice,
          isCustom:    false,
        });
      }
    }

    const totalGHS      = subtotalGHS + DELIVERY_FEE;
    const amountPesewas = Math.round(totalGHS * 100);

    // ── 2. Initialise Paystack transaction ───────────────────────────────────
    // Map our method names to Paystack channel names
    const channelsMap: Record<string, string[]> = {
      momo:          ["mobile_money"],
      card:          ["card"],
      bank_transfer: ["bank_transfer"],
    };

    const paystackPayload: Record<string, unknown> = {
      email,
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

    const psRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const psData = await psRes.json();

    if (!psData.status) {
      return NextResponse.json(
        { error: psData.message ?? "Paystack declined the request." },
        { status: 400 }
      );
    }

    const { authorization_url, access_code, reference } = psData.data;

    // ── 3. Save pending order to DB (all users — guests included) ───────────
    // We do this AFTER getting the reference so we can tie the order to it.
    try {
      const authUser = await getAuthUser(req);

      // For signed-in users: upsert their UserProfile so we can link the order
      let profileId: string | null = null;
      if (authUser) {
        let profile = await prisma.userProfile.findUnique({
          where: { cognitoId: authUser.userId },
        });
        if (!profile) {
          profile = await prisma.userProfile.create({
            data: {
              cognitoId: authUser.userId,
              fullName:  deliveryInfo?.fullName ?? "",
              email:     email ?? authUser.email ?? "",
            },
          });
        }
        profileId = profile.id;
      }

      // Mask MoMo phone number (only for MoMo payments)
      const masked = method === "momo" && momoPhone
        ? (momoPhone.length >= 4
            ? momoPhone.slice(0, 3) + "****" + momoPhone.slice(-3)
            : momoPhone)
        : null;

      await prisma.order.create({
        data: {
          orderNumber:        generateOrderId(),
          userId:             profileId,           // null for guests
          guestEmail:         profileId ? null : email, // store email for guest orders
          paystackReference:  reference,
          paystackAccessCode: access_code,
          totalAmount:        totalGHS,
          deliveryFullName:   deliveryInfo?.fullName ?? "",
          deliveryPhone:      deliveryInfo?.phone    ?? "",
          deliveryAddress:    deliveryInfo?.address  ?? "",
          deliveryCity:       deliveryInfo?.city     ?? "",
          deliveryRegion:     deliveryInfo?.region   ?? "",
          deliveryNotes:      deliveryInfo?.notes    ?? null,
          momoNetwork:        method === "momo" ? momoNetwork as "MTN" | "TELECEL" | "AIRTELTIGO" : null,
          momoNumberMasked:   masked,
          status:             "PENDING",
          items: {
            create: resolvedItems
              .filter(i => VALID_SIZES.has(i.size))
              .map(i => ({
                productId:   i.productId,
                productName: i.productName,
                size:        i.size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
                color:       i.color,
                quantity:    i.quantity,
                unitPrice:   i.unitPrice,
                subtotal:    i.unitPrice * i.quantity,
              })),
          },
        },
      });
    } catch (dbErr) {
      // Don't block payment if DB write fails — log and continue
      console.error("Order DB creation failed (payment still proceeds):", dbErr);
    }

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

    const res = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } },
    );

    const data = await res.json();

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json(
        { verified: false, message: data.data?.gateway_response ?? "Verification failed" },
        { status: 400 }
      );
    }

    // Only return safe fields — never forward the raw Paystack response to the client
    return NextResponse.json({
      verified:  true,
      reference: data.data.reference,
      amount:    data.data.amount,
      currency:  data.data.currency,
      status:    data.data.status,
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
