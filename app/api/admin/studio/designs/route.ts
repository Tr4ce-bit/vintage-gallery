import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/studio/designs — all designs (including inactive)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const designs = await prisma.studioDesign.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ designs });
}

// POST /api/admin/studio/designs — create a new design
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, imageUrl, category } = body;

  if (!name?.trim() || !imageUrl?.trim()) {
    return NextResponse.json({ error: "Name and imageUrl are required" }, { status: 400 });
  }

  const design = await prisma.studioDesign.create({
    data: {
      name:     name.trim(),
      imageUrl: imageUrl.trim(),
      category: category?.trim() || null,
    },
  });

  return NextResponse.json({ design }, { status: 201 });
}
