import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { isAllowedImageUrl } from "@/lib/validation";

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

  if (typeof name !== "string" || !name.trim() || name.length > 120) {
    return NextResponse.json({ error: "name is required (max 120 chars)." }, { status: 400 });
  }
  if (!isAllowedImageUrl(imageUrl)) {
    return NextResponse.json(
      { error: "imageUrl must be an HTTPS URL from our S3 bucket or Cloudinary." },
      { status: 400 },
    );
  }

  const design = await prisma.studioDesign.create({
    data: {
      name:     name.trim(),
      imageUrl: imageUrl.trim(),
      category: typeof category === "string" ? category.trim().slice(0, 60) || null : null,
    },
  });

  return NextResponse.json({ design }, { status: 201 });
}
