import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllMenuItems, createMenuItem } from "@/services/menu-item-service";
import { menuItemSchema } from "@/validators/menu-item";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    const items = await getAllMenuItems(categoryId, search);
    return successResponse(items);
  } catch (error) {
    console.error("GET /api/menu-items error:", error);
    return errorResponse("Failed to fetch menu items", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to create menu items", 403);
    }

    const body = await request.json();
    const validation = menuItemSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const newItem = await createMenuItem(validation.data);
    return successResponse(newItem, "Menu item created successfully", 201);
  } catch (error: unknown) {
    console.error("POST /api/menu-items error:", error);
    const message = error instanceof Error ? error.message : "Failed to create menu item";
    return errorResponse(message, 400);
  }
}
