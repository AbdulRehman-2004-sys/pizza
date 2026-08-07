import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/validators/user";
import { createPasswordResetToken } from "@/services/user-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0]?.message || "Validation failed", 400);
    }

    const result = await createPasswordResetToken(validation.data.email);
    return successResponse(result, result.message);
  } catch (error: any) {
    console.error("POST /api/auth/forgot-password error:", error);
    return errorResponse("Failed to process forgot password request", 500);
  }
}
