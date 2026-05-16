import Hero from "@/components/Hero";
import Collection from "@/components/Collection";
import About from "@/components/About";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { fetchActiveProducts } from "@/lib/db-products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await fetchActiveProducts();
  return (
    <>
      <Hero />
      <Collection products={products} />
      <About />
      <Newsletter />
      <Footer />
    </>
  );
}
