import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getInvoiceDetails } from "@/services/billing-service";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // id can be orderId
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const data = await getInvoiceDetails(id, session.id);
    return successResponse(data);
  } catch (error) {
    console.error("GET /api/billing/invoices/[id] error:", error);
    return errorResponse("Failed to fetch invoice details", 500);
  }
}
