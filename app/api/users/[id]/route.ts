import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateUserSchema } from "@/validators/user";
import { getUserById, updateUser, deleteUser } from "@/services/user-service";
import { successResponse, errorResponse } from "@/lib/response";
import { Role } from "@prisma/client";

export async function GET(
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
    const user = await getUserById(id);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error: any) {
    console.error("GET /api/users/[id] error:", error);
    return errorResponse(error.message || "Failed to fetch user", 500);
  }
}

export async function PUT(
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
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0]?.message || "Validation failed", 400);
    }

    const updatedUser = await updateUser(id, validation.data, session.id);
    return successResponse(updatedUser, "User updated successfully");
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return errorResponse(error.message || "Failed to update user", 400);
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
    if (session.role !== Role.ADMIN) {
      return errorResponse("Forbidden: User management is restricted to Admin accounts", 403);
    }

    const { id } = await params;
    const result = await deleteUser(id, session.id);
    return successResponse(result, result.message);
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return errorResponse(error.message || "Failed to delete user", 400);
  }
}
