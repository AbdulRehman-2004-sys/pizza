import prisma from "@/lib/prisma";
import { RecentOrderItem } from "@/types/dashboard";

export async function getDashboardStats() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      orders,
      todayOrdersCount,
      pendingKitchenCount,
      completedOrdersCount,
      totalSalesAggregate,
      totalCategories,
      totalMenuItems,
      totalTables,
      availableTables,
      occupiedTables,
    ] = await Promise.all([
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          cashier: { select: { name: true } },
          customer: { select: { name: true } },
          items: true,
        },
      }),
      prisma.order.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.order.count({
        where: { status: { in: ["KITCHEN", "PENDING", "READY"] } },
      }),
      prisma.order.count({
        where: { status: "COMPLETED", createdAt: { gte: todayStart } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "COMPLETED", createdAt: { gte: todayStart } },
      }),
      prisma.category.count(),
      prisma.menuItem.count(),
      prisma.table.count(),
      prisma.table.count({ where: { status: "AVAILABLE" } }),
      prisma.table.count({ where: { status: "OCCUPIED" } }),
    ]);

    const totalSales = totalSalesAggregate._sum.totalAmount || 0;

    const recentOrders: RecentOrderItem[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || "Walk-in Customer",
      type: order.type,
      status: order.status,
      totalAmount: order.totalAmount,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      cashierName: order.cashier?.name || "Cashier",
      createdAt: order.createdAt.toISOString(),
    }));

    return {
      todaySales: totalSales,
      todaySalesChange: "+0%",
      todayOrdersCount,
      pendingKitchenCount,
      completedOrdersCount,
      totalCategories,
      totalMenuItems,
      totalTables,
      availableTables,
      occupiedTables,
      recentOrders,
      salesTrend: [],
      categoryBreakdown: [],
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return {
      todaySales: 0,
      todaySalesChange: "0%",
      todayOrdersCount: 0,
      pendingKitchenCount: 0,
      completedOrdersCount: 0,
      totalCategories: 0,
      totalMenuItems: 0,
      totalTables: 0,
      availableTables: 0,
      occupiedTables: 0,
      recentOrders: [],
      salesTrend: [],
      categoryBreakdown: [],
    };
  }
}
