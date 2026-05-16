import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { cognitoId: authUser.userId },
    });
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const order = await prisma.order.findFirst({
      where:   { id, userId: profile.id },   // userId check prevents accessing others' orders
      include: { items: { include: { product: true } } },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Order fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
