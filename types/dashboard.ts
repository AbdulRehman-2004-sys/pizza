import { UserRole } from "./auth";

export type OrderStatusType = "PENDING" | "KITCHEN" | "READY" | "COMPLETED" | "CANCELLED";
export type OrderTypeType = "DINE_IN" | "TAKEOUT" | "DELIVERY";

export interface DashboardMetric {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  description: string;
  iconName: string;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  type: OrderTypeType;
  status: OrderStatusType;
  totalAmount: number;
  itemsCount: number;
  cashierName: string;
  createdAt: string;
}

export interface SalesChartData {
  time: string;
  sales: number;
  orders: number;
}

export interface CategorySalesData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStatsResponse {
  todaySales: number;
  todaySalesChange: string;
  todayOrdersCount: number;
  pendingKitchenCount: number;
  completedOrdersCount: number;
  recentOrders: RecentOrderItem[];
  salesTrend: SalesChartData[];
  categoryBreakdown: CategorySalesData[];
}
