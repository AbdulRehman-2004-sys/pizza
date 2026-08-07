"use client";

import React, { useEffect, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { PaymentModal } from "@/components/billing/payment-modal";
import { ThermalReceipt } from "@/components/billing/thermal-receipt";
import {
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  Utensils,
  ShoppingBag,
  Truck,
  RefreshCw,
  Receipt,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("READY");

  // Payment & Receipt Modal States
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any | null>(null);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch("/api/billing/ready-orders");
      const json = await res.json();
      if (res.ok && json.success) {
        setOrders(json.data);
      }
    } catch (error) {
      console.error("Failed to load billing orders:", error);
      if (!silent) toast.error("Failed to load billing orders");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrintReceipt = async (orderId: string) => {
    try {
      const res = await fetch(`/api/billing/invoices/${orderId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setReceiptData(json.data);
      } else {
        toast.error(json.error || "Failed to load receipt details");
      }
    } catch (error) {
      console.error("Fetch receipt error:", error);
      toast.error("Network error loading receipt");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.invoice?.invoiceNumber && order.invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.tableNumber && order.tableNumber.toString().includes(searchQuery));

    const matchesStatus =
      selectedStatus === "ALL" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const readyCount = orders.filter((o) => o.status === "READY").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Billing & Payment Terminal</h1>
            <p className="text-xs text-slate-500">Record customer payments, generate invoices, and print thermal receipts</p>
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

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase">Ready for Payment</p>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">{readyCount}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-emerald-200/60 text-emerald-800">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4 border border-blue-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-800 uppercase">Paid & Completed</p>
            <p className="text-2xl font-black text-blue-900 mt-0.5">{completedCount}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-blue-200/60 text-blue-800">
            <CheckCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-4 text-white flex items-center justify-between col-span-2 sm:col-span-1 shadow-lg">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Paid Revenue</p>
            <p className="text-2xl font-black text-pizza-400 mt-0.5">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-xl p-2.5 bg-slate-800 text-pizza-400">
            <Receipt className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Controls: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedStatus("READY")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "READY"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Ready Orders ({readyCount})
          </button>

          <button
            onClick={() => setSelectedStatus("COMPLETED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "COMPLETED"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Paid & Completed ({completedCount})
          </button>

          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Billing History
          </button>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Search order # or invoice #..."
          />
        </div>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === "COMPLETED";

            return (
              <div
                key={order.id}
                className={`rounded-3xl bg-white border border-slate-200 shadow-soft hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 ${
                  isCompleted ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-emerald-500"
                }`}
              >
                <div>
                  {/* Order Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                      {order.invoice && (
                        <p className="text-[10px] text-slate-400 font-mono font-bold">
                          Inv: {order.invoice.invoiceNumber}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {order.type === "DINE_IN" && <Utensils className="h-3 w-3 text-amber-500" />}
                        {order.type === "TAKEOUT" && <ShoppingBag className="h-3 w-3 text-blue-500" />}
                        {order.type === "DELIVERY" && <Truck className="h-3 w-3 text-purple-500" />}
                        {order.type === "DINE_IN"
                          ? `Table #${order.tableNumber}`
                          : order.type === "DELIVERY"
                          ? order.customer?.name || "Delivery"
                          : "Take Away"}
                      </span>

                      <Badge variant={isCompleted ? "success" : "warning"}>
                        {isCompleted ? "Paid & Completed" : "Awaiting Payment"}
                      </Badge>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="space-y-1 text-xs text-slate-600">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="font-medium truncate">{item.quantity}x {item.productName}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary & Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Grand Total</span>
                    <span className="text-xl font-black text-pizza-600">{formatCurrency(order.totalAmount)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCompleted ? (
                      <Button
                        size="sm"
                        onClick={() => setSelectedOrderForPayment(order)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        leftIcon={<CreditCard className="h-4 w-4" />}
                      >
                        Process Payment & Invoice
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintReceipt(order.id)}
                        className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 font-bold"
                        leftIcon={<Printer className="h-4 w-4 text-pizza-500" />}
                      >
                        Print Thermal Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No orders found"
          description="Ready orders from the kitchen display will appear here for billing."
          icon={Receipt}
        />
      )}

      {/* Payment Processing Modal */}
      {selectedOrderForPayment && (
        <PaymentModal
          isOpen={!!selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
          onSuccess={async (invoiceData) => {
            const paidOrderId = selectedOrderForPayment.id;
            setSelectedOrderForPayment(null);
            await fetchOrders(false);
            // Automatically open thermal receipt slip modal for cashier!
            if (paidOrderId) {
              handlePrintReceipt(paidOrderId);
            }
          }}
          order={selectedOrderForPayment}
        />
      )}

      {/* Thermal Receipt Print View */}
      {receiptData && (
        <ThermalReceipt data={receiptData} onClose={() => setReceiptData(null)} />
      )}
    </div>
  );
}
