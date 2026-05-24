import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { isValidSlug, isAllowedImageUrl } from "@/lib/validation";

const VALID_SIZES_SET = new Set(["XS","S","M","L","XL","XXL"]);

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

  // ── Validate required fields ─────────────────────────────────────────────
  if (
    typeof name       !== "string" || !name.trim()       || name.length       > 120 ||
    typeof collection !== "string" || !collection.trim() || collection.length > 80
  ) {
    return NextResponse.json({ error: "name and collection are required (max 120 / 80 chars)." }, { status: 400 });
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "slug must be lowercase letters, numbers and hyphens only (e.g. hope-tee)." },
      { status: 400 },
    );
  }
  if (!isAllowedImageUrl(imageUrl)) {
    return NextResponse.json(
      { error: "imageUrl must be an HTTPS URL from our S3 bucket or Cloudinary." },
      { status: 400 },
    );
  }
  const price = Number(basePrice);
  if (!Number.isFinite(price) || price <= 0 || price > 100_000) {
    return NextResponse.json({ error: "basePrice must be a positive number." }, { status: 400 });
  }

  // Validate optional images array
  const rawImages: unknown[] = Array.isArray(body.images) ? body.images : [imageUrl];
  if (rawImages.length > 10) {
    return NextResponse.json({ error: "images: maximum 10 images per product." }, { status: 400 });
  }
  const images = rawImages.filter(isAllowedImageUrl);
  if (images.length !== rawImages.length) {
    return NextResponse.json({ error: "All image URLs must be from our S3 bucket or Cloudinary." }, { status: 400 });
  }

  // Validate optional sizes
  const rawSizes: unknown[] = Array.isArray(body.sizes) ? body.sizes : ["XS","S","M","L","XL","XXL"];
  if (!rawSizes.every(s => VALID_SIZES_SET.has(s as string))) {
    return NextResponse.json({ error: "sizes must be XS/S/M/L/XL/XXL." }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name:        name.trim(),
        slug,
        collection:  collection.trim(),
        basePrice:   price,
        imageUrl,
        images,
        color:       typeof body.color === "string" ? body.color.trim().slice(0, 40)  : "White",
        sizes:       rawSizes as string[],
        badge:       typeof body.badge === "string"  ? body.badge.trim().slice(0, 30)  : null,
        featured:    body.featured    === true,
        description: typeof body.description === "string" ? body.description.slice(0, 2000) : null,
        details:     Array.isArray(body.details)
          ? (body.details as unknown[]).filter((d): d is string => typeof d === "string").slice(0, 20)
          : [],
        stock:       Math.max(0, Math.min(999_999, Math.floor(Number(body.stock) || 100))),
        sizeStock:   body.sizeStock ?? null,
        sortOrder:   Math.floor(Number(body.sortOrder) || 0),
        isActive:    body.isActive !== false,
      },
    });
    // Bust the Next.js router cache so the main store shows the new product immediately
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("Admin product create error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
