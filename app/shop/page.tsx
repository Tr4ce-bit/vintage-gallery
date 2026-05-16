import { fetchActiveProducts } from "@/lib/db-products";
import ShopClient from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await fetchActiveProducts();
  return <ShopClient products={products} />;
}
