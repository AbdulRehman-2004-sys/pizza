import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMenuItemById, updateMenuItem, deleteMenuItem } from "@/services/menu-item-service";
import { menuItemSchema, updateMenuItemSchema } from "@/validators/menu-item";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const item = await getMenuItemById(id);
    if (!item) {
      return errorResponse("Menu item not found", 404);
    }
    return successResponse(item);
  } catch (error) {
    console.error("GET /api/menu-items/[id] error:", error);
    return errorResponse("Failed to fetch menu item", 500);
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
      return errorResponse("Forbidden: Admin access required to edit menu items", 403);
    }

    const body = await request.json();
    const validation = updateMenuItemSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updateMenuItem(id, validation.data);
    return successResponse(updated, "Menu item updated successfully");
  } catch (error: unknown) {
    console.error("PUT /api/menu-items/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update menu item";
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
      return errorResponse("Forbidden: Admin access required to delete menu items", 403);
    }

    await deleteMenuItem(id);
    return successResponse({ id }, "Menu item deleted successfully");
  } catch (error: unknown) {
    console.error("DELETE /api/menu-items/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete menu item";
    return errorResponse(message, 400);
  }
}
