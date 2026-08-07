import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateKitchenOrderStatus } from "@/services/kitchen-service";
import { OrderStatus } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/response";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const updated = await updateKitchenOrderStatus(id, validation.data.status, session.id);
    return successResponse(updated, `Kitchen status updated to ${validation.data.status}`);
  } catch (error: unknown) {
    console.error("PUT /api/kitchen/orders/[id]/status error:", error);
    const message = error instanceof Error ? error.message : "Failed to update kitchen status";
    return errorResponse(message, 400);
  }
}
