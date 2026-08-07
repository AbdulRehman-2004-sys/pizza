import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processOrderPayment } from "@/services/billing-service";
import { processPaymentSchema } from "@/validators/billing";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const body = await request.json();
    const validation = processPaymentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const result = await processOrderPayment(validation.data, session.id);
    return successResponse(result, "Payment processed & order completed successfully!", 201);
  } catch (error: unknown) {
    console.error("POST /api/billing/payments error:", error);
    const message = error instanceof Error ? error.message : "Failed to process payment";
    return errorResponse(message, 400);
  }
}
