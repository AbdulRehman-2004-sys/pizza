import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllExtraToppings, createExtraTopping } from "@/services/topping-service";
import { extraToppingSchema } from "@/validators/pizza-config";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const toppings = await getAllExtraToppings();
    return successResponse(toppings);
  } catch (error) {
    console.error("GET /api/pizza-config/toppings error:", error);
    return errorResponse("Failed to fetch extra toppings", 500);
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
    const validation = extraToppingSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const newTopping = await createExtraTopping(validation.data);
    return successResponse(newTopping, "Extra topping created successfully", 201);
  } catch (error: unknown) {
    console.error("POST /api/pizza-config/toppings error:", error);
    const message = error instanceof Error ? error.message : "Failed to create extra topping";
    return errorResponse(message, 400);
  }
}
