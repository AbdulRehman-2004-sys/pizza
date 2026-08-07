import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllCategories, createCategory } from "@/services/category-service";
import { categorySchema } from "@/validators/category";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const categories = await getAllCategories(true);
    return successResponse(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to create categories", 403);
    }

    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const newCategory = await createCategory(validation.data);
    return successResponse(newCategory, "Category created successfully", 201);
  } catch (error: unknown) {
    console.error("POST /api/categories error:", error);
    const message = error instanceof Error ? error.message : "Failed to create category";
    return errorResponse(message, 400);
  }
}
