"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { RecentOrderItem } from "@/types/dashboard";
import { Table } from "@/components/ui/table";
import { StatusChip } from "@/components/ui/status-chip";
import { SearchInput } from "@/components/ui/search-input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, ShoppingBag } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface RecentOrdersTableProps {
  orders: RecentOrderItem[];
  isLoading?: boolean;
}

export function RecentOrdersTable({ orders, isLoading = false }: RecentOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<RecentOrderItem | null>(null);

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

  const columns: ColumnDef<RecentOrderItem>[] = [
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
      header: "View",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedOrder(row.original)}
          leftIcon={<Eye className="h-3.5 w-3.5" />}
        >
          Details
        </Button>
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
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Filter order #, customer..."
          />
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

            <div className="border-t border-slate-100 pt-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Order Items ({selectedOrder.itemsCount})</h4>
              <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1.5 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span>1x Pepperoni Supreme Pizza (Large)</span>
                  <span className="font-bold">{formatCurrency(selectedOrder.totalAmount * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Garlic Parmesan Wings (10pcs)</span>
                  <span className="font-bold">{formatCurrency(selectedOrder.totalAmount * 0.4)}</span>
                </div>
                <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
