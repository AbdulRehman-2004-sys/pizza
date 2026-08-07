import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPizzaSizes, createPizzaSize } from "@/services/pizza-size-service";
import { pizzaSizeSchema } from "@/validators/pizza-config";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const sizes = await getAllPizzaSizes(true);
    return successResponse(sizes);
  } catch (error) {
    console.error("GET /api/pizza-config/sizes error:", error);
    return errorResponse("Failed to fetch pizza sizes", 500);
  }
}

export async function POST(request: Request) {
  try {
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

    const newSize = await createPizzaSize(validation.data);
    return successResponse(newSize, "Pizza size created successfully", 201);
  } catch (error: unknown) {
    console.error("POST /api/pizza-config/sizes error:", error);
    const message = error instanceof Error ? error.message : "Failed to create pizza size";
    return errorResponse(message, 400);
  }
}
