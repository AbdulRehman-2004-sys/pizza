import prisma, { safeDbQuery } from "@/lib/prisma";
import { OrderQueryParams, CancelOrderInput } from "@/validators/order";
import { OrderStatus, OrderType, Role } from "@prisma/client";

export async function getOrders(params: OrderQueryParams) {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    status,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
    activeOnly,
    completedOnly,
  } = params;

  const skip = (page - 1) * limit;

  // Build Prisma Where Clause
  const where: any = {};

  // Status Filtering
  if (activeOnly) {
    where.status = { in: [OrderStatus.PENDING, OrderStatus.KITCHEN, OrderStatus.READY] };
  } else if (completedOnly) {
    where.status = OrderStatus.COMPLETED;
  } else if (status && status !== "ALL") {
    where.status = status as OrderStatus;
  }

  // Order Type Filtering
  if (type && type !== "ALL") {
    where.type = type as OrderType;
  }

  // Date Range Filtering
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.createdAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  // Debounced Search Query (Order #, Invoice #, Customer Name, Customer Phone)
  if (search && search.trim() !== "") {
    const query = search.trim();
    where.OR = [
      { orderNumber: { contains: query, mode: "insensitive" } },
      { invoice: { invoiceNumber: { contains: query, mode: "insensitive" } } },
      { customer: { name: { contains: query, mode: "insensitive" } } },
      { customer: { phone: { contains: query, mode: "insensitive" } } },
    ];
  }

  // Sorting
  const orderBy: any = {};
  if (sortBy === "totalAmount" || sortBy === "orderNumber" || sortBy === "status" || sortBy === "createdAt") {
    orderBy[sortBy] = sortOrder;
  } else {
    orderBy.createdAt = "desc";
  }

  // Execute Count & Data Queries in Parallel
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        customer: { select: { id: true, name: true, phone: true, address: true } },
        table: { select: { id: true, tableNumber: true, tableName: true } },
        cashier: { select: { id: true, name: true, email: true } },
        cancelledBy: { select: { id: true, name: true, email: true } },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            createdAt: true,
            payment: {
              select: {
                id: true,
                method: true,
                amount: true,
                paidAt: true,
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            sizeId: true,
            sizeName: true,
            extraCheese: true,
            cheesePrice: true,
            selectedToppings: true,
            itemNotes: true,
            quantity: true,
            sentQuantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
        kitchenOrders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            kotNumber: true,
            status: true,
            startedAt: true,
            readyAt: true,
            completedAt: true,
            createdAt: true,
            items: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      table: true,
      cashier: { select: { id: true, name: true, email: true, role: true } },
      cancelledBy: { select: { id: true, name: true, email: true, role: true } },
      items: true,
      kitchenOrders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          statusHistory: {
            orderBy: { createdAt: "desc" },
            include: {
              changedBy: { select: { id: true, name: true } },
            },
          },
        },
      },
      invoice: {
        include: {
          createdBy: { select: { id: true, name: true } },
          payment: {
            include: {
              processedBy: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  return order;
}

export async function cancelOrder(
  orderId: string,
  userId: string,
  userRole: string,
  reason: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      kitchenOrders: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Order is already cancelled.");
  }

  if (order.status === OrderStatus.COMPLETED && userRole !== Role.ADMIN) {
    throw new Error("Only Admins can perform an override cancellation on completed orders.");
  }

  // Validate active staff user ID
  let validUserId = userId;
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    const fallback = await prisma.user.findFirst({ where: { isActive: true } });
    if (fallback) validUserId = fallback.id;
  }

  return safeDbQuery(async () => {
    return prisma.$transaction(
      async (tx) => {
        // 1. Update Order status & audit fields
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.CANCELLED,
            cancellationReason: reason,
            cancelledAt: new Date(),
            cancelledById: validUserId,
          },
        });

        // 2. Update KitchenOrders status if present
        for (const kot of order.kitchenOrders) {
          await tx.kitchenOrder.update({
            where: { id: kot.id },
            data: {
              status: OrderStatus.CANCELLED,
              statusHistory: {
                create: {
                  status: OrderStatus.CANCELLED,
                  changedById: validUserId,
                },
              },
            },
          });
        }

        // 3. Release Dining Table to AVAILABLE if DINE_IN
        if (order.type === OrderType.DINE_IN && order.tableId) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: "AVAILABLE" },
          });
        }

        return updatedOrder;
      },
      { maxWait: 10000, timeout: 30000 }
    );
  });
}

export async function getAvailablePOSTables() {
  return prisma.table.findMany({
    orderBy: { tableNumber: "asc" },
  });
}

export async function searchCustomerByPhone(phone: string) {
  return prisma.customer.findFirst({
    where: { phone: { contains: phone } },
  });
}

export async function createPOSOrder(data: any, cashierId: string) {
  let customerId = data.customerId;
  const custName = data.customer?.name || data.customerName;
  const custPhone = data.customer?.phone || data.customerPhone;
  const custAddr = data.customer?.address || data.customerAddress;

  if (!customerId && custName && custPhone) {
    const existing = await prisma.customer.findUnique({
      where: { phone: custPhone },
    });
    if (existing) {
      customerId = existing.id;
    } else {
      const newCust = await prisma.customer.create({
        data: {
          name: custName,
          phone: custPhone,
          address: custAddr || null,
        },
      });
      customerId = newCust.id;
    }
  }

  // Financial Calculations Fallback
  const calculatedSubtotal =
    data.subtotal ??
    data.items.reduce((sum: number, item: any) => sum + (item.totalPrice || item.quantity * item.unitPrice), 0);

  let calculatedDiscount = data.discountAmount || 0;
  if (data.discount && data.discount.value > 0) {
    if (data.discount.type === "PERCENT") {
      calculatedDiscount = (calculatedSubtotal * data.discount.value) / 100;
    } else {
      calculatedDiscount = data.discount.value;
    }
  }
  calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);

  const taxable = Math.max(0, calculatedSubtotal - calculatedDiscount);
  const calculatedTax = data.taxAmount ?? (taxable * 0.16);
  const calculatedTotal = data.totalAmount ?? (taxable + calculatedTax);

  let validCashierId = cashierId;
  const existingUser = await prisma.user.findUnique({ where: { id: cashierId } });
  if (!existingUser) {
    const fallback = await prisma.user.findFirst({ where: { isActive: true } });
    if (fallback) validCashierId = fallback.id;
  }

  return safeDbQuery(async () => {
    return prisma.$transaction(
      async (tx) => {
        // If orderId is provided, update existing order in place
        if (data.orderId) {
          const existingOrder = await tx.order.findUnique({
            where: { id: data.orderId },
            include: { items: true },
          });

          if (existingOrder) {
            // Delete items that are no longer in incoming list (if unsent)
            const incomingItemKeys = new Set(
              data.items.map((i: any) => `${i.productId}_${i.sizeId || "nosize"}_${i.extraCheese}_${i.itemNotes || ""}`)
            );

            for (const existingItem of existingOrder.items) {
              const key = `${existingItem.productId}_${existingItem.sizeId || "nosize"}_${existingItem.extraCheese}_${existingItem.itemNotes || ""}`;
              if (!incomingItemKeys.has(key) && existingItem.sentQuantity === 0) {
                await tx.orderItem.delete({ where: { id: existingItem.id } });
              }
            }

            // Upsert incoming items
            for (const item of data.items) {
              const existingItem = existingOrder.items.find(
                (i) =>
                  i.productId === (item.productId || null) &&
                  i.sizeId === (item.sizeId || null) &&
                  i.extraCheese === (item.extraCheese || false) &&
                  (i.itemNotes || "") === (item.itemNotes || "")
              );

              if (existingItem) {
                await tx.orderItem.update({
                  where: { id: existingItem.id },
                  data: {
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                  },
                });
              } else {
                await tx.orderItem.create({
                  data: {
                    orderId: existingOrder.id,
                    productId: item.productId || null,
                    productName: item.productName,
                    sizeId: item.sizeId || null,
                    sizeName: item.sizeName || null,
                    extraCheese: item.extraCheese || false,
                    cheesePrice: item.cheesePrice || 0,
                    selectedToppings: item.selectedToppings ? JSON.stringify(item.selectedToppings) : undefined,
                    itemNotes: item.itemNotes || null,
                    quantity: item.quantity,
                    sentQuantity: 0,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                  },
                });
              }
            }

            const updatedOrder = await tx.order.update({
              where: { id: data.orderId },
              data: {
                type: data.type,
                subtotal: calculatedSubtotal,
                taxAmount: calculatedTax,
                discountAmount: calculatedDiscount,
                totalAmount: calculatedTotal,
                customerNotes: data.customerNotes || null,
                tableId: data.type === OrderType.DINE_IN ? data.tableId || null : null,
                tableNumber: data.type === OrderType.DINE_IN ? data.tableNumber || null : null,
                customerId: customerId || null,
              },
              include: { items: true, customer: true, table: true, kitchenOrders: true },
            });

            if (data.type === OrderType.DINE_IN && data.tableId) {
              await tx.table.update({
                where: { id: data.tableId },
                data: { status: "OCCUPIED" },
              });
            }

            return updatedOrder;
          }
        }

        // Otherwise create brand new Order
        const count = await tx.order.count();
        const orderNumber = `ORD-${1001 + count}`;

        const order = await tx.order.create({
          data: {
            orderNumber,
            status: OrderStatus.PENDING,
            type: data.type,
            subtotal: calculatedSubtotal,
            taxAmount: calculatedTax,
            discountAmount: calculatedDiscount,
            totalAmount: calculatedTotal,
            customerNotes: data.customerNotes || null,
            tableId: data.type === OrderType.DINE_IN ? data.tableId || null : null,
            tableNumber: data.type === OrderType.DINE_IN ? data.tableNumber || null : null,
            customerId: customerId || null,
            cashierId: validCashierId,
            items: {
              create: data.items.map((item: any) => ({
                productId: item.productId || null,
                productName: item.productName,
                sizeId: item.sizeId || null,
                sizeName: item.sizeName || null,
                extraCheese: item.extraCheese || false,
                cheesePrice: item.cheesePrice || 0,
                selectedToppings: item.selectedToppings ? JSON.stringify(item.selectedToppings) : undefined,
                itemNotes: item.itemNotes || null,
                quantity: item.quantity,
                sentQuantity: 0,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              })),
            },
          },
          include: { items: true, customer: true, table: true, kitchenOrders: true },
        });

        if (data.type === OrderType.DINE_IN && data.tableId) {
          await tx.table.update({
            where: { id: data.tableId },
            data: { status: "OCCUPIED" },
          });
        }

        return order;
      },
      { maxWait: 15000, timeout: 60000 }
    );
  });
}

export async function generateKOTForOrder(orderId: string, cashierId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      table: true,
      customer: true,
      cashier: { select: { id: true, name: true, email: true } },
      kitchenOrders: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  // Identify unsent items/quantities
  const unsentItems = order.items.filter((item) => item.quantity > item.sentQuantity);

  if (unsentItems.length === 0) {
    throw new Error("No new items to send to kitchen.");
  }

  let validCashierId = cashierId;
  const existingUser = await prisma.user.findUnique({ where: { id: cashierId } });
  if (!existingUser) {
    const fallback = await prisma.user.findFirst({ where: { isActive: true } });
    if (fallback) validCashierId = fallback.id;
  }

  return safeDbQuery(async () => {
    return prisma.$transaction(
      async (tx) => {
        const totalKotCount = await tx.kitchenOrder.count();
        const kotNumber = `KOT-${1001 + totalKotCount}`;

        const kitchenOrder = await tx.kitchenOrder.create({
          data: {
            kotNumber,
            orderId: order.id,
            status: OrderStatus.PENDING,
            statusHistory: {
              create: {
                status: OrderStatus.PENDING,
                changedById: validCashierId,
              },
            },
            items: {
              create: unsentItems.map((item) => {
                const unsentQty = item.quantity - item.sentQuantity;
                return {
                  orderItemId: item.id,
                  productName: item.productName,
                  sizeName: item.sizeName,
                  extraCheese: item.extraCheese,
                  selectedToppings: item.selectedToppings ? JSON.parse(JSON.stringify(item.selectedToppings)) : undefined,
                  itemNotes: item.itemNotes,
                  quantity: unsentQty,
                };
              }),
            },
          },
          include: {
            items: true,
            order: {
              include: {
                table: true,
                customer: true,
                cashier: true,
              },
            },
          },
        });

        // Update sentQuantity for each order item
        for (const item of unsentItems) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { sentQuantity: item.quantity },
          });
        }

        // Update order status to KITCHEN
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.KITCHEN },
        });

        // Fetch store settings for print header
        const settings = await tx.restaurantSettings.findFirst();

        return {
          ...kitchenOrder,
          restaurantName: settings?.restaurantName || "SliceMaster Pizzeria",
        };
      },
      { maxWait: 15000, timeout: 60000 }
    );
  });
}

export async function deleteOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      invoice: { include: { payment: true } },
      kitchenOrders: { include: { items: true, statusHistory: true } },
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  return safeDbQuery(async () => {
    return prisma.$transaction(
      async (tx) => {
        // 1. Delete associated payment records if present
        if (order.invoice?.payment) {
          await tx.payment.deleteMany({
            where: { invoiceId: order.invoice.id },
          });
        }

        // 2. Delete invoice if present
        if (order.invoice) {
          await tx.invoice.delete({
            where: { id: order.invoice.id },
          });
        }

        // 3. Delete kitchen order status histories & items & kitchen orders
        for (const kot of order.kitchenOrders) {
          await tx.kitchenStatusHistory.deleteMany({
            where: { kitchenOrderId: kot.id },
          });
          await tx.kitchenOrderItem.deleteMany({
            where: { kitchenOrderId: kot.id },
          });
          await tx.kitchenOrder.delete({
            where: { id: kot.id },
          });
        }

        // 4. Delete order items
        await tx.orderItem.deleteMany({
          where: { orderId },
        });

        // 5. Release dining table if dine-in
        if (order.tableId) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: "AVAILABLE" },
          });
        }

        // 6. Delete Order
        return tx.order.delete({
          where: { id: orderId },
        });
      },
      { maxWait: 10000, timeout: 30000 }
    );
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return safeDbQuery(async () => {
    return prisma.$transaction(
      async (tx) => {
        const order = await tx.order.update({
          where: { id: orderId },
          data: { status },
        });

        if (status === OrderStatus.COMPLETED) {
          await tx.kitchenOrder.updateMany({
            where: { orderId },
            data: { status: "COMPLETED" },
          });

          if (order.tableId) {
            await tx.table.update({
              where: { id: order.tableId },
              data: { status: "AVAILABLE" },
            });
          }
        }

        return order;
      },
      { maxWait: 10000, timeout: 30000 }
    );
  });
}


