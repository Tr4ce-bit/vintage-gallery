import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

// PATCH /api/admin/studio/designs/[id] — update name / category / isActive / sortOrder
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body   = await req.json();
  const { name, category, isActive, sortOrder } = body;

  const data: Record<string, unknown> = {};
  if (name      !== undefined) data.name      = name;
  if (category  !== undefined) data.category  = category || null;
  if (isActive  !== undefined) data.isActive  = isActive;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  try {
    const design = await prisma.studioDesign.update({ where: { id }, data });
    return NextResponse.json({ design });
  } catch {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }
}

// DELETE /api/admin/studio/designs/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.studioDesign.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }
}
