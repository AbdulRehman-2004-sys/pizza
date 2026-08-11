import prisma, { safeDbQuery } from "@/lib/prisma";
import { OrderStatus, OrderType } from "@prisma/client";

export async function createKOTTicket(tx: any, orderId: string) {
  const count = await tx.kitchenOrder.count();
  const kotNumber = `KOT-${1001 + count}`;

  const kitchenOrder = await tx.kitchenOrder.create({
    data: {
      kotNumber,
      orderId,
      status: "PENDING",
      statusHistory: {
        create: [
          {
            status: "PENDING",
          },
        ],
      },
    },
  });

  return kitchenOrder;
}

export async function getKitchenQueue(filters?: {
  status?: string;
  type?: string;
  search?: string;
}) {
  return safeDbQuery(async () => {
    const whereClause: any = {};

    // Status Filtering
    if (filters?.status && filters.status !== "ALL") {
      whereClause.status = filters.status as OrderStatus;
    } else {
      whereClause.status = {
        in: ["PENDING", "KITCHEN", "READY", "COMPLETED"],
      };
    }

    // Fetch orders
    const kitchenOrders = await prisma.kitchenOrder.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      include: {
        order: {
          include: {
            items: true,
            table: true,
            customer: true,
            cashier: { select: { name: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: { changedBy: { select: { name: true } } },
        },
      },
    });

    // Filter in memory for search & order type if specified
    return kitchenOrders.filter((kot) => {
      if (filters?.type && filters.type !== "ALL" && kot.order.type !== filters.type) {
        return false;
      }
      if (filters?.search && filters.search.trim().length > 0) {
        const q = filters.search.toLowerCase().trim();
        const matchesOrderNum = kot.order.orderNumber.toLowerCase().includes(q);
        const matchesKOTNum = kot.kotNumber.toLowerCase().includes(q);
        const matchesCust = kot.order.customer?.name.toLowerCase().includes(q);
        const matchesTable = kot.order.tableNumber?.toString().includes(q);
        return matchesOrderNum || matchesKOTNum || matchesCust || matchesTable;
      }
      return true;
    });
  }, 2, []);
}

export async function updateKitchenOrderStatus(
  kitchenOrderId: string,
  newStatus: OrderStatus,
  changedById?: string
) {
  const existing = await prisma.kitchenOrder.findUnique({
    where: { id: kitchenOrderId },
  });

  if (!existing) {
    throw new Error("Kitchen order ticket not found");
  }

  // Validate status transition sequence
  if (existing.status === "COMPLETED" && newStatus !== "COMPLETED") {
    throw new Error("Completed kitchen tickets cannot be reverted.");
  }

  // Validate changedById existence (fallback if database was re-seeded during active session)
  let validChangedById: string | null = changedById || null;
  if (changedById) {
    const existingUser = await prisma.user.findUnique({
      where: { id: changedById },
    });
    if (!existingUser) {
      const fallbackUser = await prisma.user.findFirst({
        where: { isActive: true },
      });
      validChangedById = fallbackUser ? fallbackUser.id : null;
    }
  }

  const now = new Date();
  const updateData: any = {
    status: newStatus,
  };

  if (newStatus === "KITCHEN" && !existing.startedAt) {
    updateData.startedAt = now;
  }
  if (newStatus === "READY" && !existing.readyAt) {
    updateData.readyAt = now;
  }
  if (newStatus === "COMPLETED" && !existing.completedAt) {
    updateData.completedAt = now;
  }

  return safeDbQuery(async () => {
    return prisma.$transaction(
      async (tx) => {
        // 1. Update KitchenOrder ticket
        const updatedKOT = await tx.kitchenOrder.update({
          where: { id: kitchenOrderId },
          data: {
            ...updateData,
            statusHistory: {
              create: {
                status: newStatus,
                changedById: validChangedById,
              },
            },
          },
          include: {
            order: true,
          },
        });

        // 2. Sync status to main Order model
        await tx.order.update({
          where: { id: updatedKOT.orderId },
          data: { status: newStatus },
        });

        return updatedKOT;
      },
      { maxWait: 15000, timeout: 60000 }
    );
  });
}

export async function getKitchenDashboardStats() {
  return safeDbQuery(async () => {
    const [pendingCount, preparingCount, readyCount, completedTodayCount] = await Promise.all([
      prisma.kitchenOrder.count({ where: { status: "PENDING" } }),
      prisma.kitchenOrder.count({ where: { status: "KITCHEN" } }),
      prisma.kitchenOrder.count({ where: { status: "READY" } }),
      prisma.kitchenOrder.count({ where: { status: "COMPLETED" } }),
    ]);

    return {
      pendingCount,
      preparingCount,
      readyCount,
      completedTodayCount,
    };
  }, 2, { pendingCount: 0, preparingCount: 0, readyCount: 0, completedTodayCount: 0 });
}

export async function getReadyNotifications() {
  return safeDbQuery(async () => {
    return prisma.kitchenOrder.findMany({
      where: { status: "READY" },
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            table: true,
            customer: true,
          },
        },
      },
    });
  }, 2, []);
}
