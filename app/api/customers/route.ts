import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { searchCustomerByPhone } from "@/services/order-service";
import { posCustomerSchema } from "@/validators/order";
import { successResponse, errorResponse } from "@/lib/response";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      const customers = await prisma.customer.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      });
      return successResponse(customers);
    }

    const customer = await searchCustomerByPhone(phone);
    return successResponse(customer);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return errorResponse("Failed to fetch customer", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthenticated", 401);
    }

    const body = await request.json();
    const validation = posCustomerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.error.errors);
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name: validation.data.name.trim(),
        phone: validation.data.phone.trim(),
        address: validation.data.address?.trim() || null,
      },
    });

    return successResponse(newCustomer, "Customer created successfully", 201);
  } catch (error: unknown) {
    console.error("POST /api/customers error:", error);
    const message = error instanceof Error ? error.message : "Failed to create customer";
    return errorResponse(message, 400);
  }
}
