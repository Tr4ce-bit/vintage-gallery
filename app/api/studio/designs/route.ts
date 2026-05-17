import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/studio/designs — public, returns only active designs
export async function GET() {
  try {
    const designs = await prisma.studioDesign.findMany({
      where:   { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select:  { id: true, name: true, imageUrl: true, category: true },
    });
    return NextResponse.json({ designs });
  } catch {
    return NextResponse.json({ designs: [] });
  }
}
