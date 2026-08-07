import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCategoryById, updateCategory, deleteCategory } from "@/services/category-service";
import { categorySchema } from "@/validators/category";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const category = await getCategoryById(id);
    if (!category) {
      return errorResponse("Category not found", 404);
    }
    return successResponse(category);
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return errorResponse("Failed to fetch category", 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to edit categories", 403);
    }

    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updateCategory(id, validation.data);
    return successResponse(updated, "Category updated successfully");
  } catch (error: unknown) {
    console.error("PUT /api/categories/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update category";
    return errorResponse(message, 400);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to delete categories", 403);
    }

    await deleteCategory(id);
    return successResponse({ id }, "Category deleted successfully");
  } catch (error: unknown) {
    console.error("DELETE /api/categories/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return errorResponse(message, 400);
  }
}
