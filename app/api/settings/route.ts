import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRestaurantSettings, updateRestaurantSettings } from "@/services/settings-service";
import { settingsSchema } from "@/validators/settings";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const settings = await getRestaurantSettings();
    return successResponse(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch restaurant settings";
    return errorResponse(message, 500);
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

    const body = await request.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      console.error("PUT /api/settings validation failed:", validation.error.errors);
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updateRestaurantSettings(validation.data);
    return successResponse(updated, "Restaurant settings updated successfully");
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    const message = error instanceof Error ? error.message : "Failed to update restaurant settings";
    return errorResponse(message, 500);
  }
}
