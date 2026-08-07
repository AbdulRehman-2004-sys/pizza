import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toggleUserStatus } from "@/services/user-service";
import { successResponse, errorResponse } from "@/lib/response";
import { Role } from "@prisma/client";

export async function PATCH(
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

    if (typeof body.isActive !== "boolean") {
      return errorResponse("isActive property must be a boolean", 400);
    }

    const updatedUser = await toggleUserStatus(id, body.isActive, session.id);
    return successResponse(updatedUser, `User ${body.isActive ? "activated" : "deactivated"} successfully`);
  } catch (error: any) {
    console.error("PATCH /api/users/[id]/status error:", error);
    return errorResponse(error.message || "Failed to update user status", 400);
  }
}
