"use client";

import React, { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "./order-status-badge";
import { formatCurrency } from "@/lib/utils";
import { ThermalReceipt } from "@/components/billing/thermal-receipt";
import { CancelOrderModal } from "./cancel-order-modal";
import {
  Printer,
  XCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Utensils,
  ShoppingBag,
  Truck,
  CreditCard,
  ChefHat,
  AlertTriangle,
  Receipt,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface OrderDetailsDrawerProps {
  orderId: string | null;
  onClose: () => void;
  onOrderCancelled?: () => void;
}

export function OrderDetailsDrawer({
  orderId,
  onClose,
  onOrderCancelled,
}: OrderDetailsDrawerProps) {
  const { user } = useAuth();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOrder(json.data);
      } else {
        toast.error(json.error || "Failed to load order details");
      }
    } catch (error) {
      console.error("Fetch order detail error:", error);
      toast.error("Network error loading order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handlePrintReceipt = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/billing/invoices/${orderId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setReceiptData(json.data);
      } else {
        toast.error(json.error || "Failed to load thermal receipt");
      }
    } catch (error) {
      console.error("Thermal receipt fetch error:", error);
      toast.error("Network error fetching thermal receipt");
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Order #${order?.orderNumber} has been cancelled.`);
        await fetchOrderDetails();
        if (onOrderCancelled) onOrderCancelled();
      } else {
        toast.error(json.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error("Network error cancelling order");
    }
  };

  if (!orderId) return null;

  const isCompleted = order?.status === "COMPLETED";
  const isCancelled = order?.status === "CANCELLED";
  const isPaid = !!order?.invoice?.payment;
  const canCancel = !isCancelled && (!isCompleted || user?.role === "ADMIN");

  return (
    <>
      <Drawer
        isOpen={!!orderId}
        onClose={onClose}
        title={order ? `Order #${order.orderNumber}` : "Loading Order Details..."}
      >
        {isLoading ? (
          <div className="space-y-4 p-2">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : order ? (
          <div className="space-y-6 pb-6 animate-in fade-in duration-200">
            {/* Top Status & Payment Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl text-white shadow-md">
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} size="lg" />
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                    isPaid ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isPaid ? "PAID" : "UNPAID"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isPaid && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintReceipt}
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold"
                    leftIcon={<Printer className="h-4 w-4" />}
                  >
                    Print Receipt
                  </Button>
                )}

                {canCancel && (
                  <Button
                    size="sm"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                    leftIcon={<XCircle className="h-4 w-4" />}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Cancellation Banner (If Cancelled) */}
            {isCancelled && (
              <div className="rounded-3xl bg-rose-50 border border-rose-200 p-4 space-y-1">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>Order Cancelled</span>
                </div>
                <div className="text-xs text-rose-800 space-y-0.5 pl-7">
                  <p><span className="font-bold">Reason:</span> {order.cancellationReason || "No reason provided"}</p>
                  <p><span className="font-bold">Cancelled By:</span> {order.cancelledBy?.name || "Staff"}</p>
                  <p><span className="font-bold">Cancelled At:</span> {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : "N/A"}</p>
                </div>
              </div>
            )}

            {/* Overview Metadata Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Order Info */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Order Info</p>
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Type:</span>
                  <span className="flex items-center gap-1">
                    {order.type === "DINE_IN" && <Utensils className="h-3.5 w-3.5 text-amber-500" />}
                    {order.type === "TAKEOUT" && <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />}
                    {order.type === "DELIVERY" && <Truck className="h-3.5 w-3.5 text-purple-500" />}
                    {order.type === "DINE_IN" ? "Dine In" : order.type === "TAKEOUT" ? "Take Away" : "Delivery"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Cashier:</span>
                  <span className="font-bold text-slate-800">{order.cashier?.name || "Staff"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Invoice:</span>
                  <span className="font-mono font-bold text-pizza-600">{order.invoice?.invoiceNumber || "Not Generated"}</span>
                </div>
              </div>

              {/* Table / Customer Info */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Target Info</p>
                {order.type === "DINE_IN" ? (
                  <>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Table #:</span>
                      <span className="text-amber-600 font-extrabold">Table {order.tableNumber || order.table?.tableNumber || "N/A"}</span>
                    </div>
                    <div className="text-slate-600 truncate">
                      <span>Customer: </span>
                      <span className="font-medium">{order.customer?.name || "Walk-in Guest"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between font-bold text-slate-800 truncate">
                      <span>Customer:</span>
                      <span className="truncate">{order.customer?.name || "Walk-in Guest"}</span>
                    </div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Phone:</span>
                      <span className="font-mono font-bold">{order.customer?.phone || "N/A"}</span>
                    </div>
                    {order.customer?.address && (
                      <p className="text-[11px] text-slate-500 truncate pt-0.5">Address: {order.customer.address}</p>
                    )}
                  </>
                )}
              </div>

              {/* Payment Summary */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Payment Summary</p>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-sm font-black text-pizza-600">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Method:</span>
                  <span className="font-bold text-slate-800">{order.invoice?.payment?.method || "Not Paid"}</span>
                </div>
                {order.invoice?.payment?.paidAt && (
                  <p className="text-[10px] text-slate-400">Paid: {new Date(order.invoice.payment.paidAt).toLocaleTimeString()}</p>
                )}
              </div>
            </div>

            {/* Itemized Order Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-pizza-500" />
                Order Line Items ({order.items.length})
              </h4>

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Item Details</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {order.items.map((item: any) => {
                      let toppings: any[] = [];
                      if (Array.isArray(item.selectedToppings)) {
                        toppings = item.selectedToppings;
                      } else if (typeof item.selectedToppings === "string") {
                        try { toppings = JSON.parse(item.selectedToppings); } catch (e) {}
                      }

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 space-y-0.5">
                            <p className="font-bold text-slate-900">{item.productName}</p>
                            <div className="text-[11px] text-slate-500 space-x-2">
                              {item.sizeName && <span>Size: <strong className="text-slate-700">{item.sizeName}</strong></span>}
                              {item.extraCheese && <span className="text-amber-600 font-bold">+ Extra Cheese</span>}
                            </div>
                            {toppings.length > 0 && (
                              <p className="text-[10px] text-slate-500">
                                + Toppings: {toppings.map((t) => t.name).join(", ")}
                              </p>
                            )}
                            {item.itemNotes && (
                              <p className="text-[10px] text-pizza-600 italic">Note: {item.itemNotes}</p>
                            )}
                          </td>
                          <td className="p-3 text-center font-black">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                          <td className="p-3 text-right font-black text-slate-900 font-mono">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown Box */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 bg-slate-900 text-white rounded-3xl p-4 space-y-2 shadow-lg">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400 font-bold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Tax (16%):</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-pizza-400 pt-2 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Kitchen KOT Status Timeline Box */}
            {order.kitchenOrder && (
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ChefHat className="h-4 w-4 text-pizza-500" />
                    Kitchen Order Ticket ({order.kitchenOrder.kotNumber})
                  </h4>
                  <OrderStatusBadge status={order.kitchenOrder.status} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] border-t border-slate-200/80">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Started At</p>
                    <p className="font-mono font-semibold text-slate-700">
                      {order.kitchenOrder.startedAt ? new Date(order.kitchenOrder.startedAt).toLocaleTimeString() : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Ready At</p>
                    <p className="font-mono font-semibold text-slate-700">
                      {order.kitchenOrder.readyAt ? new Date(order.kitchenOrder.readyAt).toLocaleTimeString() : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Completed At</p>
                    <p className="font-mono font-semibold text-slate-700">
                      {order.kitchenOrder.completedAt ? new Date(order.kitchenOrder.completedAt).toLocaleTimeString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* Cancel Order Confirmation Modal */}
      {isCancelModalOpen && order && (
        <CancelOrderModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          orderNumber={order.orderNumber}
          isPaid={isPaid}
        />
      )}

      {/* Thermal Receipt Print Popup */}
      {receiptData && (
        <ThermalReceipt data={receiptData} onClose={() => setReceiptData(null)} />
      )}
    </>
  );
}
