import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ products });
  } catch (err) {
    console.error("Admin products fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, slug, collection, basePrice, imageUrl } = body;

  if (!name || !slug || !collection || !basePrice || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields: name, slug, collection, basePrice, imageUrl" }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        collection,
        basePrice:   Number(basePrice),
        imageUrl,
        images:      body.images      ?? [imageUrl],
        color:       body.color       ?? "White",
        sizes:       body.sizes       ?? ["XS","S","M","L","XL","XXL"],
        badge:       body.badge       ?? null,
        featured:    body.featured    ?? false,
        description: body.description ?? null,
        details:     body.details     ?? [],
        stock:       body.stock       ?? 100,
        sizeStock:   body.sizeStock   ?? null,
        sortOrder:   body.sortOrder   ?? 0,
        isActive:    body.isActive    ?? true,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("Admin product create error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
