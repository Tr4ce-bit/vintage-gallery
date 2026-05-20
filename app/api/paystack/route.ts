import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE   = "https://api.paystack.co";
const DELIVERY_FEE    = 30; // GHS — must match checkout UI

// ── POST /api/paystack  — initialise a transaction ───────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, momoNetwork, momoPhone, cartItems, deliveryInfo } = body;

    if (!email || !momoNetwork || !momoPhone || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Missing required payment fields." }, { status: 400 });
    }

    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Payment service not configured." }, { status: 500 });
    }

    // ── Server-side price recalculation ──────────────────────────────────────
    // NEVER trust the client-supplied amount. Look up every item price from DB.
    let subtotalGHS = 0;

    for (const item of cartItems) {
      const { productId, quantity } = item;
      if (!productId || typeof quantity !== "number" || quantity < 1) {
        return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
      }

      if (productId.startsWith("custom-")) {
        // Custom studio tee — fetch price from settings
        const rows = await prisma.settings.findMany({
          where: { key: { in: ["studio_base_price", "studio_design_addon"] } },
        });
        const map: Record<string, number> = { studio_base_price: 150, studio_design_addon: 30 };
        for (const r of rows) map[r.key] = Number(r.value);

        const hasDesign = !!item.name?.includes("·"); // custom tees with a print
        const unitPrice = map.studio_base_price + (hasDesign ? map.studio_design_addon : 0);
        subtotalGHS += unitPrice * quantity;
      } else {
        // Regular product — fetch authoritative price from DB
        const product = await prisma.product.findUnique({
          where:  { id: productId },
          select: { basePrice: true, isActive: true },
        });
        if (!product || !product.isActive) {
          return NextResponse.json({ error: `Product ${productId} is unavailable.` }, { status: 400 });
        }
        subtotalGHS += product.basePrice * quantity;
      }
    }

    const totalGHS      = subtotalGHS + DELIVERY_FEE;
    const amountPesewas = Math.round(totalGHS * 100);

    const paystackPayload = {
      email,
      amount:   amountPesewas,
      currency: "GHS",
      channels: ["mobile_money"],
      mobile_money: {
        phone:    momoPhone,
        provider: momoNetworkToPaystackProvider(momoNetwork),
      },
      metadata: {
        cartItems,
        deliveryInfo,
        serverCalculatedTotal: totalGHS,
        custom_fields: [
          { display_name: "Network",       variable_name: "network",    value: momoNetwork },
          { display_name: "Phone",         variable_name: "phone",      value: momoPhone   },
          { display_name: "Delivery Addr", variable_name: "gh_address", value: deliveryInfo?.address },
        ],
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    };

    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const data = await res.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message ?? "Paystack declined the request." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      accessCode:       data.data.access_code,
      reference:        data.data.reference,
      totalGHS,         // inform client of server-calculated total
    });
  } catch (err) {
    console.error("Paystack init error:", err);
    return NextResponse.json({ error: "Payment initialisation failed." }, { status: 500 });
  }
}

// ── GET /api/paystack?reference=xxx  — verify a transaction (auth required) ──
// This endpoint is for the success page only — must be authenticated.
export async function GET(req: NextRequest) {
  try {
    // Require a signed-in user or at minimum a valid session header
    // to prevent enumeration of arbitrary Paystack references.
    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference || !/^[a-zA-Z0-9_-]{8,64}$/.test(reference)) {
      return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
    }

    const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const data = await res.json();

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json(
        { verified: false, message: data.data?.gateway_response ?? "Verification failed" },
        { status: 400 }
      );
    }

    // Only return safe fields — never forward raw Paystack response to client
    return NextResponse.json({
      verified:  true,
      reference: data.data.reference,
      amount:    data.data.amount,   // in pesewas
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
