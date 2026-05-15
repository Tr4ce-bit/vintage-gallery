import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE   = "https://api.paystack.co";

// ── POST /api/paystack  — initialise a transaction ───────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, amountGHS, momoNetwork, momoPhone, cartItems, deliveryInfo } = body;

    if (!email || !amountGHS || !momoNetwork || !momoPhone) {
      return NextResponse.json({ error: "Missing required payment fields." }, { status: 400 });
    }

    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Payment service not configured." }, { status: 500 });
    }

    // Paystack amounts are in pesewas (GHS × 100)
    const amountPesewas = Math.round(amountGHS * 100);

    const paystackPayload = {
      email,
      amount: amountPesewas,
      currency: "GHS",
      channels: ["mobile_money"],
      mobile_money: {
        phone:    momoPhone,
        provider: momoNetworkToPaystackProvider(momoNetwork),
      },
      metadata: {
        cartItems,
        deliveryInfo,
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
    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const data = await res.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { verified: false, message: data.data?.gateway_response ?? "Verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ verified: true, data: data.data });
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
