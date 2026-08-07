import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getReadyOrdersForBilling } from "@/services/billing-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const orders = await getReadyOrdersForBilling();
    return successResponse(orders);
  } catch (error) {
    console.error("GET /api/billing/ready-orders error:", error);
    return errorResponse("Failed to fetch billing orders", 500);
  }
}
