/**
 * Uses fal.ai nano-banana to generate a back view of the shirt
 * from the existing shirt-base.png, then saves it as shirt-back.png
 */

import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");
const INPUT     = path.join(ROOT, "public", "shirt-base.png");
const OUTPUT    = path.join(ROOT, "public", "shirt-back.png");

const FAL_KEY = process.env.FAL_KEY ?? "";
if (!FAL_KEY) { console.error("Set FAL_KEY env var"); process.exit(1); }
fal.config({ credentials: FAL_KEY });

async function main() {
  console.log("📤 Uploading shirt-base.png to fal.ai storage…");
  const fileBuffer = fs.readFileSync(INPUT);
  const file       = new File([fileBuffer], "shirt-base.png", { type: "image/png" });
  const uploadedUrl = await fal.storage.upload(file);
  console.log("✅ Uploaded:", uploadedUrl);

  console.log("🎨 Generating back view with nano-banana…");
  const result = await fal.subscribe("fal-ai/nano-banana/edit", {
    input: {
      prompt: [
        "Show the exact same plain t-shirt from the back view.",
        "The shirt is flat-lay product photography on a pure white background.",
        "Back of the shirt, no print, same fabric texture and colour as the input image.",
        "Clean white background, no shadows, no people, no mannequin.",
        "Identical colour, fabric, and style to the front view. Product photo only."
      ].join(" "),
      image_urls:    [uploadedUrl],
      num_images:    1,
      output_format: "png",
    },
    logs: true,
    onQueueUpdate(update) {
      if (update.status === "IN_PROGRESS") {
        update.logs?.forEach(l => console.log(" ", l.message));
      }
    },
  });

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) {
    console.error("❌ No image in response:", JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log("⬇️  Downloading result…");
  const resp   = await fetch(imageUrl);
  const buffer = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`✅ Saved to public/shirt-back.png (${(buffer.length / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
