import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to upload images", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "menu-items"; // 'menu-items' or 'restaurant'

    if (!file) {
      return errorResponse("No image file provided", 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse("Invalid file type. Allowed types: JPEG, PNG, WEBP, GIF, SVG.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("File size exceeds 5MB limit.", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize subfolder path
    const sanitizedFolder = folder === "restaurant" ? "restaurant" : "menu-items";
    const uploadDir = path.join(process.cwd(), "public", "uploads", sanitizedFolder);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name) || ".png";
    const sanitizeName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const uniqueFilename = `${Date.now()}-${sanitizeName}${ext}`;

    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${sanitizedFolder}/${uniqueFilename}`;

    return successResponse({ url: publicUrl }, "Image uploaded successfully", 201);
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return errorResponse("Failed to upload image file", 500);
  }
}
