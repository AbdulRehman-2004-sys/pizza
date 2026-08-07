import prisma from "@/lib/prisma";
import { ProcessPaymentInput } from "@/validators/billing";
import { getRestaurantSettings } from "@/services/settings-service";

export async function getReadyOrdersForBilling() {
  return prisma.order.findMany({
    where: {
      status: {
        in: ["READY", "PENDING", "KITCHEN", "COMPLETED"],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: true,
      table: true,
      customer: true,
      cashier: { select: { name: true } },
      invoice: {
        include: {
          payment: true,
        },
      },
    },
  });
}

export async function getInvoiceDetails(orderId: string) {
  const [settings, order] = await Promise.all([
    getRestaurantSettings(),
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        table: true,
        customer: true,
        cashier: { select: { name: true } },
        invoice: {
          include: {
            payment: {
              include: {
                processedBy: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!order) {
    throw new Error("Order not found.");
  }

  return {
    settings,
    order,
  };
}

export async function processOrderPayment(input: ProcessPaymentInput, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      invoice: true,
      kitchenOrder: true,
    },
  });

  if (!order) {
    throw new Error("Order was not found.");
  }

  if (order.status === "COMPLETED" && order.invoice) {
    throw new Error("This order has already been paid and completed.");
  }

  // Fallback for valid user ID
  let validUserId = userId;
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const fallbackUser = await prisma.user.findFirst({
      where: { isActive: true },
    });
    if (fallbackUser) {
      validUserId = fallbackUser.id;
    } else {
      throw new Error("No active staff user found to process billing.");
    }
  }

  return prisma.$transaction(async (tx) => {
    // 1. Generate Unique Invoice Number
    const count = await tx.invoice.count();
    const invoiceNumber = `INV-${1001 + count}`;

    // 2. Create Invoice Record if not exists
    let invoice = order.invoice;
    if (!invoice) {
      invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          discountAmount: order.discountAmount,
          grandTotal: order.totalAmount,
          createdById: validUserId,
        },
      });
    }

    // 3. Create Payment Record
    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        method: input.paymentMethod,
        amount: input.amountPaid,
        processedById: validUserId,
      },
    });

    // 4. Update Order status -> COMPLETED
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED" },
    });

    // 5. Update KitchenOrder status -> COMPLETED
    if (order.kitchenOrder) {
      await tx.kitchenOrder.update({
        where: { id: order.kitchenOrder.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          statusHistory: {
            create: {
              status: "COMPLETED",
              changedById: validUserId,
            },
          },
        },
      });
    }

    // 6. Release Dining Table -> AVAILABLE
    if (order.type === "DINE_IN" && order.tableId) {
      await tx.table.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      });
    }

    return {
      order: updatedOrder,
      invoice,
      payment,
    };
  });
}
