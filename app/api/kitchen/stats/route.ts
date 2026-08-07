import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getKitchenDashboardStats } from "@/services/kitchen-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const stats = await getKitchenDashboardStats();
    return successResponse(stats);
  } catch (error) {
    console.error("GET /api/kitchen/stats error:", error);
    return errorResponse("Failed to fetch kitchen stats", 500);
  }
}
