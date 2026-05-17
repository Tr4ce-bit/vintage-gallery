/**
 * Removes the white/near-white background from the logo PNG,
 * producing a transparent PNG ready for web use.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const INPUT  = "public/asset/logo.png";
const OUTPUT = "public/asset/logo-transparent.png";

const { data, info } = await sharp(INPUT)
  .ensureAlpha()           // make sure we have an alpha channel
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = new Uint8Array(data);

// Threshold — pixels this close to white get made transparent
const THRESHOLD = 30;

for (let i = 0; i < pixels.length; i += channels) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];

  // Distance from pure white
  const dist = Math.sqrt(
    (255 - r) ** 2 +
    (255 - g) ** 2 +
    (255 - b) ** 2
  );

  if (dist < THRESHOLD) {
    // Make transparent — keep RGB, zero alpha
    pixels[i + 3] = 0;
  }
}

await sharp(pixels, { raw: { width, height, channels } })
  .png()
  .toFile(OUTPUT);

console.log(`✓ Saved transparent logo → ${OUTPUT}`);
