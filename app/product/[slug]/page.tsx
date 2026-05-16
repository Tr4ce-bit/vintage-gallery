import { notFound } from "next/navigation";
import { fetchActiveProducts, fetchProductBySlug } from "@/lib/db-products";
import ProductClient from "@/components/ProductClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const all     = await fetchActiveProducts();
  const related = all.filter((p) => p.id !== product.id).slice(0, 2);

  return <ProductClient product={product} related={related} />;
}
