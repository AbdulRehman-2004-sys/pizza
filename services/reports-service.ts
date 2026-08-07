import prisma from "@/lib/prisma";
import { ReportFilterParams, TopItemsQueryParams, MonthlyQueryParams } from "@/validators/reports";
import { OrderStatus, OrderType, PaymentMethod } from "@prisma/client";

function buildDateRangeWhere(shortcut: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = null;

  if (shortcut === "TODAY") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (shortcut === "YESTERDAY") {
    start = new Date(now);
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setDate(now.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (shortcut === "THIS_WEEK") {
    start = new Date(now);
    const dayOfWeek = now.getDay();
    start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (shortcut === "THIS_MONTH") {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (shortcut === "CUSTOM" || startDate || endDate) {
    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }
  }

  const createdAtWhere: any = {};
  if (start) createdAtWhere.gte = start;
  if (end) createdAtWhere.lte = end;

  return Object.keys(createdAtWhere).length > 0 ? createdAtWhere : undefined;
}

export async function getReportsSummary(filters: ReportFilterParams) {
  const dateWhere = buildDateRangeWhere(filters.shortcut, filters.startDate, filters.endDate);

  const baseWhere: any = {};
  if (dateWhere) baseWhere.createdAt = dateWhere;
  if (filters.orderType && filters.orderType !== "ALL") baseWhere.type = filters.orderType as OrderType;

  // Completed Orders Aggregate
  const completedWhere = { ...baseWhere, status: OrderStatus.COMPLETED };
  const [completedAggregate, completedOrdersCount, cancelledOrdersCount, totalOrdersCount] = await Promise.all([
    prisma.order.aggregate({
      where: completedWhere,
      _sum: { totalAmount: true, subtotal: true, taxAmount: true, discountAmount: true },
      _avg: { totalAmount: true },
    }),
    prisma.order.count({ where: completedWhere }),
    prisma.order.count({ where: { ...baseWhere, status: OrderStatus.CANCELLED } }),
    prisma.order.count({ where: baseWhere }),
  ]);

  // Total Items Sold Aggregate for Completed Orders
  const itemsAggregate = await prisma.orderItem.aggregate({
    where: {
      order: completedWhere,
    },
    _sum: { quantity: true },
  });

  const totalSales = completedAggregate._sum.totalAmount || 0;
  const averageOrderValue = completedOrdersCount > 0 ? totalSales / completedOrdersCount : 0;
  const totalItemsSold = itemsAggregate._sum.quantity || 0;

  return {
    totalSales,
    subtotal: completedAggregate._sum.subtotal || 0,
    taxAmount: completedAggregate._sum.taxAmount || 0,
    discountAmount: completedAggregate._sum.discountAmount || 0,
    totalOrders: totalOrdersCount,
    completedOrders: completedOrdersCount,
    cancelledOrders: cancelledOrdersCount,
    averageOrderValue,
    totalItemsSold,
  };
}

export async function getDailySalesReport(filters: ReportFilterParams) {
  const dateWhere = buildDateRangeWhere(filters.shortcut || "TODAY", filters.startDate, filters.endDate);

  const baseWhere: any = {};
  if (dateWhere) baseWhere.createdAt = dateWhere;

  const completedWhere = { ...baseWhere, status: OrderStatus.COMPLETED };

  // Financial aggregates
  const [completedAggregate, completedCount, cancelledCount, totalCount] = await Promise.all([
    prisma.order.aggregate({
      where: completedWhere,
      _sum: { totalAmount: true, subtotal: true, taxAmount: true, discountAmount: true },
    }),
    prisma.order.count({ where: completedWhere }),
    prisma.order.count({ where: { ...baseWhere, status: OrderStatus.CANCELLED } }),
    prisma.order.count({ where: baseWhere }),
  ]);

  // Order Type Breakdowns
  const [dineInOrders, takeoutOrders, deliveryOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { ...completedWhere, type: OrderType.DINE_IN },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { ...completedWhere, type: OrderType.TAKEOUT },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { ...completedWhere, type: OrderType.DELIVERY },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalSales = completedAggregate._sum.totalAmount || 0;

  return {
    metrics: {
      totalSales,
      subtotal: completedAggregate._sum.subtotal || 0,
      taxAmount: completedAggregate._sum.taxAmount || 0,
      discountAmount: completedAggregate._sum.discountAmount || 0,
      grandTotal: totalSales,
      totalOrders: totalCount,
      completedOrders: completedCount,
      cancelledOrders: cancelledCount,
      averageOrderValue: completedCount > 0 ? totalSales / completedCount : 0,
    },
    orderTypes: {
      dineIn: { count: dineInOrders._count.id || 0, amount: dineInOrders._sum.totalAmount || 0 },
      takeout: { count: takeoutOrders._count.id || 0, amount: takeoutOrders._sum.totalAmount || 0 },
      delivery: { count: deliveryOrders._count.id || 0, amount: deliveryOrders._sum.totalAmount || 0 },
    },
  };
}

export async function getMonthlySalesReport(params: MonthlyQueryParams) {
  const { month, year } = params;

  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const baseWhere = {
    createdAt: { gte: startOfMonth, lte: endOfMonth },
  };

  const completedWhere = { ...baseWhere, status: OrderStatus.COMPLETED };

  const [aggregate, completedCount, cancelledCount, totalCount, orders] = await Promise.all([
    prisma.order.aggregate({
      where: completedWhere,
      _sum: { totalAmount: true, taxAmount: true, discountAmount: true },
    }),
    prisma.order.count({ where: completedWhere }),
    prisma.order.count({ where: { ...baseWhere, status: OrderStatus.CANCELLED } }),
    prisma.order.count({ where: baseWhere }),
    prisma.order.findMany({
      where: completedWhere,
      select: { createdAt: true, totalAmount: true },
    }),
  ]);

  const totalSales = aggregate._sum.totalAmount || 0;
  const daysInMonth = endOfMonth.getDate();

  // Group sales by day of month for Recharts Trend Chart
  const trendMap: { [day: number]: { sales: number; count: number } } = {};
  for (let i = 1; i <= daysInMonth; i++) {
    trendMap[i] = { sales: 0, count: 0 };
  }

  orders.forEach((o) => {
    const day = new Date(o.createdAt).getDate();
    if (trendMap[day]) {
      trendMap[day].sales += o.totalAmount;
      trendMap[day].count += 1;
    }
  });

  const dailyTrend = Object.keys(trendMap).map((dayStr) => {
    const dayNum = Number(dayStr);
    return {
      day: `Day ${dayNum}`,
      date: `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
      sales: trendMap[dayNum].sales,
      orders: trendMap[dayNum].count,
    };
  });

  return {
    metrics: {
      totalSales,
      taxAmount: aggregate._sum.taxAmount || 0,
      discountAmount: aggregate._sum.discountAmount || 0,
      totalOrders: totalCount,
      completedOrders: completedCount,
      cancelledOrders: cancelledCount,
      averageOrderValue: completedCount > 0 ? totalSales / completedCount : 0,
    },
    dailyTrend,
  };
}

export async function getTopSellingItems(params: TopItemsQueryParams) {
  const dateWhere = buildDateRangeWhere(params.shortcut, params.startDate, params.endDate);

  const completedWhere: any = {
    status: OrderStatus.COMPLETED,
  };
  if (dateWhere) completedWhere.createdAt = dateWhere;

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: completedWhere,
    },
    select: {
      productName: true,
      quantity: true,
      totalPrice: true,
      menuItem: {
        select: {
          category: { select: { name: true } },
        },
      },
    },
  });

  const itemMap: { [name: string]: { name: string; category: string; quantity: number; revenue: number } } = {};

  orderItems.forEach((item) => {
    const name = item.productName || "Unknown Item";
    const category = item.menuItem?.category?.name || "General";
    if (!itemMap[name]) {
      itemMap[name] = { name, category, quantity: 0, revenue: 0 };
    }
    itemMap[name].quantity += item.quantity;
    itemMap[name].revenue += item.totalPrice;
  });

  let itemList = Object.values(itemMap);

  if (params.sortBy === "revenue") {
    itemList.sort((a, b) => b.revenue - a.revenue);
  } else {
    itemList.sort((a, b) => b.quantity - a.quantity);
  }

  itemList = itemList.slice(0, params.topLimit || 10);

  return itemList;
}

export async function getPaymentMethodReport(filters: ReportFilterParams) {
  const dateWhere = buildDateRangeWhere(filters.shortcut, filters.startDate, filters.endDate);

  const paymentWhere: any = {
    invoice: {
      order: {
        status: OrderStatus.COMPLETED,
      },
    },
  };

  if (dateWhere) {
    paymentWhere.invoice.order.createdAt = dateWhere;
  }

  const payments = await prisma.payment.findMany({
    where: paymentWhere,
    select: {
      method: true,
      amount: true,
    },
  });

  const methodMap: { [key in PaymentMethod]: { count: number; totalAmount: number } } = {
    CASH: { count: 0, totalAmount: 0 },
    CARD: { count: 0, totalAmount: 0 },
    JAZZCASH: { count: 0, totalAmount: 0 },
    EASYPAISA: { count: 0, totalAmount: 0 },
  };

  let grandTotalAmount = 0;

  payments.forEach((p) => {
    if (methodMap[p.method]) {
      methodMap[p.method].count += 1;
      methodMap[p.method].totalAmount += p.amount;
      grandTotalAmount += p.amount;
    }
  });

  const result = Object.entries(methodMap).map(([method, data]) => {
    const percentage = grandTotalAmount > 0 ? (data.totalAmount / grandTotalAmount) * 100 : 0;
    return {
      method,
      count: data.count,
      amount: data.totalAmount,
      percentage: Number(percentage.toFixed(1)),
    };
  });

  return {
    grandTotalAmount,
    totalPayments: payments.length,
    methods: result,
  };
}
