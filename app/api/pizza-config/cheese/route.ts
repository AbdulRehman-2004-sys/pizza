import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getExtraCheeseConfig, updateExtraCheeseConfig } from "@/services/cheese-service";
import { extraCheeseSchema } from "@/validators/pizza-config";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const cheese = await getExtraCheeseConfig();
    return successResponse(cheese);
  } catch (error) {
    console.error("GET /api/pizza-config/cheese error:", error);
    return errorResponse("Failed to fetch extra cheese configuration", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const cheeseConfig = await getExtraCheeseConfig();
    const body = await request.json();
    const validation = extraCheeseSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updateExtraCheeseConfig(cheeseConfig.id, validation.data);
    return successResponse(updated, "Extra cheese configuration updated successfully");
  } catch (error: unknown) {
    console.error("PUT /api/pizza-config/cheese error:", error);
    const message = error instanceof Error ? error.message : "Failed to update cheese configuration";
    return errorResponse(message, 400);
  }
}
