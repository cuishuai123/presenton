import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const mimeMap: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".json": "application/json",
};

// Simple 1x1 transparent PNG (base64)
const FALLBACK_PLACEHOLDER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y2NfZUAAAAASUVORK5CYII=",
  "base64"
);

export async function GET(
  _req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const baseDir = process.env.APP_DATA_DIRECTORY
      ? path.resolve(process.env.APP_DATA_DIRECTORY)
      : path.resolve(process.cwd(), "../../app_data");

    const segments = params.path || [];
    if (segments.length === 0) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const targetPath = path.resolve(baseDir, ...segments);
    if (!targetPath.startsWith(baseDir)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(targetPath);
    } catch (err: any) {
      // Serve a lightweight placeholder for known missing assets
      const filename = path.basename(targetPath).toLowerCase();
      if (filename === "placeholder.jpg" || filename === "placeholder.png") {
        const contentType =
          filename.endsWith(".png") ? "image/png" : "image/jpeg";
        return new NextResponse(FALLBACK_PLACEHOLDER, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=300",
          },
        });
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = mimeMap[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[app_data route] Error serving file:", error?.message || error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

