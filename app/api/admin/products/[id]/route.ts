import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { isValidSlug, isAllowedImageUrl } from "@/lib/validation";

const VALID_SIZES_SET = new Set(["XS","S","M","L","XL","XXL"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    console.error("Admin product fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body   = await req.json();

  // ── Per-field validation on anything provided ────────────────────────────
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 120) {
      return NextResponse.json({ error: "name must be a non-empty string (max 120 chars)." }, { status: 400 });
    }
  }
  if (body.slug !== undefined && !isValidSlug(body.slug)) {
    return NextResponse.json(
      { error: "slug must be lowercase letters, numbers and hyphens only." },
      { status: 400 },
    );
  }
  if (body.collection !== undefined) {
    if (typeof body.collection !== "string" || !body.collection.trim() || body.collection.length > 80) {
      return NextResponse.json({ error: "collection must be a non-empty string (max 80 chars)." }, { status: 400 });
    }
  }
  if (body.imageUrl !== undefined && !isAllowedImageUrl(body.imageUrl)) {
    return NextResponse.json(
      { error: "imageUrl must be an HTTPS URL from our S3 bucket or Cloudinary." },
      { status: 400 },
    );
  }
  if (body.images !== undefined) {
    if (!Array.isArray(body.images) || body.images.length > 10) {
      return NextResponse.json({ error: "images must be an array with max 10 entries." }, { status: 400 });
    }
    if (!(body.images as unknown[]).every(isAllowedImageUrl)) {
      return NextResponse.json({ error: "All image URLs must be from our S3 bucket or Cloudinary." }, { status: 400 });
    }
  }
  if (body.basePrice !== undefined) {
    const price = Number(body.basePrice);
    if (!Number.isFinite(price) || price <= 0 || price > 100_000) {
      return NextResponse.json({ error: "basePrice must be a positive number." }, { status: 400 });
    }
  }
  if (body.sizes !== undefined) {
    if (!Array.isArray(body.sizes) || !(body.sizes as unknown[]).every(s => VALID_SIZES_SET.has(s as string))) {
      return NextResponse.json({ error: "sizes must be XS/S/M/L/XL/XXL." }, { status: 400 });
    }
  }

  // Prevent changing to a slug that belongs to another product
  if (body.slug) {
    const conflict = await prisma.product.findFirst({
      where: { slug: body.slug, NOT: { id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Slug already taken by another product" }, { status: 409 });
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data:  {
        ...(body.name        !== undefined && { name:        (body.name as string).trim() }),
        ...(body.slug        !== undefined && { slug:        body.slug }),
        ...(body.collection  !== undefined && { collection:  (body.collection as string).trim() }),
        ...(body.description !== undefined && { description: typeof body.description === "string" ? body.description.slice(0, 2000) : null }),
        ...(body.details     !== undefined && { details:     (body.details as unknown[]).filter((d): d is string => typeof d === "string").slice(0, 20) }),
        ...(body.basePrice   !== undefined && { basePrice:   Number(body.basePrice) }),
        ...(body.imageUrl    !== undefined && { imageUrl:    body.imageUrl }),
        ...(body.images      !== undefined && { images:      body.images }),
        ...(body.color       !== undefined && { color:       typeof body.color === "string" ? body.color.trim().slice(0, 40) : "White" }),
        ...(body.sizes       !== undefined && { sizes:       body.sizes }),
        ...(body.badge       !== undefined && { badge:       typeof body.badge === "string" ? body.badge.trim().slice(0, 30) : null }),
        ...(body.featured    !== undefined && { featured:    Boolean(body.featured) }),
        ...(body.stock       !== undefined && { stock:       Math.max(0, Math.min(999_999, Math.floor(Number(body.stock)))) }),
        ...(body.sizeStock   !== undefined && { sizeStock:   body.sizeStock }),
        ...(body.isActive    !== undefined && { isActive:    Boolean(body.isActive) }),
        ...(body.sortOrder   !== undefined && { sortOrder:   Math.floor(Number(body.sortOrder)) }),
      },
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ product });
  } catch (err) {
    console.error("Admin product update error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // If the product has order history, deactivate instead of delete
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    const product = await prisma.product.update({
      where: { id },
      data:  { isActive: false },
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ product, note: "Product has orders — deactivated instead of deleted" });
  }

  try {
    // Grab slug before deletion so we can revalidate its page
    const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/shop");
    if (product) revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Admin product delete error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
