import ProductCustomizer from "@/components/ProductCustomizer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Studio | Vintage Gallery Store",
  description: "Customise your tee. Pick a design, choose your colour, select your fit.",
};

export default function CustomizePage() {
  return <ProductCustomizer />;
}
