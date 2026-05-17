export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: string;
  price: number;       // GHS
  description: string;
  details: string[];
  image: string;
  images: string[];
  sizes: ProductSize[];
  color: string;
  badge?: string;
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "hope",
    slug: "hope-tee",
    name: "Light in Darkness",
    collection: "HOPE Collection",
    price: 320,
    description:
      "The piece that started it all. Heavyweight cotton, oversized silhouette, printed with our signature HOPE graphic. Made for those who move through darkness with purpose.",
    details: [
      "100% heavyweight cotton (250gsm)",
      "Oversized unisex cut",
      "Screen-printed graphic — fade-resistant ink",
      "Pre-washed for a lived-in feel",
      "Made in Ghana",
    ],
    image: "https://vintage-gallery-products.s3.amazonaws.com/products/product-hope.jpg",
    images: ["https://vintage-gallery-products.s3.amazonaws.com/products/product-hope.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "White",
    badge: "Featured",
    featured: true,
  },
  {
    id: "beyourself",
    slug: "be-yourself-tee",
    name: "Be Yourself",
    collection: "Icons Series",
    price: 280,
    description:
      "Authenticity is the rarest flex. The Be Yourself tee is a reminder to stay true — bold palette, loud energy, designed for those who refuse to blend in.",
    details: [
      "100% premium cotton (220gsm)",
      "Regular-fit silhouette",
      "Full-color DTF print — vibrant & durable",
      "Ribbed crewneck collar",
      "Made in Ghana",
    ],
    image: "https://vintage-gallery-products.s3.amazonaws.com/products/product-beyourself.jpg",
    images: ["https://vintage-gallery-products.s3.amazonaws.com/products/product-beyourself.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "White",
    badge: "New",
  },
  {
    id: "tupac",
    slug: "all-eyez-tee",
    name: "All Eyez On Me",
    collection: "Icons Series",
    price: 300,
    description:
      "A tribute to a legend. Carries the energy of Tupac's most iconic era — rebellious, powerful, uncompromising. Limited run. Once it's gone, it's gone.",
    details: [
      "100% heavyweight cotton (250gsm)",
      "Oversized cut for that vintage drape",
      "High-definition screen print",
      "Vintage wash finish",
      "Made in Ghana · Limited Edition",
    ],
    image: "https://vintage-gallery-products.s3.amazonaws.com/products/product-tupac.jpg",
    images: ["https://vintage-gallery-products.s3.amazonaws.com/products/product-tupac.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Black",
    badge: "Limited",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
