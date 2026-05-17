import { prisma } from "@/lib/db";
import type { Product } from "@/lib/products";
import type { Prisma } from "@prisma/client";

function mapRow(r: {
  id: string; slug: string; name: string; collection: string;
  basePrice: number; description: string | null; details: string[];
  imageUrl: string; images: string[]; sizes: string[]; color: string;
  badge: string | null; featured: boolean; stock: number;
  sizeStock: Prisma.JsonValue | null;
}): Product {
  return {
    id:          r.id,
    slug:        r.slug,
    name:        r.name,
    collection:  r.collection,
    price:       r.basePrice,
    description: r.description ?? "",
    details:     r.details,
    image:       r.imageUrl,
    images:      r.images,
    sizes:       r.sizes as Product["sizes"],
    color:       r.color,
    badge:       r.badge ?? undefined,
    featured:    r.featured,
    stock:       r.stock,
    sizeStock:   r.sizeStock ? (r.sizeStock as Record<string, number>) : undefined,
  };
}

export async function fetchActiveProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where:   { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapRow);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const r = await prisma.product.findFirst({
    where: { slug, isActive: true },
  });
  return r ? mapRow(r) : null;
}
