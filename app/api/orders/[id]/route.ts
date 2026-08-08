import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrderById, deleteOrder } from "@/services/order-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const { id } = await params;
    if (!id) {
      return errorResponse("Order ID is required", 400);
    }

    const order = await getOrderById(id);
    return successResponse(order);
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return errorResponse(error.message || "Failed to fetch order details", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const { id } = await params;
    if (!id) {
      return errorResponse("Order ID is required", 400);
    }

    await deleteOrder(id);
    return successResponse(null, "Order deleted successfully");
  } catch (error: any) {
    console.error("DELETE /api/orders/[id] error:", error);
    return errorResponse(error.message || "Failed to delete order", 500);
  }
}
