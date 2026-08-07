import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAvailablePOSTables } from "@/services/order-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const tables = await getAvailablePOSTables();
    return successResponse(tables);
  } catch (error) {
    console.error("GET /api/pos/tables error:", error);
    return errorResponse("Failed to fetch available tables", 500);
  }
}
