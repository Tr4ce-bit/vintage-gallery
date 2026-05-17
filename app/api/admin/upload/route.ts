import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/admin";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId:     process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET ?? "vintage-gallery-products";

// Allowed image types
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

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

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP or HEIC images are allowed" },
      { status: 415 }
    );
  }

  // 8 MB limit
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 8 MB" }, { status: 413 });
  }

  const key    = `products/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: file.type,
    }));

    const url = `https://${BUCKET}.s3.amazonaws.com/${key}`;
    return NextResponse.json({ url, key });
  } catch (err) {
    console.error("S3 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
