"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { RecentOrderItem } from "@/types/dashboard";
import { Table } from "@/components/ui/table";
import { StatusChip } from "@/components/ui/status-chip";
import { SearchInput } from "@/components/ui/search-input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, ShoppingBag, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface RecentOrdersTableProps {
  orders: RecentOrderItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function RecentOrdersTable({ orders, isLoading = false, onRefresh }: RecentOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<RecentOrderItem | null>(null);

  // Selection & Deletion state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.cashierName.toLowerCase().includes(query) ||
      order.type.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  const isAllSelected =
    filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
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

  const handleDeleteSingle = async () => {
    if (!deletingId) return;
    try {
      setIsBulkDeleting(true);
      const res = await fetch(`/api/orders/${deletingId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to delete order");
        return;
      }
      toast.success("Order deleted successfully!");
      setDeletingId(null);
      setSelectedOrderIds((prev) => prev.filter((id) => id !== deletingId));
      if (onRefresh) onRefresh();
      else window.location.reload();
    } catch (error) {
      console.error("Delete order error:", error);
      toast.error("Network error deleting order");
    } finally {
      setIsBulkDeleting(false);
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
      setShowBulkConfirm(false);
      if (onRefresh) onRefresh();
      else window.location.reload();
    } catch (error) {
      console.error("Bulk delete orders error:", error);
      toast.error("Network error deleting orders");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: ColumnDef<RecentOrderItem>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={isAllSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedOrderIds.includes(row.original.id)}
          onChange={(e) => handleSelectOne(row.original.id, e.target.checked)}
        />
      ),
    },
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-extrabold text-slate-900 font-mono text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {row.original.orderNumber}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer / Type",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-slate-900">{row.original.customerName}</p>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {row.original.type.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusChip status={row.original.status} />,
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-extrabold text-slate-900">{formatCurrency(row.original.totalAmount)}</span>
      ),
    },
    {
      accessorKey: "itemsCount",
      header: "Items",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.original.itemsCount} {row.original.itemsCount === 1 ? "item" : "items"}
        </span>
      ),
    },
    {
      accessorKey: "cashierName",
      header: "Cashier",
      cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.cashierName}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Time",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-medium">{formatDate(row.original.createdAt, "HH:mm")}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOrder(row.original)}
            leftIcon={<Eye className="h-3.5 w-3.5" />}
          >
            Details
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeletingId(row.original.id)}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-pizza-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Orders Feed</h3>
            <p className="text-xs text-slate-500">Live order activity from counter and kitchen</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedOrderIds.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBulkConfirm(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Selected ({selectedOrderIds.length})
            </Button>
          )}

          <div className="w-full sm:w-72">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Filter order #, customer..."
            />
          </div>
        </div>
      </div>

      {/* TanStack Data Table */}
      <Table columns={columns} data={filteredOrders} isLoading={isLoading} pageSize={5} />

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Ticket: ${selectedOrder.orderNumber}`}
          description={`Processed by ${selectedOrder.cashierName} at ${formatDate(selectedOrder.createdAt, "PPP HH:mm")}`}
          footer={
            <Button size="sm" onClick={() => setSelectedOrder(null)}>
              Close Ticket
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-500">Customer:</span>
                <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Order Type:</span>
                <p className="font-bold text-slate-900">{selectedOrder.type.replace("_", " ")}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Current Status:</span>
                <div className="mt-1">
                  <StatusChip status={selectedOrder.status} />
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Total Amount:</span>
                <p className="font-extrabold text-pizza-600 text-sm">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Single Delete Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Order"
        description="Are you sure you want to delete this order record? This action cannot be undone."
        isLoading={isBulkDeleting}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmationDialog
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedOrderIds.length} Selected Orders`}
        description={`Are you sure you want to delete ${selectedOrderIds.length} selected orders? All associated invoice and payment records will be permanently removed.`}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
