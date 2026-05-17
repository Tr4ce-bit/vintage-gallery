/**
 * One-time script: update existing product image URLs to S3.
 * Run: npx ts-node --project tsconfig.seed.json scripts/migrate-images-to-s3.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const S3_BASE = "https://vintage-gallery-products.s3.amazonaws.com";

const IMAGE_MAP: Record<string, string> = {
  "/asset/product-hope.jpg":       `${S3_BASE}/products/product-hope.jpg`,
  "/asset/product-beyourself.jpg": `${S3_BASE}/products/product-beyourself.jpg`,
  "/asset/product-tupac.jpg":      `${S3_BASE}/products/product-tupac.jpg`,
};

async function main() {
  const products = await prisma.product.findMany();
  let updated = 0;

  for (const p of products) {
    const newImageUrl = IMAGE_MAP[p.imageUrl] ?? p.imageUrl;
    const newImages   = (p.images as string[]).map(
      (img) => IMAGE_MAP[img] ?? img
    );

    if (newImageUrl !== p.imageUrl || JSON.stringify(newImages) !== JSON.stringify(p.images)) {
      await prisma.product.update({
        where: { id: p.id },
        data:  { imageUrl: newImageUrl, images: newImages },
      });
      console.log(`✓ ${p.name}: ${p.imageUrl} → ${newImageUrl}`);
      updated++;
    } else {
      console.log(`  ${p.name}: already up to date`);
    }
  }

  console.log(`\nDone. ${updated} product(s) updated.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
