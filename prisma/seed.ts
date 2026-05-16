import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      id:          "hope",
      slug:        "hope-tee",
      name:        "Light in Darkness",
      collection:  "HOPE Collection",
      description: "The piece that started it all. Heavyweight cotton, oversized silhouette, printed with our signature HOPE graphic. Made for those who move through darkness with purpose.",
      details:     [
        "100% heavyweight cotton (250gsm)",
        "Oversized unisex cut",
        "Screen-printed graphic — fade-resistant ink",
        "Pre-washed for a lived-in feel",
        "Made in Ghana",
      ],
      basePrice:   320,
      imageUrl:    "/asset/product-hope.jpg",
      images:      ["/asset/product-hope.jpg"],
      color:       "White",
      sizes:       ["XS", "S", "M", "L", "XL", "XXL"],
      badge:       "Featured",
      featured:    true,
      stock:       100,
      sortOrder:   1,
    },
    {
      id:          "beyourself",
      slug:        "be-yourself-tee",
      name:        "Be Yourself",
      collection:  "Icons Series",
      description: "Authenticity is the rarest flex. The Be Yourself tee is a reminder to stay true — bold palette, loud energy, designed for those who refuse to blend in.",
      details:     [
        "100% premium cotton (220gsm)",
        "Regular-fit silhouette",
        "Full-color DTF print — vibrant & durable",
        "Ribbed crewneck collar",
        "Made in Ghana",
      ],
      basePrice:   280,
      imageUrl:    "/asset/product-beyourself.jpg",
      images:      ["/asset/product-beyourself.jpg"],
      color:       "White",
      sizes:       ["XS", "S", "M", "L", "XL", "XXL"],
      badge:       "New",
      featured:    false,
      stock:       100,
      sortOrder:   2,
    },
    {
      id:          "tupac",
      slug:        "all-eyez-tee",
      name:        "All Eyez On Me",
      collection:  "Icons Series",
      description: "A tribute to a legend. Carries the energy of Tupac's most iconic era — rebellious, powerful, uncompromising. Limited run. Once it's gone, it's gone.",
      details:     [
        "100% heavyweight cotton (250gsm)",
        "Oversized cut for that vintage drape",
        "High-definition screen print",
        "Vintage wash finish",
        "Made in Ghana · Limited Edition",
      ],
      basePrice:   300,
      imageUrl:    "/asset/product-tupac.jpg",
      images:      ["/asset/product-tupac.jpg"],
      color:       "Black",
      sizes:       ["XS", "S", "M", "L", "XL", "XXL"],
      badge:       "Limited",
      featured:    false,
      stock:       50,
      sortOrder:   3,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where:  { id: p.id },
      update: p,
      create: p,
    });
    console.log(`✓ Upserted product: ${p.name}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
