import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTableById, updateTable, deleteTable } from "@/services/table-service";
import { tableSchema } from "@/validators/table";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    const table = await getTableById(id);
    if (!table) {
      return errorResponse("Table not found", 404);
    }
    return successResponse(table);
  } catch (error) {
    console.error("GET /api/tables/[id] error:", error);
    return errorResponse("Failed to fetch table details", 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to edit tables", 403);
    }

    const body = await request.json();
    const validation = tableSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updateTable(id, validation.data);
    return successResponse(updated, "Table updated successfully");
  } catch (error: unknown) {
    console.error("PUT /api/tables/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update table";
    return errorResponse(message, 400);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required to delete tables", 403);
    }

    await deleteTable(id);
    return successResponse({ id }, "Table deleted successfully");
  } catch (error: unknown) {
    console.error("DELETE /api/tables/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete table";
    return errorResponse(message, 400);
  }
}
