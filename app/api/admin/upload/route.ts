import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/admin";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// On Lambda the IAM role (granted in sst.config.ts) provides credentials
// automatically via the default credential chain — no hardcoded keys needed.
// Explicit keys are only used in local dev (sst dev / next dev).
const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  ...(process.env.S3_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId:     process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      }
    : {}),
});

const BUCKET = process.env.S3_BUCKET ?? "vintage-gallery-products";

// Allowed image types (client-declared MIME type)
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

// Magic-byte signatures — verify actual file content, not just the MIME claim
function detectMimeFromBytes(buf: Buffer): string | null {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)               return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return "image/webp";
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x00) {
    const box = buf.slice(4, 8).toString("ascii");
    if (box === "ftyp")   return "image/heic"; // HEIC/HEIF
  }
  return null;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // 8 MB limit — check before reading full buffer
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 8 MB" }, { status: 413 });
  }

  const buffer   = Buffer.from(await file.arrayBuffer());

  // Verify actual magic bytes — reject files that lie about their type
  const actualMime = detectMimeFromBytes(buffer);
  if (!actualMime || !ALLOWED_TYPES[actualMime]) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP or HEIC images are allowed" },
      { status: 415 }
    );
  }

  const ext = ALLOWED_TYPES[actualMime];
  const key = `products/${randomUUID()}.${ext}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: actualMime,
    }));

    const url = `https://${BUCKET}.s3.amazonaws.com/${key}`;
    return NextResponse.json({ url, key });
  } catch (err) {
    console.error("S3 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
