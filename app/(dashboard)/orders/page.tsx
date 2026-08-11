"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/use-cart-store";
import { OrderFilters } from "@/components/orders/order-filters";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderDetailsDrawer } from "@/components/orders/order-details-drawer";
import { PaymentModal } from "@/components/billing/payment-modal";
import { ThermalReceipt } from "@/components/billing/thermal-receipt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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
  ChevronLeft,
  ChevronRight,
  Edit3,
  Printer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function OrderManagementPage() {
  const router = useRouter();
  const loadOrderIntoCart = useCartStore((state) => state.loadOrderIntoCart);

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

  // Selection & Bulk Delete state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Billing & Receipt Modal States
  const [orderForPayment, setOrderForPayment] = useState<any | null>(null);
  const [activeFinalReceipt, setActiveFinalReceipt] = useState<any | null>(null);

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

        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (selectedType !== "ALL") params.set("type", selectedType);

        // Map tab or selected status filter
        if (selectedStatus !== "ALL") {
          params.set("status", selectedStatus);
        } else {
          params.set("activeOnly", "true");
        }

        let effectiveStart = startDate;
        let effectiveEnd = endDate;
        if (dateRangeShortcut !== "CUSTOM") {
          const computed = computeDatesFromShortcut(dateRangeShortcut);
          effectiveStart = computed.start;
          effectiveEnd = computed.end;
        }

        if (effectiveStart) params.set("startDate", effectiveStart);
        if (effectiveEnd) params.set("endDate", effectiveEnd);

        const res = await fetch(`/api/orders?${params.toString()}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setOrders(json.data || []);
          if (json.pagination) {
            setPagination(json.pagination);
          }
        } else {
          toast.error(json.error || "Failed to load orders");
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
        toast.error("Network error fetching orders");
      } finally {
        setIsLoading(false);
      }
    },
    [
      page,
      limit,
      sortBy,
      sortOrder,
      searchQuery,
      selectedType,
      selectedStatus,
      dateRangeShortcut,
      startDate,
      endDate,
    ]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  const isAllSelected = orders.length > 0 && selectedOrderIds.length === orders.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(orders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, id]);
    } else {
      setSelectedOrderIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    try {
      setIsBulkDeleting(true);
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrderIds }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to delete orders");
        return;
      }
      toast.success(`${selectedOrderIds.length} order(s) deleted successfully!`);
      setSelectedOrderIds([]);
      setShowBulkDeleteConfirm(false);
      fetchOrders(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Network error deleting orders");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Edit Order Action: Load back into Cart
  const handleEditOrder = (order: any) => {
    loadOrderIntoCart(order);
    toast.success(`Loaded Order #${order.orderNumber} into cart!`);
    router.push("/pos");
  };

  // Final Bill Action: Generate invoice record & open thermal receipt
  const handleFinalBill = async (order: any) => {
    try {
      const res = await fetch(`/api/billing/invoices/${order.id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setActiveFinalReceipt(json.data);
        toast.success(`Bill receipt generated for Order #${order.orderNumber}`);
        await fetchOrders(true);
      } else {
        toast.error(json.error || "Failed to generate bill receipt");
      }
    } catch (error) {
      console.error("Final bill error:", error);
      toast.error("Network error generating final bill receipt");
    }
  };

  // Open Payment Modal for Billed Orders
  const handleOpenPayment = (order: any) => {
    setOrderForPayment({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      type: order.type,
      tableNumber: order.tableNumber || order.table?.tableNumber,
      customer: order.customer,
    });
  };

  // Direct Thermal Receipt Fetch & Print Action
  const handlePrintReceipt = async (orderId: string) => {
    try {
      const res = await fetch(`/api/billing/invoices/${orderId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setActiveFinalReceipt(json.data);
      } else {
        toast.error(json.error || "Failed to load thermal receipt");
      }
    } catch (error) {
      console.error("Fetch receipt error:", error);
      toast.error("Network error loading thermal receipt");
    }
  };

  // Mark Active Order as Completed
  const handleMarkCompleted = async (orderId: string, orderNumber: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Order #${orderNumber} marked as Completed & moved to Completed Orders!`);
        fetchOrders(false);
      } else {
        toast.error(json.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Mark completed error:", error);
      toast.error("Network error updating order status");
    }
  };

  // Delete Order Record Handler
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete Order #${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Order #${orderNumber} deleted successfully.`);
        setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
        fetchOrders(false);
      } else {
        toast.error(json.error || "Failed to delete order");
      }
    } catch (error) {
      console.error("Delete order error:", error);
      toast.error("Network error deleting order");
    }
  };

  // Handle Payment Confirmation Success
  const handlePaymentSuccess = async (paymentResult: any) => {
    toast.success("Payment confirmed! Order completed.");
    await fetchOrders(false);
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
              Inspect, search, filter, edit, and process final billing for customer orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedOrderIds.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Selected ({selectedOrderIds.length})
            </Button>
          )}

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
                    <th className="p-4 w-10">
                      <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-4">Order & Invoice</th>
                    <th className="p-4">Type & Location</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Payment</th>
                    <th className="p-4">Created Time</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {orders.map((order) => {
                    const isCompleted = order.status === "COMPLETED";
                    const isPaid = isCompleted || !!order.invoice?.payment;
                    const isCancelled = order.status === "CANCELLED";
                    const itemsCount = order.items ? order.items.length : order._count?.items || 0;
                    const elapsed = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true });

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        {/* Checkbox Column */}
                        <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                          />
                        </td>

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

                        {/* Action Buttons Column */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* View Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrderId(order.id)}
                              className="px-2 h-8 text-[11px]"
                              leftIcon={<Eye className="h-3.5 w-3.5 text-pizza-500" />}
                            >
                              View
                            </Button>

                            {/* Active Order Actions */}
                            {!isCompleted && !isCancelled && (
                              <>
                                {!order.invoice ? (
                                  // UNBILLED ACTIVE ORDER: Show Final Bill & Edit
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleFinalBill(order)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 h-8 shadow-sm"
                                      leftIcon={<Receipt className="h-3.5 w-3.5" />}
                                    >
                                      Final Bill
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditOrder(order)}
                                      className="px-2 h-8 text-[11px] font-bold border-slate-300 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                                      leftIcon={<Edit3 className="h-3.5 w-3.5 text-amber-600" />}
                                    >
                                      Edit
                                    </Button>
                                  </>
                                ) : (
                                  // BILLED ACTIVE ORDER: Show Paid button & Receipt button
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenPayment(order)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 h-8 shadow-sm"
                                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                    >
                                      Paid
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePrintReceipt(order.id)}
                                      className="px-2 h-8 text-[11px] font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                                      leftIcon={<Printer className="h-3.5 w-3.5 text-blue-600" />}
                                    >
                                      Receipt
                                    </Button>
                                  </>
                                )}
                              </>
                            )}

                            {/* Completed / Historical Order Actions */}
                            {isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintReceipt(order.id)}
                                className="px-2 h-8 text-[11px] font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                                leftIcon={<Printer className="h-3.5 w-3.5 text-blue-600" />}
                              >
                                Receipt
                              </Button>
                            )}

                            {/* Trash Icon Button for ALL Orders */}
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Order Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
            <div>
              Showing {orders.length} of {pagination.total} orders
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span>
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Orders Found"
          description="There are no order records matching your current filter criteria."
          icon={ShoppingBag}
        />
      )}

      {/* Slide-Over Drawer for Detailed Order Inspection */}
      {selectedOrderId && (
        <OrderDetailsDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOrderUpdated={() => fetchOrders(true)}
        />
      )}

      {/* Final Settlement & Billing Modal */}
      {orderForPayment && (
        <PaymentModal
          isOpen={!!orderForPayment}
          onClose={() => setOrderForPayment(null)}
          onSuccess={handlePaymentSuccess}
          order={orderForPayment}
        />
      )}

      {/* Printable Thermal Receipt Modal */}
      {activeFinalReceipt && (
        <ThermalReceipt
          data={activeFinalReceipt}
          onClose={() => setActiveFinalReceipt(null)}
        />
      )}

      {/* Bulk Delete Dialog */}
      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedOrderIds.length} Selected Orders`}
        description={`Are you sure you want to delete ${selectedOrderIds.length} selected orders? All associated invoice and payment records will be permanently removed.`}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
