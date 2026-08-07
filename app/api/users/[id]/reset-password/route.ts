import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminResetPasswordSchema } from "@/validators/user";
import { adminResetPassword } from "@/services/user-service";
import { successResponse, errorResponse } from "@/lib/response";
import { Role } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== Role.ADMIN) {
      return errorResponse("Forbidden: User management is restricted to Admin accounts", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const validation = adminResetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0]?.message || "Validation failed", 400);
    }

    const result = await adminResetPassword(id, validation.data.newPassword);
    return successResponse(result, result.message);
  } catch (error: any) {
    console.error("POST /api/users/[id]/reset-password error:", error);
    return errorResponse(error.message || "Failed to reset user password", 400);
  }
}
