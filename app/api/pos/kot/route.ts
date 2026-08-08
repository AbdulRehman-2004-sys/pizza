import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createPOSOrder, generateKOTForOrder } from "@/services/order-service";
import { createOrderSchema } from "@/validators/order";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const body = await request.json();
    let targetOrderId = body.orderId;

    // Save/update order if order payload is provided
    if (body.orderData) {
      const validation = createOrderSchema.safeParse(body.orderData);
      if (!validation.success) {
        const errMsg = validation.error.errors[0]?.message || "Validation failed";
        const fieldPath = validation.error.errors[0]?.path.join(".");
        return errorResponse(`Validation failed: ${fieldPath ? `${fieldPath} - ${errMsg}` : errMsg}`, 400, validation.error.errors);
      }

      const savedOrder = await createPOSOrder(validation.data, session.id);
      targetOrderId = savedOrder.id;
    }

    if (!targetOrderId) {
      return errorResponse("Order ID or Order Data is required to generate KOT", 400);
    }

    const kotTicket = await generateKOTForOrder(targetOrderId, session.id);
    return successResponse(kotTicket, "KOT created successfully!", 201);
  } catch (error: unknown) {
    console.error("POST /api/pos/kot error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate KOT";
    return errorResponse(message, 400);
  }
}
