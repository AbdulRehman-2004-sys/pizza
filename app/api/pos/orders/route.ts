import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createPOSOrder } from "@/services/order-service";
import { createOrderSchema } from "@/validators/order";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      const errMsg = validation.error.errors[0]?.message || "Validation failed";
      const fieldPath = validation.error.errors[0]?.path.join(".");
      return errorResponse(`Validation failed: ${fieldPath ? `${fieldPath} - ${errMsg}` : errMsg}`, 400, validation.error.errors);
    }

    const order = await createPOSOrder(validation.data, session.id);
    return successResponse(order, "Order created successfully!", 201);
  } catch (error: unknown) {
    console.error("POST /api/pos/orders error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return errorResponse(message, 400);
  }
}
