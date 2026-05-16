import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

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
        ...(body.name        !== undefined && { name:        body.name }),
        ...(body.slug        !== undefined && { slug:        body.slug }),
        ...(body.collection  !== undefined && { collection:  body.collection }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.details     !== undefined && { details:     body.details }),
        ...(body.basePrice   !== undefined && { basePrice:   Number(body.basePrice) }),
        ...(body.imageUrl    !== undefined && { imageUrl:    body.imageUrl }),
        ...(body.images      !== undefined && { images:      body.images }),
        ...(body.color       !== undefined && { color:       body.color }),
        ...(body.sizes       !== undefined && { sizes:       body.sizes }),
        ...(body.badge       !== undefined && { badge:       body.badge }),
        ...(body.featured    !== undefined && { featured:    body.featured }),
        ...(body.stock       !== undefined && { stock:       Number(body.stock) }),
        ...(body.isActive    !== undefined && { isActive:    body.isActive }),
        ...(body.sortOrder   !== undefined && { sortOrder:   Number(body.sortOrder) }),
      },
    });
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
    return NextResponse.json({ product, note: "Product has orders — deactivated instead of deleted" });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Admin product delete error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
