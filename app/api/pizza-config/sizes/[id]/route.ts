import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPizzaSizeById, updatePizzaSize, deletePizzaSize } from "@/services/pizza-size-service";
import { pizzaSizeSchema } from "@/validators/pizza-config";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const size = await getPizzaSizeById(id);
    if (!size) {
      return errorResponse("Pizza size not found", 404);
    }
    return successResponse(size);
  } catch (error) {
    console.error("GET /api/pizza-config/sizes/[id] error:", error);
    return errorResponse("Failed to fetch pizza size", 500);
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
    const validation = pizzaSizeSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updatePizzaSize(id, validation.data);
    return successResponse(updated, "Pizza size updated successfully");
  } catch (error: unknown) {
    console.error("PUT /api/pizza-config/sizes/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update pizza size";
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

    await deletePizzaSize(id);
    return successResponse({ id }, "Pizza size deleted successfully");
  } catch (error: unknown) {
    console.error("DELETE /api/pizza-config/sizes/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete pizza size";
    return errorResponse(message, 400);
  }
}
