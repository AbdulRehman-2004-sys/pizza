import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cancelOrderSchema } from "@/validators/order";
import { cancelOrder } from "@/services/order-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(
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

    const validationResult = cancelOrderSchema.safeParse({
      orderId: id,
      reason: body.reason,
    });

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.errors[0]?.message || "Invalid cancellation data",
        400
      );
    }

    const cancelledOrder = await cancelOrder(
      id,
      session.id,
      session.role,
      validationResult.data.reason
    );

    return successResponse(cancelledOrder, "Order cancelled successfully");
  } catch (error: any) {
    console.error("POST /api/orders/[id]/cancel error:", error);
    return errorResponse(error.message || "Failed to cancel order", 400);
  }
}
