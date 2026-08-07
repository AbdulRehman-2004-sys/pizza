import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/validators/user";
import { resetPasswordWithToken } from "@/services/user-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0]?.message || "Validation failed", 400);
    }

    const result = await resetPasswordWithToken(validation.data.token, validation.data.newPassword);
    return successResponse(result, result.message);
  } catch (error: any) {
    console.error("POST /api/auth/reset-password error:", error);
    return errorResponse(error.message || "Failed to reset password", 400);
  }
}
