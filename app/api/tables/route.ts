import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllTables, createTable } from "@/services/table-service";
import { tableSchema } from "@/validators/table";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const tables = await getAllTables();
    return successResponse(tables);
  } catch (error) {
    console.error("GET /api/tables error:", error);
    return errorResponse("Failed to fetch tables", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to create tables", 403);
    }

    const body = await request.json();
    const validation = tableSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const newTable = await createTable(validation.data);
    return successResponse(newTable, "Table created successfully", 201);
  } catch (error: unknown) {
    console.error("POST /api/tables error:", error);
    const message = error instanceof Error ? error.message : "Failed to create table";
    return errorResponse(message, 400);
  }
}
