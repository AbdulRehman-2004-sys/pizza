import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { orderQuerySchema } from "@/validators/order";
import { getOrders } from "@/services/order-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validationResult = orderQuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.errors[0]?.message || "Invalid query parameters", 400);
    }

    const result = await getOrders(validationResult.data);
    return NextResponse.json(
      {
        success: true,
        data: result.orders,
        pagination: result.pagination,
        message: "Orders retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return errorResponse(error.message || "Failed to fetch orders", 500);
  }
}
