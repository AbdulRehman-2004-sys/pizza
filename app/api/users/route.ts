import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { userQuerySchema, createUserSchema } from "@/validators/user";
import { getUsers, createUser } from "@/services/user-service";
import { successResponse, errorResponse } from "@/lib/response";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== Role.ADMIN) {
      return errorResponse("Forbidden: User management is restricted to Admin accounts", 403);
    }

    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validation = userQuerySchema.safeParse(rawParams);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0]?.message || "Invalid query parameters", 400);
    }

    const data = await getUsers(validation.data);
    return successResponse(data);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return errorResponse(error.message || "Failed to fetch users", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== Role.ADMIN) {
      return errorResponse("Forbidden: User management is restricted to Admin accounts", 403);
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0]?.message || "Validation failed", 400);
    }

    const user = await createUser(validation.data);
    return successResponse(user, "User created successfully", 201);
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return errorResponse(error.message || "Failed to create user", 400);
  }
}
