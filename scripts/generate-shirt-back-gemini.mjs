/**
 * Uses Gemini image generation to produce a back view of the shirt
 * from shirt-base.png, then saves it as public/shirt-back.png
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(__dirname, "..");
const INPUT  = path.join(ROOT, "public", "shirt-base.png");
const OUTPUT = path.join(ROOT, "public", "shirt-back.png");
const KEY    = process.env.GEMINI_API_KEY ?? "";
const MODEL  = "gemini-2.5-flash-image";
if (!KEY) { console.error("Set GEMINI_API_KEY env var"); process.exit(1); }

async function main() {
  console.log("📖 Reading shirt-base.png…");
  const imageBytes  = fs.readFileSync(INPUT);
  const base64Image = imageBytes.toString("base64");
  console.log(`   ${(imageBytes.length / 1024).toFixed(0)} KB loaded`);

  const body = {
    contents: [
      {
        parts: [
          {
            text: [
              "This is a flat-lay product photo of a plain t-shirt (front view).",
              "Generate a flat-lay product photo of the exact same t-shirt showing the BACK view.",
              "Keep: identical colour, fabric texture, style, and white background.",
              "No people, no mannequin, no text, no logos on the shirt.",
              "Clean white studio background, same lighting. Only the back of the shirt.",
            ].join(" "),
          },
          {
            inline_data: {
              mime_type: "image/png",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["image", "text"],
      temperature: 1,
    },
  };

  console.log("🎨 Calling Gemini image generation…");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error("❌ API error:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  // Find the image part in the response
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find(p => p.inline_data?.mime_type?.startsWith("image/"));

  if (!imgPart) {
    console.error("❌ No image in response. Parts received:", JSON.stringify(parts.map(p => Object.keys(p)), null, 2));
    process.exit(1);
  }

  const buffer = Buffer.from(imgPart.inline_data.data, "base64");
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`✅ Saved public/shirt-back.png (${(buffer.length / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
