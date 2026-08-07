"use client";

import React, { useEffect, useState, useCallback } from "react";
import { OrderFilters } from "@/components/orders/order-filters";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderDetailsDrawer } from "@/components/orders/order-details-drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Utensils,
  Truck,
  Clock,
  Eye,
  RefreshCw,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function OrderManagementPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "HISTORY">("ACTIVE");

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [dateRangeShortcut, setDateRangeShortcut] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Data & Selected Order State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Compute date range based on shortcut selection
  const computeDatesFromShortcut = (shortcut: string) => {
    const now = new Date();
    if (shortcut === "TODAY") {
      const todayStr = now.toISOString().split("T")[0];
      return { start: todayStr, end: todayStr };
    }
    if (shortcut === "YESTERDAY") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      return { start: yStr, end: yStr };
    }
    if (shortcut === "7DAYS") {
      const past = new Date(now);
      past.setDate(now.getDate() - 6);
      return {
        start: past.toISOString().split("T")[0],
        end: now.toISOString().split("T")[0],
      };
    }
    return { start: "", end: "" };
  };

  const fetchOrders = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);

        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        if (searchQuery) params.set("search", searchQuery);
        if (selectedType !== "ALL") params.set("type", selectedType);

        // Tab-specific filters
        if (activeTab === "ACTIVE") {
          params.set("activeOnly", "true");
        } else if (activeTab === "COMPLETED") {
          params.set("completedOnly", "true");
        } else if (selectedStatus !== "ALL") {
          params.set("status", selectedStatus);
        }

        // Date Range logic
        let effectiveStart = startDate;
        let effectiveEnd = endDate;

        if (dateRangeShortcut !== "ALL" && dateRangeShortcut !== "CUSTOM") {
          const computed = computeDatesFromShortcut(dateRangeShortcut);
          effectiveStart = computed.start;
          effectiveEnd = computed.end;
        }

        if (effectiveStart) params.set("startDate", effectiveStart);
        if (effectiveEnd) params.set("endDate", effectiveEnd);

        const res = await fetch(`/api/orders?${params.toString()}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setOrders(json.data);
          if (json.pagination) {
            setPagination(json.pagination);
          }
        } else {
          if (!silent) toast.error(json.error || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
        if (!silent) toast.error("Network error loading orders");
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [
      activeTab,
      page,
      limit,
      searchQuery,
      selectedType,
      selectedStatus,
      dateRangeShortcut,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    ]
  );

  useEffect(() => {
    fetchOrders(false);
    // Auto polling for Active Orders tab every 10 seconds
    if (activeTab === "ACTIVE") {
      const interval = setInterval(() => fetchOrders(true), 10000);
      return () => clearInterval(interval);
    }
  }, [fetchOrders, activeTab]);

  // Reset Page to 1 whenever filters change
  const handleFilterChange = (setter: (val: any) => void, value: any) => {
    setPage(1);
    setter(value);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("ALL");
    setSelectedStatus("ALL");
    setDateRangeShortcut("ALL");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-600">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order Management & History</h1>
            <p className="text-xs text-slate-500">
              Inspect, search, filter, and audit active and historical customer orders
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(false)}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh Orders
        </Button>
      </div>

      {/* Main Tab Navigation Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveTab("ACTIVE");
            setPage(1);
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === "ACTIVE"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="h-4 w-4 text-pizza-400" />
          <span>Active Orders</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("COMPLETED");
            setPage(1);
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === "COMPLETED"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Completed Orders</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("HISTORY");
            setPage(1);
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === "HISTORY"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Receipt className="h-4 w-4 text-blue-400" />
          <span>Full Order History</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={(val) => handleFilterChange(setSearchQuery, val)}
        selectedType={selectedType}
        onTypeChange={(val) => handleFilterChange(setSelectedType, val)}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => handleFilterChange(setSelectedStatus, val)}
        dateRangeShortcut={dateRangeShortcut}
        onDateRangeShortcutChange={(val) => handleFilterChange(setDateRangeShortcut, val)}
        startDate={startDate}
        onStartDateChange={(val) => handleFilterChange(setStartDate, val)}
        endDate={endDate}
        onEndDateChange={(val) => handleFilterChange(setEndDate, val)}
        sortBy={sortBy}
        onSortByChange={(val) => handleFilterChange(setSortBy, val)}
        sortOrder={sortOrder}
        onSortOrderChange={(val) => handleFilterChange(setSortOrder, val)}
        onResetFilters={handleResetFilters}
      />

      {/* Orders Data View */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {/* Table Container */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-extrabold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Order & Invoice</th>
                    <th className="p-4">Type & Location</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Payment</th>
                    <th className="p-4">Created Time</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {orders.map((order) => {
                    const isPaid = !!order.invoice?.payment;
                    const itemsCount = order.items ? order.items.length : order._count?.items || 0;
                    const elapsed = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true });

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        {/* Order & Invoice Number */}
                        <td className="p-4">
                          <span className="font-extrabold text-slate-900 group-hover:text-pizza-600 transition-colors">
                            {order.orderNumber}
                          </span>
                          <p className="text-[10px] font-mono text-slate-400 font-semibold">
                            {order.invoice?.invoiceNumber || "Inv: Not Generated"}
                          </p>
                        </td>

                        {/* Order Type & Location */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                            {order.type === "DINE_IN" && <Utensils className="h-3.5 w-3.5 text-amber-500" />}
                            {order.type === "TAKEOUT" && <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />}
                            {order.type === "DELIVERY" && <Truck className="h-3.5 w-3.5 text-purple-500" />}
                            {order.type === "DINE_IN"
                              ? `Table #${order.tableNumber || order.table?.tableNumber || 1}`
                              : order.type === "TAKEOUT"
                              ? "Take Away"
                              : "Delivery"}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{order.customer?.name || "Walk-in Guest"}</p>
                          {order.customer?.phone && (
                            <p className="text-[10px] font-mono text-slate-400">{order.customer.phone}</p>
                          )}
                        </td>

                        {/* Items Count */}
                        <td className="p-4 font-bold text-slate-700">
                          {itemsCount} {itemsCount === 1 ? "item" : "items"}
                        </td>

                        {/* Total Amount */}
                        <td className="p-4 text-right font-black text-pizza-600 font-mono text-sm">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4 text-center">
                          <OrderStatusBadge status={order.status} size="sm" />
                        </td>

                        {/* Payment Badge */}
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isPaid ? "PAID" : "UNPAID"}
                          </span>
                        </td>

                        {/* Created & Elapsed Time */}
                        <td className="p-4">
                          <p className="font-medium text-slate-800">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">{elapsed}</p>
                        </td>

                        {/* View Action */}
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderId(order.id);
                            }}
                            leftIcon={<Eye className="h-3.5 w-3.5 text-pizza-500" />}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">
              Showing page <strong className="text-slate-900">{pagination.page}</strong> of{" "}
              <strong className="text-slate-900">{pagination.totalPages}</strong> ({pagination.total} total orders)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((prev) => prev + 1)}
                rightIcon={<ChevronRight className="h-4 w-4 text-slate-600" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No orders found"
          description="No customer orders match your selected tab, search query, or date range filters."
          icon={Receipt}
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Order Detail Drawer Slide-over */}
      {selectedOrderId && (
        <OrderDetailsDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOrderCancelled={() => fetchOrders(false)}
        />
      )}
    </div>
  );
}
