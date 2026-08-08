import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrderById, deleteOrder, updateOrderStatus } from "@/services/order-service";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return errorResponse("Order ID and status are required", 400);
    }

    const updated = await updateOrderStatus(id, status);
    return successResponse(updated, "Order status updated successfully");
  } catch (error: any) {
    console.error("PATCH /api/orders/[id] error:", error);
    return errorResponse(error.message || "Failed to update order status", 500);
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
