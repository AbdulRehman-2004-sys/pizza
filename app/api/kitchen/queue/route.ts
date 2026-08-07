import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getKitchenQueue } from "@/services/kitchen-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const queue = await getKitchenQueue({ status, type, search });
    return successResponse(queue);
  } catch (error) {
    console.error("GET /api/kitchen/queue error:", error);
    return errorResponse("Failed to fetch kitchen queue", 500);
  }
}
