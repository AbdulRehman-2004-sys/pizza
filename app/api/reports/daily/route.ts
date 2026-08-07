import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { reportFilterSchema } from "@/validators/reports";
import { getDailySalesReport } from "@/services/reports-service";
import { successResponse, errorResponse } from "@/lib/response";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }
    if (session.role !== Role.ADMIN) {
      return errorResponse("Forbidden: Reports are restricted to Admin accounts", 403);
    }

    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validation = reportFilterSchema.safeParse(rawParams);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0]?.message || "Invalid query parameters", 400);
    }

    const data = await getDailySalesReport(validation.data);
    return successResponse(data);
  } catch (error: any) {
    console.error("GET /api/reports/daily error:", error);
    return errorResponse(error.message || "Failed to fetch daily sales report", 500);
  }
}
