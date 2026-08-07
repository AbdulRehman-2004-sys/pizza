import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMenuItemCustomization, saveMenuItemCustomization } from "@/services/price-matrix-service";
import { menuItemCustomizationSchema } from "@/validators/pizza-config";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const customization = await getMenuItemCustomization(id);
    if (!customization) {
      return errorResponse("Menu item not found", 404);
    }
    return successResponse(customization);
  } catch (error) {
    console.error("GET /api/menu-items/[id]/customization error:", error);
    return errorResponse("Failed to fetch menu item customization", 500);
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
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const body = await request.json();
    const validation = menuItemCustomizationSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await saveMenuItemCustomization(id, validation.data);
    return successResponse(updated, "Menu item customization & price matrix saved successfully");
  } catch (error: unknown) {
    console.error("PUT /api/menu-items/[id]/customization error:", error);
    const message = error instanceof Error ? error.message : "Failed to update menu item customization";
    return errorResponse(message, 400);
  }
}
