import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getReadyNotifications } from "@/services/kitchen-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const readyOrders = await getReadyNotifications();
    return successResponse(readyOrders || []);
  } catch (error) {
    console.error("GET /api/kitchen/ready-notifications error:", error);
    return successResponse([]);
  }
}
