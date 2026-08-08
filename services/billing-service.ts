import prisma, { safeDbQuery } from "@/lib/prisma";
import { ProcessPaymentInput } from "@/validators/billing";
import { getRestaurantSettings } from "@/services/settings-service";

export async function getReadyOrdersForBilling() {
  return safeDbQuery(async () => {
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
  });
}

export async function getInvoiceDetails(orderId: string) {
  return safeDbQuery(async () => {
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
  });
}

export async function processOrderPayment(input: ProcessPaymentInput, userId: string) {
  return safeDbQuery(async () => {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        invoice: {
          include: { payment: true },
        },
        kitchenOrders: true,
      },
    });

    if (!order) {
      throw new Error("Order was not found.");
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

    return prisma.$transaction(
      async (tx) => {
        // 1. Check if invoice for this order already exists in database
        let invoice: any = order.invoice;
        if (!invoice) {
          invoice = await tx.invoice.findUnique({
            where: { orderId: order.id },
            include: { payment: true },
          });
        }

        // 2. Create Invoice Record if not exists
        if (!invoice) {
          // Find highest existing invoice number to prevent collisions
          const lastInvoice = await tx.invoice.findFirst({
            orderBy: { createdAt: "desc" },
            select: { invoiceNumber: true },
          });

          let nextNum = 1001;
          if (lastInvoice && lastInvoice.invoiceNumber) {
            const match = lastInvoice.invoiceNumber.match(/\d+/);
            if (match) {
              nextNum = parseInt(match[0], 10) + 1;
            }
          }

          let invoiceNumber = `INV-${nextNum}`;

          // Double check uniqueness
          const existingInvNumber = await tx.invoice.findUnique({
            where: { invoiceNumber },
          });
          if (existingInvNumber) {
            invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
          }

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
            include: { payment: true },
          });
        }

        // 3. Create or Update Payment Record
        let payment = invoice.payment;
        if (payment) {
          payment = await tx.payment.update({
            where: { id: payment.id },
            data: {
              method: input.paymentMethod,
              amount: input.amountPaid,
              processedById: validUserId,
              paidAt: new Date(),
            },
          });
        } else {
          payment = await tx.payment.create({
            data: {
              invoiceId: invoice.id,
              method: input.paymentMethod,
              amount: input.amountPaid,
              processedById: validUserId,
            },
          });
        }

        // 4. Return invoice and payment results (order status remains active until cashier clicks [ Paid ])
        return {
          invoice,
          payment,
          order,
        };
      },
      { maxWait: 10000, timeout: 30000 }
    );
  });
}
