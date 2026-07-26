import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// PATCH /api/admin/subscribers/[id]  — toggle unsubscribed flag
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  let body: { unsubscribed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.unsubscribed !== "boolean") {
    return NextResponse.json({ error: "unsubscribed (boolean) is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.subscriber.update({
      where: { id },
      data:  { unsubscribed: body.unsubscribed },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }
}

// DELETE /api/admin/subscribers/[id]  — hard delete (GDPR right-to-be-forgotten)
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  try {
    await prisma.subscriber.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }
}
