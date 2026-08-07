import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getExtraToppingById, updateExtraTopping, deleteExtraTopping } from "@/services/topping-service";
import { extraToppingSchema } from "@/validators/pizza-config";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const topping = await getExtraToppingById(id);
    if (!topping) {
      return errorResponse("Topping not found", 404);
    }
    return successResponse(topping);
  } catch (error) {
    console.error("GET /api/pizza-config/toppings/[id] error:", error);
    return errorResponse("Failed to fetch topping", 500);
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
    const validation = extraToppingSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updateExtraTopping(id, validation.data);
    return successResponse(updated, "Topping updated successfully");
  } catch (error: unknown) {
    console.error("PUT /api/pizza-config/toppings/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update topping";
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
      return errorResponse("Forbidden: Admin access required", 403);
    }

    await deleteExtraTopping(id);
    return successResponse({ id }, "Topping deleted successfully");
  } catch (error: unknown) {
    console.error("DELETE /api/pizza-config/toppings/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete topping";
    return errorResponse(message, 400);
  }
}
